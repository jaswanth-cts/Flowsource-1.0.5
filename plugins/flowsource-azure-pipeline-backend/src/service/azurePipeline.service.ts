import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';
export class AzurePipelineService {
  private headers: any;
  logger: LoggerService;
  constructor(
    private baseUrl: string,
    logger: LoggerService,
    private token: string,
    private orgName: string,
  ) {
    (this.baseUrl = `${this.baseUrl}/${this.orgName}`),
      (this.headers = {
        Authorization: `Basic ${Buffer.from(`:${this.token}`).toString(
          'base64',
        )}`,
      });
      (this.logger = logger);
  }

  async getPipelineDetails(
    projectName: string,
    pipelineNamesParam: string,
    maxPipelineLimit: number,
  ): Promise<any> {
    try {
      let pipelineNames: string[] = pipelineNamesParam.split(',');

      let matchingPipelinesArray: any[] = [];
      const pipelinesNotFound: any[] = [];
      const errorArray: string[] = [];

      const getPipelineUrl: string = `${this.baseUrl}/${projectName}/_apis/pipelines?api-version=6.0-preview.1`;
      const res = await apiRequest('GET', getPipelineUrl, this.headers, this.logger);
      if (!res.ok) {
        const errorText = await res.text();

        if (errorText.includes('The following project does not exist')) {
          const customError = new Error(`Project "${projectName}" not found`);

          (customError as any).status = 404; // Attach status code to error object
          (customError as any).response = {
            status: 404,
            data: { message: `Project "${projectName}" not found` },
          };

          throw customError;
        } else {
          const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
          (error as any).status = res.status; // Attach status code to error object
          (error as any).response = {
            status: res.status,
            data: { message: res },
          };
          throw error;
        }
      }
      const jsonResults = await res.json();
      const pipelineLenth = pipelineNames.length;
      let maxPipelineReachedErrorMsg: string = '';
      if (pipelineLenth > maxPipelineLimit) {
        const removedPipelineNames = pipelineNames.splice(
          maxPipelineLimit,
          pipelineLenth,
        );
        maxPipelineReachedErrorMsg = `Max allowed pipelines is ${maxPipelineLimit}, following pipelines are skipped ${removedPipelineNames.toString()}`;
        errorArray.push(maxPipelineReachedErrorMsg);
      }
      for (const pipelineName of pipelineNames) {
        try {
          const matchingPipeline = jsonResults.value.find(
            (pipeline: { name: string }) => {
              return pipeline.name.trim() === pipelineName.trim();
            },
          );

          if (matchingPipeline) {
            const { name, id } = matchingPipeline;
            const response = await apiRequest(
              'GET',
              `${this.baseUrl}/${projectName}/_apis/pipelines/${id}/runs?api-version=7.1`,
              this.headers,
              this.logger,
            );
            if (!response.ok) {
              const errorText = await response.text();
              const error = new Error(
                `HTTP error! status: ${response.status}, Response body: ${errorText}`,
              );
              (error as any).status = response.status; // Attach status code to error object
              (error as any).response = response; // Attach response object to error object
              throw error;
            }
            const result = await response.json();
            let status = '';
            if (result.value[0]?.state === 'inProgress') {
              status = result.value[0]?.state;
            } else {
              status = result.value[0]?.result;
            }
            const simplifiedPipeline = { id, name, status };

            matchingPipelinesArray.push(simplifiedPipeline);
          } else {
            pipelinesNotFound.push(pipelineName.trim());
          }
        } catch (err: any) {
          this.logger.error('Error', err);
          throw err;
        }
      }

      if (pipelinesNotFound.length === 1) {
        errorArray.push(`No pipelines found with the name "${pipelinesNotFound[0].trim()}" in Azure Pipelines. Please check the pipeline name and try again.`);
      } else if (pipelinesNotFound.length > 1) {
        let pipelineNameString = '';
        for (let i = 0; i < pipelinesNotFound.length; i++) {
          if (i !== pipelinesNotFound.length - 1) {
            pipelineNameString += '"' + pipelinesNotFound[i].trim() + '", ';
          } else {
            pipelineNameString += '"' + pipelinesNotFound[i].trim() + '"';
          }
        }
        errorArray.push(`No pipelines found with names ${pipelineNameString} in Azure Pipelines. Please check the pipeline names and try again.`);
      }

      return { matchingPipelinesArray, errorArray };
    } catch (error) {
      this.logger.error('Error for getting pipeline details:', error as Error);
      throw error;
    }
  }

