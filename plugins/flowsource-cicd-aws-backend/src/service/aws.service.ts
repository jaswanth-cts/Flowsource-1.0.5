import {
  CodePipelineClient,
  GetPipelineCommand,
  StartPipelineExecutionCommand,
  ListPipelineExecutionsCommand,
  ListActionExecutionsCommand,
} from '@aws-sdk/client-codepipeline';
import { AwsAuthenticator } from './awsAuth.service';
import { LoggerService } from '@backstage/backend-plugin-api';

export class AWSCodePipelineService {
  private authService: AwsAuthenticator;
  private region: string;
  logger: LoggerService;

  constructor(authService: AwsAuthenticator, region: string, logger: LoggerService) {
    this.authService = authService;
    this.region = region;
    this.logger = logger;
  }

  // Returns the CodePipelineClient instance used to interact with AWS CodePipeline
  private async codePipelineClient(): Promise<CodePipelineClient> {
    const credentials = await this.authService.getCredentials();
    return new CodePipelineClient({
      credentials: {
        accessKeyId: credentials.awsAccessKeyId,
        secretAccessKey: credentials.awsSecretAccessKey,
        sessionToken: credentials.awsSessionToken,
      },
      region: this.region,
    });
  }

  // Method to get pipeline variables from AWS
  async getPipelineVariables(pipelineName: string) {
    try {
      const client = await this.codePipelineClient();
      const command = new GetPipelineCommand({ name: pipelineName });
      const response = await client.send(command);
      const stages = response.pipeline?.stages || [];
      const variables: { name: string; value: string }[] = [];

      stages.forEach(stage => {
        stage.actions?.forEach(action => {
          if (action.configuration) {
            Object.keys(action.configuration).forEach(key => {
              if (action.configuration) {
                variables.push({ name: key, value: action.configuration[key] });
              }
            });
          }
        });
      });

      return variables;
    } catch (error) {
      this.logger.error('Error fetching pipeline variables:', error as Error);
      throw error;
    }
  }

  // Method to trigger a pipeline execution with variables
  async triggerPipelineExecution(pipelineName: string) {
    try {
      const client = await this.codePipelineClient();
      const command = new StartPipelineExecutionCommand({
        name: pipelineName,
        clientRequestToken: `trigger-${Date.now()}`,
      });
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error('Error triggering pipeline execution:', error as Error);
      throw error;
    }
  }

  // Method to list recent pipeline executions
  async listRecentPipelineExecutions(pipelineName: string) {
    try {
      const command = new ListPipelineExecutionsCommand({ pipelineName });
      const client = await this.codePipelineClient();
      const response = await client.send(command);
      return response.pipelineExecutionSummaries;
    } catch (error) {
      this.logger.error('Error fetching pipeline executions:', error as Error);
      throw error;
    }
  }

  // Method to get action execution details for a particular pipeline execution
  async getActionExecution(pipelineName: string, executionId: string) {
    try {
      const client = await this.codePipelineClient();
      const command = new ListActionExecutionsCommand({
        pipelineName,
        filter: { pipelineExecutionId: executionId },
      });
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error('Error fetching failure details:', error as Error);
      return '';
    }
  }

