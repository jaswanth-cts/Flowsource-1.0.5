import { apiRequest } from './apiRequest';
import { AuthService } from './auth.service';
import { LoggerService } from '@backstage/backend-plugin-api';
class BuildDetails {
  private authService: AuthService;
  private baseUrl: string;
  logger: LoggerService;
  constructor(baseUrl: string, authService: AuthService, logger: LoggerService) {
    this.baseUrl = baseUrl;
    this.authService = authService;
    this.logger = logger;
  }
  private getAuthHeader(): any {
    return this.authService.getAuthHeader();
  }
  // This method finds the hash value for an inner job from the actions array
  private findHashValue(actions: any[]): string {
    let hashValue: string = '';
    for (const action of actions) {
      const revisionObj = action?.revision?.hash;
      const revisionObjForPR = action?.revision?.pullHash;
      if (revisionObj) {
        hashValue = revisionObj;
      } else if (revisionObjForPR) {
        hashValue = revisionObjForPR;
      }
    }
    return hashValue;
  }

  // Function to convert timestamp to formatted date and time
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    // Format the date and time as MM/DD/YYYY HH:MM based on the browser's timezone
    const options: Intl.DateTimeFormatOptions = {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const formattedDate = date.toLocaleString(undefined, options);

    return formattedDate;
  }
  //check if para or non parameterized
  async checkIfParameterized(pipelineName: string): Promise<{ isParameterized: boolean, parameters: any[] }> {
    let jobUrl: string;
    // Construct the job URL based on the pipeline name
    if (pipelineName.includes('>>')) {
      const [parentJob, branchName] = pipelineName.split('>>').map(part => part.trim());
      jobUrl = `${this.baseUrl}job/${encodeURIComponent(parentJob)}/job/${encodeURIComponent(branchName)}/api/json`;
    } else {
      jobUrl = `${this.baseUrl}job/${encodeURIComponent(pipelineName)}/api/json`;
    }
    const headersObj = this.getAuthHeader();
    const jobResponse = await apiRequest('GET', jobUrl, headersObj, this.logger);
    if (!jobResponse.ok) {
      const errorText = await jobResponse.text();
      throw new Error(`Failed to fetch job info. Status: ${jobResponse.status}, Body: ${errorText}`);
    }
    const jobData = await jobResponse.json();
    const parameters = jobData?.property?.find((prop: any) => prop._class === 'hudson.model.ParametersDefinitionProperty')?.parameterDefinitions || [];

    return {
      isParameterized: parameters.length > 0,
      parameters,
    };
  }
  async triggerPipelineBuild(pipelineName: string,parameters?: Record<string, string>): Promise<boolean> {
    const headersObj = {
      ...this.getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  
    // Construct the trigger URL
    let triggerUrl = `${this.baseUrl}job/${encodeURIComponent(pipelineName)}/`;
    triggerUrl += parameters && Object.keys(parameters).length > 0 ? 'buildWithParameters' : 'build';
  
    const formBody = parameters && Object.keys(parameters).length > 0
      ? Object.entries(parameters)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')
      : null;
  
    if (formBody) {
      triggerUrl += `?${formBody}`;
    }
  
    console.log(`Triggering pipeline at URL: ${triggerUrl}`); // Log the trigger URL
  
    const response = await apiRequest('POST', triggerUrl, headersObj, this.logger);
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger build. Status: ${response.status}, Body: ${errorText}`);
    }
  
    return true;
  }
  async triggerMultibranchPipelineBuild(pipelineName: string, branchName: string, parameters?: Record<string, string>): Promise<boolean> {
    const headersObj = {
      ...this.getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Construct the trigger URL for multibranch pipelines
    let triggerUrl = `${this.baseUrl}job/${encodeURIComponent(pipelineName)}/job/${encodeURIComponent(branchName)}/`;
    triggerUrl += parameters && Object.keys(parameters).length > 0 ? 'buildWithParameters' : 'build';

    const formBody = parameters && Object.keys(parameters).length > 0
      ? Object.entries(parameters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
      : null;

    if (formBody) {
      triggerUrl += `?${formBody}`;
    }
    const response = await apiRequest('POST', triggerUrl, headersObj, this.logger);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger multibranch build. Status: ${response.status}, Body: ${errorText}`);
    }
    return true;
  }

  async getProjectType(pipelineName: string): Promise<string> {
    // Format the pipeline name
    let formattedPipelineName: string;
    if (pipelineName.includes('>>')) {
      const pipelineNames: string[] = pipelineName.split('>>');
      formattedPipelineName = `job/${pipelineNames[0].trim()}/`;
      if (pipelineNames.length > 1) {
        formattedPipelineName += `job/${encodeURIComponent(pipelineNames[1].trim())}/`;
      }
    } else {
      formattedPipelineName = `job/${encodeURIComponent(pipelineName.trim())}/`;
    }
   
    const jobUrl = `${this.baseUrl}${formattedPipelineName}api/json`;
    const headersObj = this.getAuthHeader();
    const response = await apiRequest('GET', jobUrl, headersObj, this.logger);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch project type. Status: ${response.status}, Body: ${errorText}`);
    }
    const jobData = await response.json();
    // Check if the pipeline is a branch of a multibranch pipeline
    if (
      jobData._class === 'org.jenkinsci.plugins.workflow.job.WorkflowJob' &&
      jobData.property?.some((prop: any) => prop._class === 'org.jenkinsci.plugins.workflow.multibranch.BranchJobProperty')
    ) {
      return 'org.jenkinsci.plugins.workflow.multibranch.BranchJobProperty';
    }
    return jobData._class; 
  }
  
  async fetchBuildDetailsAndConsoleOutput(pipelineName: string, buildNumber: number, buildClass: string, buildUrl: string): Promise<{ buildData: any, errorMessage: string }> {
    const buildDetailsUrl = `${this.baseUrl}/job/${pipelineName}/${buildNumber}/api/json`;
    const headersObj = this.getAuthHeader();
    let errorMessage = '';
    let buildData: any = null;

    try {
      switch (buildClass) {
        case 'hudson.matrix.MatrixProject':
          const buildResponse = await apiRequest('GET', buildDetailsUrl, headersObj, this.logger);
          if (!buildResponse.ok) {
            const errorText = await buildResponse.text();
            const error = new Error(`HTTP error! status: ${buildResponse.status}, Response body: ${errorText}`);
            (error as any).status = buildResponse.status;
            (error as any).response = buildResponse;
            throw error;
          }
          buildData = await buildResponse.json();

          const consoleOutputPromises = buildData.runs.map(async (run: any) => {
            const consoleOutputUrl = `${run.url}consoleText`;
            const consoleOutputResponse = await apiRequest('GET', consoleOutputUrl, headersObj, this.logger);
            if (consoleOutputResponse.ok) {
              const consoleOutput = await consoleOutputResponse.text();
              return consoleOutput;
            }
            return '';
          });

          const consoleOutputs = await Promise.all(consoleOutputPromises);
          for (const consoleOutput of consoleOutputs) {
            const errorMessageMatch = consoleOutput.match(/(?:.*\n){0,3}.*\nFinished: FAILURE/);
            if (errorMessageMatch) {
              errorMessage = errorMessageMatch[0].trim();
              break;
            }
          }
          break;
        case 'hudson.model.FreeStyleProject':
          const consoleOutputUrl = `${buildUrl}consoleText`;
          const consoleOutputResponse = await apiRequest('GET', consoleOutputUrl, headersObj, this.logger);
          if (consoleOutputResponse.ok) {
            const consoleOutput = await consoleOutputResponse.text();
            const errorMessageMatch = consoleOutput.match(/(?:.*\n){0,3}.*\nFinished: FAILURE/);
            if (errorMessageMatch) {
              errorMessage = errorMessageMatch[0].trim();
            }
          }
          break;
        default:
          break;
      }
      return { buildData, errorMessage };
    } catch (error) {
      this.logger.error('Error fetching build details and console output:', error as Error);
      throw error;
    }
  }

  // New async function to fetch workflow job details
  async fetchWorkflowJobDetails(pipelineName: string, buildNumber: number, buildClass: string, buildUrl: string): Promise<any> {
    let describeUrl = `${this.baseUrl}/job/${pipelineName}/${buildNumber}/wfapi/describe`;
    if (buildClass === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject' || buildClass === 'org.jenkinsci.plugins.workflow.job.WorkflowJob') {
      describeUrl = `${buildUrl}wfapi/describe`;
    }
    const headersObj = this.getAuthHeader();
    try {
      const describeResponse = await apiRequest(
        'GET',
        describeUrl,
        headersObj,
        this.logger,
      );
      if (!describeResponse.ok) {
        const errorText = await describeResponse.text();
        const error = new Error(`HTTP error! status: ${describeResponse.status}, Response body: ${errorText}`);
        (error as any).status = describeResponse.status;
        (error as any).response = describeResponse;
        throw error;
      }

      // Parse the JSON response
      const describeData = await describeResponse.json();
      return describeData;
    } catch (error) {
      this.logger.error('Error fetching workflow job details from describe URL:', error as Error);
      throw error;
    }
  }

  async getFolderBuildDetails(pipelineDisplayName: string, pageNumber: number, pageSize: number, durationDaysCatalog: number, durationConfig: number): Promise<any[]> {
    const jobsArray: any[] = [];
    // Calculate the start and end indices for pagination
    const start = (pageNumber - 1) * pageSize;
    const end = pageNumber * pageSize;
    const durationInDays = durationDaysCatalog || durationConfig;
    const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    try {
      let pipelineNames: string[] = pipelineDisplayName.split(' &gt;&gt; ');
      let buildUrl = this.baseUrl + `job/${pipelineNames[0].trim()}/`;
      if (pipelineNames.length > 1) {
        const encodedPipelineName = encodeURIComponent(pipelineNames[1].trim());
        buildUrl += `job/${encodedPipelineName}/`;
      }
      buildUrl += `api/json?tree=_class,lastBuild[actions[*[*]]],builds[status,actions,duration,fullDisplayName,number,queueId,result,building,timestamp,url]{${start},${end}}`;
      const headersObj = this.getAuthHeader();
      const buildResponse = await apiRequest(
        'GET',
        buildUrl,
        headersObj,
        this.logger,
      );
      if (!buildResponse.ok) {
        const errorText = await buildResponse.text();
        const error = new Error(`HTTP error! status: ${buildResponse.status}, Response body: ${errorText}`);
        (error as any).status = buildResponse.status;
        (error as any).response = buildResponse;
        throw error;
      }

      // Parse the JSON response
      const data = await buildResponse.json();

      // Extract builds and lastBuild from the response
      const builds = data.builds;
      const lastBuild = data.lastBuild;

      // Log timestamps for each build
      builds.forEach((build: any) => {
        this.logger.info(`Build #${build.number} Timestamp: ${this.formatTimestamp(build.timestamp)}`);
      });

      // Extract the hash value for the current job
      const hashValue = this.findHashValue(lastBuild?.actions);

      // Iterate over each build
      for (const build of builds) {
        const durationInSeconds = build.duration / 1000;
        // Convert the duration to hours, minutes, and seconds
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;
        // If the build is within the specified duration, construct a build details object
        if (currentTime - build.timestamp <= durationInMilliseconds) {
          let errorMessage = '';
          let stageName = ''; // Declare stageName variable
          // Check the build class and handle accordingly
          switch (data._class) {
            case 'org.jenkinsci.plugins.workflow.job.WorkflowJob':
            case 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject':
              try {
                const workflowJobDetails = await this.fetchWorkflowJobDetails(pipelineNames[0].trim(), build.number, data._class, build.url);
                const failedStage = workflowJobDetails.stages?.find((stage: any) => stage.status === 'FAILED');
                errorMessage = failedStage ? failedStage.error.message : 'null';
                stageName = failedStage ? failedStage.name : 'null';
              } catch (error) {
                this.logger.error('Error fetching workflow job details:', error as Error);
              }
              break;
            case 'hudson.matrix.MatrixProject':
            case 'hudson.model.FreeStyleProject':
              try {
                const { errorMessage: fetchedErrorMessage } = await this.fetchBuildDetailsAndConsoleOutput(pipelineNames[0].trim(), build.number, data._class, build.url);
                errorMessage = fetchedErrorMessage;
              } catch (error) {
                this.logger.error('Error fetching build details and console output:', error as Error);
              }
              break;
            default:
              break;
          }
          const buildDetails = {
            name: "#" + build.number,
            status: build.building ? "In Progress" :
              build.result === 'SUCCESS' ? 'Success' :
                build.result === 'FAILURE' ? 'Failure' :
                  build.result === 'ABORTED' ? 'Aborted' :
                    build.result === 'UNSTABLE' ? 'Unstable' :
                      build.result === 'NOT_BUILT' ? 'Not Built' :
                        'unknown',
            duration: formattedDuration,
            url: build.url,
            id: hashValue && hashValue.length > 0 ? hashValue.slice(0, 8) : '', // Include only the first 8 characters if hash value found
            errorMessage: errorMessage,
            stageName: stageName,
            dateandtime: this.formatTimestamp(build.timestamp),
            projectType: data._class === 'org.jenkinsci.plugins.workflow.job.WorkflowJob' || data._class === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject' ? 'pipeline-multibranch' : data._class === 'hudson.model.FreeStyleProject' || data._class === 'hudson.matrix.MatrixProject' ? 'freestyle-multiconfig' : 'others',
          };
          jobsArray.push(buildDetails);
        }
      }
      return jobsArray;
    } catch (error) {
      this.logger.error('Error fetching build details:', error as Error);
      throw error;
    }
  }
}
export default BuildDetails;