  async getRunDetails(
    projectName: string,
    pipelineId: number,
    durationDaysCatalog: number,
    durationConfig: number,
  ): Promise<any> {
    try {
      let pipelineRunDetails: any[] = [];
      const response = await apiRequest(
        'GET',
        `${this.baseUrl}/${projectName}/_apis/pipelines/${pipelineId}/runs?api-version=6.0-preview.1`,
        this.headers,
        this.logger,
      );
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const result = await response.json();
      const selfHref = result?.value?.[0]?._links?.self?.href; // Safely access the self href
      const buildUriId =
        selfHref?.match(/dev\.azure\.com\/[^/]+\/([^/]+)/)?.[1] || null; // Extract the GUID or set to null
      const runNumber = selfHref?.match(/\/runs\/(\d+)/)?.[1] || null;
      const firstHref = result?.value?.[0]?._links?.self?.href;

      if (!firstHref) {
        throw new Error('No href found in the first pipeline run.');
      }

      // Hit the first href API
      const branchResponse = await apiRequest('GET', firstHref, this.headers, this.logger);

      if (!branchResponse.ok) {
        const errorText = await branchResponse.text();
        const error = new Error(
          `HTTP error! status: ${branchResponse.status}, Response body: ${errorText}`,
        );
        (error as any).status = branchResponse.status;
        (error as any).response = branchResponse;
        throw error;
      }

      const branchDetails = await branchResponse.json();

      const ref = branchDetails?.yamlDetails?.rootYamlFile?.ref;
      const defaultBranchName = ref?.split('/').pop(); // Extracts 'alm-test'

      if (!defaultBranchName) {
        throw new Error('Branch name could not be extracted from the ref.');
      }

      const pipelineRunCount = result.count;
      const durationInDays = durationDaysCatalog || durationConfig;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDate = new Date(Date.now() - durationInMilliseconds);

      await Promise.all(
        result.value.map(async (run: any) => {
          const createdAt = new Date(run.createdDate);
          let status = 'N/A';
          let message = 'N/A';
          let stageName = 'N/A';
          if (createdAt < durationDate) {
            return; // Skip this run if it's older than durationInDays
          }
          const url = `${this.baseUrl}/${buildUriId}/_apis/build/builds/${run.id}/sources?api-version=6.0`;
          const commitResponse = await apiRequest('GET', url, this.headers, this.logger);
          const commit = await commitResponse.json();
          let commitMessage = 'N/A';
          commitMessage = commit?.comment ?? 'N/A';
          if (run.state === 'inProgress') {
            status = 'In Progress';
          } else {
            if (run.result === 'succeeded') {
              status = 'Success';
            } else {
              status = 'Cancelled';
            }
          }

          if (run.result === 'failed') {
            status = 'Failed';
            const response = await apiRequest(
              'GET',
              `${this.baseUrl}/${projectName}/_apis/build/builds/${run.id}/timeline?api-version=6.0`,
              this.headers,
              this.logger,
            );
            if (!response.ok) {
              const errorText = await response.text();
              const error = new Error(
                `HTTP error! status: ${response.status}, Response body: ${errorText}`,
              );
              (error as any).status = response.status; // Attach status code to error object
              (error as any).response = response; // Attach response object to error object
              throw error;
            }
            const result = await response.json();
            result.records.forEach((record: any) => {
              // Check if issues array exists and is an array
              if (Array.isArray(record.issues)) {
                stageName = record.name;
                record.issues.forEach((issue: any) => {
                  message = issue.message;
                });
              }
            });
          }

          pipelineRunDetails.push({
            id: run?.id ?? 'N/A',
            name: run?.name ?? 'N/A',
            commitMessage: commitMessage ?? 'N/A',
            url: run?._links?.web?.href ?? 'N/A',
            status: status ?? 'N/A',
            message: message ?? 'N/A',
            stageName: stageName,
            runNumber: runNumber,
            defaultBranchName: defaultBranchName,
          });
        }),
      );
      // Sort pipelineRunDetails by a specific property, e.g., 'id'
      pipelineRunDetails.sort((a, b) => b.id - a.id);
      return { pipelineRunDetails, pipelineRunCount };
    } catch (error) {
      this.logger.error('Error for getting run details:', error as Error);
      throw error;
    }
  }

  // Fetch details of a specific build
  async fetchBuildDetails(projectName: string, buildId: number) {
    try {
      const response = await apiRequest(
        'GET',
        `${this.baseUrl}/${projectName}/_apis/build/builds/${buildId}?api-version=6.0`,
        this.headers,
        this.logger,
      );
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const result = await response.json();
      return result;
    } catch (error) {
      this.logger.error(`Error fetching details for build ${buildId}:`, error as Error);
      return null;
    }
  }

