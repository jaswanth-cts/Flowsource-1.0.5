import AuthService from './auth.Service';
import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

class GcpService {
  private authService: AuthService;
  logger: LoggerService;

  constructor(authService: AuthService, logger: LoggerService) {
    this.authService = authService;
    this.logger = logger;
  }

  async getKeyByValue(object: any, value: any) {
    return Object.keys(object).find(key => object[key] === value);
  }

  async getBuildDetails(triggerNames: string[], region: string) {
    try {
      const source = {
        github: (await this.authService.getSource()) === 'true',
      };
      const bearerToken = await this.authService.getCredentials();
      const projectId = await this.authService.getProjectId();
      let errorArrayPipeline: string[] = [];
      let errorArray: string = '';
      const latestBuilds = [];
      let gitOwner = '';
      if (source.github) {
        let triggers: any[] = [];
        let nextPageToken = '';
        do {
          const response = await apiRequest(
            'GET',
            `https://cloudbuild.googleapis.com/v1/projects/${projectId}/locations/${region}/triggers`,
            {
              Authorization: `Bearer ${bearerToken}`,
            },
            this.logger,
            undefined,
            {
              fields: 'triggers(id,name),nextPageToken',
              pageToken: nextPageToken,
            },
          );
          
          if (!response.ok) {
            const errorText = await response.text();

            if(errorText.includes('Request contains an invalid argument')) 
            {
              const customError = new Error(`Invalid GCP Region`);

              (customError as any).status = 404; // Attach status code to error object
              (customError as any).response = {
                status: 404,
                data: { message: `Invalid GCP Region` },
              };
                
              throw customError;
            };
          };
          
          const data = await response.json();

          triggers = triggers.concat(data.triggers);
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        const triggerMap = new Map(
          triggers.map(trigger => [trigger.name, trigger]),
        );
        const filteredTriggers = triggerNames
          .map(name => triggerMap.get(name))
          .filter(Boolean);
        triggerNames.forEach((triggerName: string) => {
          if (
            !filteredTriggers.find(
              (trigger: any) => trigger.name === triggerName,
            )
          ) {
            errorArrayPipeline.push(triggerName);
          }
        });
        const buildPromises = filteredTriggers.map(
          async (trigger: { id: string; name: string }) => {
            const url = `https://cloudbuild.googleapis.com/v1/projects/${projectId}/locations/${region}/builds`;
            const params = {
              filter: `trigger_id=${trigger.id}`,
              pageSize: '1',
              fields: 'builds(status,source.gitSource.url)',
            };

            const buildsResponse = await apiRequest(
              'GET',
              url,
              {
                Authorization: `Bearer ${bearerToken}`,
              },
              this.logger,
              undefined,
              params,
            );
            const data = await buildsResponse.json();
            return data.builds;
          },
        );
        const allBuilds = await Promise.all(buildPromises);
        for (let i = 0; i < filteredTriggers.length; i++) {
          const trigger = filteredTriggers[i];
          const builds = allBuilds[i];
          const latestBuild = builds[0];

          const gitUrl = new URL(latestBuild.source.gitSource.url);
          gitOwner = gitUrl.pathname.substring(1);
          gitOwner = gitOwner.replace('.git', '');

          latestBuilds.push({
            id: trigger.id,
            name: trigger.name,
            workflowState: this.getStatus(latestBuild.status),
          });
        }
      } else {
        errorArray = (await this.getKeyByValue(source, source.github)) || '';
      }

      let pipelineError = '';
      if (errorArrayPipeline.length === 1) {
        pipelineError = `No pipelines found with the name "${errorArrayPipeline[0].trim()}" in GCP Cloud Build. Please check the pipeline name and try again.`;
      } else if (errorArrayPipeline.length > 1) {
        let pipelineNameString = '';
        for (let i = 0; i < errorArrayPipeline.length; i++) {
          if (i !== errorArrayPipeline.length - 1) {
            pipelineNameString += '"' + errorArrayPipeline[i].trim() + '", ';
          } else {
            pipelineNameString += '"' + errorArrayPipeline[i].trim() + '"';
          }
        }
        pipelineError = `No pipelines found with names ${pipelineNameString} in GCP Cloud Build. Please check the pipeline names and try again.`;
      }

      const sourceError = `Error fetching GCP code pipeline source ${errorArray} not Enabled, with status code 404.`;

      const clientErrorMessage = {
        pipelineError: errorArrayPipeline.length ? pipelineError : null,
        sourceError: errorArray.length ? sourceError : null,
      };
      return { latestBuilds, clientErrorMessage, gitOwner };
    } catch (error) {
      this.logger.error('Error retrieving build details:', error as Error);
      throw error;
    }
  }

  async getBatchBuildDetails(triggerId: string[], durationDate: Date, region: string) {
    try {
      const bearerToken = await this.authService.getCredentials();
      const projectId = await this.authService.getProjectId();
      let nextPageToken = '';
      let builds: any[] = [];
      do {
        const response = await apiRequest(
          'GET',
          `https://cloudbuild.googleapis.com/v1/projects/${projectId}/locations/${region}/builds`,
          {
            Authorization: `Bearer ${bearerToken}`,
          },
          this.logger,
          undefined,
          {
            filter: `trigger_id=${triggerId}`,
            pageSize: '100',
            pageToken: nextPageToken,
            fields:
              'builds(id,startTime,finishTime,status,logUrl,sourceProvenance.resolvedGitSource.revision,source.gitSource.url,steps,status,failureInfo),nextPageToken',
          },
        );
        const data = await response.json();
        builds = builds.concat(data.builds || []);
        nextPageToken = data.nextPageToken;
  
        const lastBuild = builds[builds.length - 1];
        if (lastBuild && lastBuild.startTime > durationDate) {
          break;
        }
      } while (nextPageToken);
  
      builds = builds.filter((build: any) => {
        const buildStartedAfterCurrentDate =
          build.startTime && new Date(build.startTime) > durationDate;
        return buildStartedAfterCurrentDate;
      });
  
      const latestBuilds = builds.map(async (build: any) => {
        let updatedBuildNumber = build.id;
  
        const startTime = build.startTime ? new Date(build.startTime) : null;
        const finishTime = build.finishTime ? new Date(build.finishTime) : null;
        const durationInSeconds =
          finishTime && startTime
            ? (finishTime.getTime() - startTime.getTime()) / 1000
            : 0;
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        let duration = `${seconds}s`;
        if (minutes > 0) {
          duration = `${minutes}m ` + duration;
        }
        if (hours > 0) {
          duration = `${hours}h ` + duration;
        }
        const commitId = build.sourceProvenance.resolvedGitSource.revision;
        const url = build.source.gitSource.url;
        const path = new URL(url).pathname;
        const gitOwner = path.slice(1, path.lastIndexOf('.'));
  
        const commitMessage = await this.getCommitMessage(commitId, gitOwner);
  
        const failureDetails = build.status === 'FAILURE' ? {
          stageName: build.steps.find((step:any) => step.status === 'FAILURE')?.id || build.steps.find((step:any) => step.status === 'FAILURE')?.name || 'Unknown',
          buildUrl: build.logUrl,
          failureMessage: build.failureInfo?.detail || 'No failure detail available'
        } : null;
  
        return {
          id: updatedBuildNumber,
          name: commitMessage,
          conclusion: this.getStatus(build.status),
          url: build.logUrl,
          duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
          startTime: build.startTime, // Include startTime in the response
          failureDetails: failureDetails
        };
      });
      const workflowRunCount = builds.length;
      const latestBuild = await Promise.all(latestBuilds);
      return { latestBuild, workflowRunCount };
    } catch (error) {
      this.logger.error('Error retrieving build details:', error as Error);
      throw error;
    }
  }

  async getCommitMessage(commitId: string, gitOwner: string): Promise<any> {
    const gitToken = await this.authService.getExternalSourceCredentials();

    const headers = {
      Authorization: `Bearer ${gitToken}`,
    };
    let commitMessage = '';
    const url = `https://api.github.com/repos/${gitOwner}/commits/${commitId}`;
    try {
      const response = await apiRequest('GET', url, headers, this.logger);
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      let responseBody = await response.json(); // Parse JSON response
      commitMessage = responseBody.commit?.message;
      return commitMessage;
    } catch (error) {
      this.logger.error('Error getting commit message:', error as Error);
    }
  }

  getStatus = (status: any) => {
    switch (status) {
      case "WORKING":
        return "In Progress";
      case "SUCCESS":
        return "Success";
      case "FAILURE":
        return "Failure";
      case "PENDING":
        return "Awaiting Approval";
      case "TIMEOUT":
        return "Timeout";
      case "CANCELLED":
        return "Cancelled";
      case "EXPIRED":
        return "Expired";
      case "QUEUED":
        return "Queued";
      default:
        return "Unknown";
    }
  };
}

export default GcpService;