  // Method to fetch pipelines execution from AWS CodePipeline.
  async fetchPipelines(pipelineNames: string): Promise<any> {
    try {
      const pipelineNameArray = pipelineNames
        .split(',')
        .map(name => name.trim());
      const buildDetailsByInitiator = [];
      let errorArrayPipeline: string[] = [];
      let pipelineResponses = [];

      for (const pipelineName of pipelineNameArray) {
        try {
          const pipelineResponse = await this.listRecentPipelineExecutions(
            pipelineName,
          );
          if (pipelineResponse && pipelineResponse.length > 0) {
            buildDetailsByInitiator.push({
              id: pipelineResponse[0]?.pipelineExecutionId,
              name: pipelineName,
              workflowState: pipelineResponse[0]?.status,
            });
          }
          pipelineResponses.push(pipelineResponse);
        } catch (error: any) {

          if(error.message && error.message.includes('getaddrinfo ENOTFOUND'))
          {
            const customError = new Error(`AWS Hostname could not be resolved.`);

            (customError as any).status = 404; // Attach status code to error object
            (customError as any).response = {
              status: 404,
              data: { message: `AWS Hostname could not be resolved.` },
            }; // Attach response object to error object

            throw customError;
          }

          errorArrayPipeline.push(pipelineName);
        }
      }

      const pipelineError = `Error fetching aws code pipeline: ${errorArrayPipeline.join(
        ', ',
      )}`;
      const clientErrorMessage = {
        pipelineError: errorArrayPipeline.length ? pipelineError : null,
      };
      return { buildDetailsByInitiator, clientErrorMessage };
    } catch (error) {
      throw error;
    }
  }
  // Failure reason for a pipeline execution
  async fetchFailureReason(pipelineName: string, pipelineExecutionId: string): Promise<any> {
    try {
      const executionResult = await this.getActionExecution(pipelineName, pipelineExecutionId);
      let code = 'N/A';
      let message = 'N/A';
      let executionUrl = 'N/A';
      let failedAt = 'N/A';

      if (executionResult && executionResult.actionExecutionDetails) {
        executionResult.actionExecutionDetails.forEach((detail: any) => {
          if (detail.status === 'Failed') {
            const executionSummary = detail.output?.executionResult?.externalExecutionSummary || 'No summary available';
            executionUrl = detail.output?.executionResult?.externalExecutionUrl || 'No URL available';
            const summaryMatch = executionSummary.match(/Phase: (\w+), Code: (\w+), Message: (.+)/);
            if (summaryMatch) {
              code = summaryMatch[2];
              message = summaryMatch[3];
            }
            failedAt = detail.stageName;
          }
        });
      }

      return { code, message, executionUrl, failedAt };
    } catch (error) {
      throw error;
    }
  }
  // Method to fetch pipeline details from AWS CodePipeline.
  async pipelineDetails(
    pipelineName: string,
    durationDate: Date,
    page: number,
    limit: number
  ): Promise<any> {
    try {
      const pipelineResponse = await this.listRecentPipelineExecutions(pipelineName);
      let buildDetailsByInitiator = [];

      if (pipelineResponse && pipelineResponse.length > 0) {
        const filteredBuilds = pipelineResponse.filter(build => {
          return (build.startTime ?? 0) > durationDate;
        });

        for (const codePipeline of filteredBuilds) {
          const durationInSeconds =
            (Number(codePipeline?.lastUpdateTime) - Number(codePipeline?.startTime)) / 1000;
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
          const url = `https://${this.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipelineName}/executions/${codePipeline?.pipelineExecutionId}/visualization?region=${this.region}`;

          buildDetailsByInitiator.push({
            id: codePipeline?.pipelineExecutionId,
            name: pipelineName,
            commitMessage:
              codePipeline?.sourceRevisions?.[0]?.revisionSummary &&
                codePipeline?.sourceRevisions?.[0]?.revisionSummary.startsWith('{') &&
                JSON.parse(codePipeline?.sourceRevisions?.[0]?.revisionSummary).CommitMessage
                ? JSON.parse(codePipeline?.sourceRevisions?.[0]?.revisionSummary).CommitMessage
                : codePipeline?.sourceRevisions?.[0]?.revisionSummary ?? 'No commit message',
            conclusion: this.getStatus(codePipeline?.status),
            duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
            workflowRunCount: filteredBuilds.length,
            url: url,
            startTime: codePipeline?.startTime ?? 'N/A', // Return raw startTime
          });
        }
      }

      // Calculate total items before pagination
      const totalItems = buildDetailsByInitiator.length;

      // Apply pagination to the results
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = buildDetailsByInitiator.slice(startIndex, endIndex);

      return { buildDetailsByInitiator: paginatedResults, total: totalItems };
    } catch (error) {
      throw error;
    }
  }
  getStatus = (status: any) => {
    switch (status) {
      case "InProgress":
        return "In Progress";
      case "Succeeded":
        return "Success";
      case "Failed":
        return "Failed";
      case "Stopped":
        return "Stopped";
      case "Stopping":
        return "Stopping";
      case "Cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };
}