  async getBuildDetails(projectName: string, runDetails: any[]): Promise<any> {
    try {
      const buildDetails: any[] = [];

      await Promise.all(
        runDetails.map(async (runDetail: any) => {
          const buildDetail = await this.fetchBuildDetails(
            projectName,
            runDetail.id,
          );
          const startTime = new Date(buildDetail.startTime);
          const finishTime = new Date(buildDetail.finishTime);
          const timeDifference = finishTime.getTime() - startTime.getTime();
          const durationInSeconds = timeDifference / 1000;

          const hours = Math.floor(durationInSeconds / 3600);
          const minutes = Math.floor((durationInSeconds % 3600) / 60);
          const seconds = Math.floor(durationInSeconds % 60);

          const formattedDuration = `${hours > 0 ? hours + 'h ' : ''}${
            minutes > 0 ? minutes + 'm ' : ''
          }${seconds}s`;

          const display_name =
            buildDetail.triggerInfo && buildDetail.triggerInfo['ci.message']
              ? `#${runDetail.name} >> ${buildDetail.triggerInfo['ci.message']}`
              : `#${runDetail.name}`;

          buildDetails.push({
            id: runDetail.id,
            name: display_name,
            runDuration: formattedDuration,
          });
        }),
      );

      return buildDetails;
    } catch (error) {
      this.logger.error('Error getting build details:', error as Error);
      throw error;
    }
  }

  async triggerPipeline(
    projectName: string,
    pipelineId: number,
    branchName: string,
    variableValue: string | string[],
    variableName: string | string[],
    stagesToRuns: string,
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/${projectName}/_apis/pipelines/${pipelineId}/runs?api-version=6.0-preview.1`;
      const variableNamesArray = Array.isArray(variableName)
        ? variableName
        : variableName.split(',');
      const variableValuesArray = Array.isArray(variableValue)
        ? variableValue
        : variableValue.split(',');

      const variables: Record<string, { value: string }> = {};
      variableNamesArray.forEach((name, index) => {
        variables[name] = { value: variableValuesArray[index] || '' };
      });
      const stagesToSkipArray = stagesToRuns
        ? stagesToRuns.split(',').map(stage => stage.trim())
        : []; // Default to an empty array if stagesToSkip is undefined or empty

      const response = await apiRequest('POST', url, this.headers, this.logger, {
        resources: {
          repositories: {
            self: {
              refName: `refs/heads/${branchName}`,
            },
          },
        },

        variables: variables, // Pass the dynamically constructed variables object
        stagesToSkip: stagesToSkipArray, // Pass the dynamically constructed stagesToRun array
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(
        `Error triggering pipeline ${pipelineId} on branch ${branchName}:`,
        error,
      );
      return null;
    }
  }

  async getPipelineVariables(
    projectName: string,
    pipelineId: number,
    runId: string | number,
  ): Promise<{
    result: { name: string; value: string }[];
    stageRuns: string[];
  } | null> {
    try {
      // Step 1: Fetch pipeline runs
      const runsUrl = `${this.baseUrl}/${projectName}/_apis/pipelines/${pipelineId}?api-version=6.0-preview.1`;

      const runsResponse = await apiRequest('GET', runsUrl, this.headers, this.logger);
      if (!runsResponse.ok) {
        const errorText = await runsResponse.text();
        throw new Error(
          `Failed to fetch pipeline runs. Status: ${runsResponse.status}, Response: ${errorText}`,
        );
      }

      const runsData = await runsResponse.json();
      const variables = runsData.configuration?.variables;
      if (!variables) {
        console.warn('No variables found in the run details.');
        return null;
      }

      // Step 2: Fetch stages
      const stagesUrl = `${this.baseUrl}/${projectName}/_apis/build/builds/${runId}/timeline?api-version=6.0`;
      const stagesResponse = await apiRequest('GET', stagesUrl, this.headers, this.logger);
      if (!stagesResponse.ok) {
        const errorText = await stagesResponse.text();
        throw new Error(
          `Failed to fetch pipeline stages. Status: ${stagesResponse.status}, Response: ${errorText}`,
        );
      }

      const stagesData = await stagesResponse.json();
      const stageRuns = stagesData.records
        .filter((record: any) => record.type === 'Stage') // Filter only records with type 'Stage'
        .map((stage: any) => stage.refName); // Extract the refName

      // Step 3: Map variables
      const result = Object.entries(variables).map(
        ([name, details]: [string, any]) => ({
          name,
          value: details.value,
        }),
      );

      return { result, stageRuns };
    } catch (error) {
      console.error(
        `Error fetching pipeline variables for pipeline ${pipelineId}:`,
        error,
      );
      return null;
    }
  }
}
