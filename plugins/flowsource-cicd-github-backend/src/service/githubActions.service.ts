import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { apiRequest } from './apiRequest';
import AdmZip from 'adm-zip';
import { LoggerService } from '@backstage/backend-plugin-api';

export class GithubActionsService {
  githubApp: any;
  gitBaseUrl: string = '';
  token: string = '';
  gitToken: string = '';
  logger: LoggerService;

  constructor(gitToken: any, gitBaseUrl: string, logger: LoggerService) {
    // Constructor initializes the GitHub base URL and token
    this.gitBaseUrl = gitBaseUrl;
    this.gitToken = gitToken;
    this.logger = logger;
  }

  async fetchInstallationId(githubApp: any) {
    // Creates an Octokit instance for app authentication
    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: githubApp.appId,
        privateKey: githubApp.privateKey,
        clientId: githubApp.clientId,
        clientSecret: githubApp.clientSecret,
      },
    });

    // Fetches the installation ID for the GitHub app
    const { data: installations } = await appOctokit.apps.listInstallations();
    if (installations.length === 0) {
      throw new Error('No installation id found for this app.');
    }
    return installations[0].id;
  }

  async initializeGithubApp(githubAppConfig: any) {
    // Fetches the installation ID and initializes the GitHub app with it
    const installationId = await this.fetchInstallationId(githubAppConfig);
    const auth = createAppAuth({
      appId: githubAppConfig.appId,
      privateKey: githubAppConfig.privateKey,
      clientId: githubAppConfig.clientId,
      clientSecret: githubAppConfig.clientSecret,
      installationId: installationId,
    });

    // Generates a token for the GitHub app
    const { token } = await auth({ type: 'installation' });
    this.token = token;
    this.githubApp = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: githubAppConfig.appId,
        privateKey: githubAppConfig.privateKey,
        clientId: githubAppConfig.clientId,
        clientSecret: githubAppConfig.clientSecret,
        installationId: installationId,
      },
    });

    return token;
  }

  async getMatchingWorkflowNames(
    gitOwner: string,
    gitRepo: string,
    workflowNamesParam: string,
    maxPipelineLimit: number,
  ): Promise<any> {
    // Logs the GitHub app token
    try {
      const workflowNames: string[] = workflowNamesParam.split(',');
      let matchingWorkflowsArray: any[] = [];
      const workflowsNotFound: any[] = [];
      const errorArray: string[] = [];

      // Initializes the URL for fetching workflows
      let nextPageUrl:
        | string
        | null = `${this.gitBaseUrl}/${gitOwner}/${gitRepo}/actions/workflows`;
      if (typeof this.gitToken === 'string') {
        this.token = this.gitToken;
      } else {
        this.token = await this.initializeGithubApp(this.gitToken);
      }
      while (nextPageUrl) {
        // Sets headers for the API request
        const headers = {
          Authorization: `Bearer ${this.token}`,
          Accept: '*/*',
        };
        // Makes the API request
        const res: any = await apiRequest('GET', nextPageUrl, headers, this.logger);
        if (!res.ok) {
          // Handles HTTP errors
          const errorText = await res.text();
          const error = new Error(
            `HTTP error! status: ${res.status}, Response body: ${errorText}`,
          );
          (error as any).status = res.status; // Attach status code to error object
          (error as any).response = res; // Attach response object to error object
          throw error;
        }
        const jsonResults = await res.json();
        nextPageUrl = jsonResults.next_page;

        // Handles the limit of workflows to process
        const workflowLength = workflowNames.length;
        let maxWorkflowReachedErrorMsg: string = '';
        if (workflowLength > maxPipelineLimit) {
          const removedWorkflowNames = workflowNames.splice(
            maxPipelineLimit,
            workflowLength,
          );
          maxWorkflowReachedErrorMsg = `Max allowed workflow is ${maxPipelineLimit}, following pipelines are skipped ${removedWorkflowNames.toString()}`;
          errorArray.push(maxWorkflowReachedErrorMsg);
        }

        // Processes each workflow name
        for (const workflowName of workflowNames) {
          try {
            // Finds matching workflows
            const matchingWorkflow = jsonResults.workflows.find(
              (workflow: { name: string }) =>
                workflow.name.trim() === workflowName.trim(),
            );
            if (matchingWorkflow) {
              // Fetches details for matching workflows
              const { name, id } = matchingWorkflow;
              const headers = {
                Authorization: `Bearer ${this.token}`,
                Accept: '*/*',
              };
              const response: any = await apiRequest(
                'GET',
                `${this.gitBaseUrl}/${gitOwner}/${gitRepo}/actions/workflows/${matchingWorkflow.id}/runs?page=1&per_page=1`,
                headers,
                this.logger,
              );
              if (!response.ok) {
                // Handles HTTP errors
                const errorText = await response.text();
                const error = new Error(
                  `HTTP error! status: ${response.status}, Response body: ${errorText}`,
                );
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                throw error;
              }
              const result = await response.json();

              const workflowState =
                result.workflow_runs[0].status === 'in_progress'
                  ? result.workflow_runs[0].status
                  : result.workflow_runs[0].conclusion;
              const workflowRunCount = result.total_count;
              const simplifiedWorkflow = {
                name,
                id,
                workflowState,
                workflowRunCount,
              };

              matchingWorkflowsArray.push(simplifiedWorkflow);
            } else {
              // Handles workflows not found
              workflowsNotFound.push(workflowName.trim());
            }
          } catch (err: any) {
            this.logger.error('Error getting for matchingWorkflow', err as Error);
            throw err;
          }
        }
      }

      // Formats error messages for workflows not found
      if (workflowsNotFound.length === 1) {
        errorArray.push(
          `No workflow found with the name "${workflowsNotFound[0].trim()}" in GitHub Actions. Please check the workflow name and try again.`,
        );
      } else if (workflowsNotFound.length > 1) {
        let workflowNameString = '';
        for (let i = 0; i < workflowsNotFound.length; i++) {
          if (i !== workflowsNotFound.length - 1) {
            workflowNameString += '"' + workflowsNotFound[i].trim() + '", ';
          } else {
            workflowNameString += '"' + workflowsNotFound[i].trim() + '"';
          }
        }
        errorArray.push(
          `No workflows found with names ${workflowNameString} in GitHub Actions. Please check the workflow names and try again.`,
        );
      }

      return { matchingWorkflowsArray, errorArray };
    } catch (error: any) {
      this.logger.error('Error for getting matching workflow names', error as Error);

      if(error.message && error.message.includes('Not Found')) {
        const customError = new Error(`Incorrect git owner or repo`);

        (customError as any).status = 404; // Attach status code to error object
        (customError as any).response = {
          status: 404,
          data: { message: `Incorrect git owner or repo` },
        };

        throw customError;
      } else {
        throw error;
      }
    }
  }

  async getWorkflowRunDetails(
    gitOwner: string,
    gitRepo: string,
    workflowId: number,
    durationDaysCatalog: number,
    durationConfig: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<any> {
    try {
      // Prepares to fetch workflow run details
      const responseArray: {
        id: string;
        name: string;
        conclusion: string;
        duration: string;
        url: string;
        createdAt: string;
      }[] = [];
      let gitUrl:
        | string
        | null = `${this.gitBaseUrl}/${gitOwner}/${gitRepo}/actions/workflows/${workflowId}/runs?page=${pageNumber}&per_page=${pageSize}`;
      const durationInDays = durationDaysCatalog || durationConfig;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDate = new Date(Date.now() - durationInMilliseconds);
      if (typeof this.gitToken === 'string') {
        this.token = this.gitToken;
      } else {
        this.token = await this.initializeGithubApp(this.gitToken);
      }
      const headers = {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      };
      const response: any = await apiRequest('GET', gitUrl, headers, this.logger);
      if (!response.ok) {
        // Handles HTTP errors
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const jsonResults = await response.json();
      // Processes each workflow run
      jsonResults.workflow_runs.forEach((run: any) => {
        const createdAt = new Date(run.run_started_at);
        if (createdAt < durationDate) {
          return; // Skip this run if it's older than durationInDays
        }

        // Calculates the duration of the workflow run
        const runStartedAt = new Date(run.run_started_at);
        const updatedAt = new Date(run.updated_at);
        const timeDifference = updatedAt.getTime() - runStartedAt.getTime();
        const durationInSeconds = timeDifference / 1000;

        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);

        const formattedDuration = `${hours > 0 ? hours + 'h ' : ''}${
          minutes > 0 ? minutes + 'm ' : ''
        }${seconds}s`;

        // Format the created_at date
        const formattedCreatedAt = createdAt.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });

        // Prepares the details of the workflow run
        const runDetails = {
          id: run.id,
          name: run.display_title,
          conclusion:
            run.status === 'in_progress' || run.status === 'queued'
              ? run.status
              : run.conclusion,
          duration: formattedDuration,
          url: run.html_url,
          createdAt: formattedCreatedAt, // Add formatted created_at field
        };
        responseArray.push(runDetails);
      });

      return responseArray;
    } catch (error) {
      this.logger.error('Error for getting workflow run details', error as Error);
      throw error;
    }
  }

  async getFailureDetails(
    gitOwner: string,
    gitRepo: string,
    runID: number,
  ): Promise<any> {
    try {
      // Initialize an array to store failure details
      const failureResponseDetails: {
        errorMessage: string;
        stepName: string;
      }[] = [];

      // Handle token initialization
      if (typeof this.gitToken === 'string') {
        this.token = this.gitToken;
      } else {
        this.token = await this.initializeGithubApp(this.gitToken);
      }

      // Set up headers for API requests
      const headers = {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      };

      // Initialize variables to store error message and failed step name
      let errorMessage = '';
      let failedStepName = '';

      // Construct the URL to fetch the logs of the workflow run
      const logsUrl = `${this.gitBaseUrl}/${gitOwner}/${gitRepo}/actions/runs/${runID}/logs`;
      // Make a GET request to fetch the logs
      const logsResponse = await apiRequest('GET', logsUrl, headers, this.logger);
      if (logsResponse.ok) {
        const logsBuffer = await logsResponse.buffer();
        const zip = new AdmZip(logsBuffer);
        const zipEntries = zip.getEntries();
        // Iterate through the zip entries to find the logs text
        for (const zipEntry of zipEntries) {
          const logsText = zipEntry.getData().toString('utf8');
          // Search for error messages in the logs using a regular expression
          const errorMatch = logsText.match(/##\[error\](.*)/i);
          if (errorMatch) {
            // Extract and trim the error message
            errorMessage = errorMatch[1].trim();
            break;
          }
        }
      }

      // Construct the URL to fetch the jobs of the workflow run
      const jobsUrl = `${this.gitBaseUrl}/${gitOwner}/${gitRepo}/actions/runs/${runID}/jobs`;
      // Make a GET request to fetch the jobs
      const jobsResponse = await apiRequest('GET', jobsUrl, headers, this.logger);
      if (jobsResponse.ok) {
        const jobsJson = await jobsResponse.json();
        // Iterate through the jobs and their steps
        for (const job of jobsJson.jobs) {
          for (const step of job.steps) {
            // Check if the step has a conclusion of 'failure'
            if (step.conclusion === 'failure') {
              // Assign the step name to failedStepName
              failedStepName = step.name;
              break;
            }
          }
          if (failedStepName) break;
        }
      }

      // Construct an object with the error message and failed step name
      const failureDetails = {
        errorMessage: errorMessage,
        stepName: failedStepName,
      };

      failureResponseDetails.push(failureDetails);
      // Return the array with failure details
      return failureResponseDetails;
    } catch (error) {
      this.logger.error('Error for getting workflow run details', error as Error);
      throw error;
    }
  }
}
