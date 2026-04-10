import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import {
  STSClient,
  AssumeRoleCommand,
  AssumeRoleCommandOutput,
} from '@aws-sdk/client-sts';
import {
  CodePipelineClient,
  StartPipelineExecutionCommand,
} from '@aws-sdk/client-codepipeline';
import { LoggerService } from '@backstage/backend-plugin-api';

export const triggerAwsCodePipelineAction = (options: {
  config: Config;
  logger: LoggerService;
}) => {
  const { logger, config } = options;

  // Use scaffolder's zImpl implementation; keep types loose to avoid cross-version conflicts
  const inputSchema = (zImpl: any) =>
    zImpl.object({
      projectName: zImpl.string().describe('AWS CodePipeline project name'),
      repositoryName: zImpl.string().describe('Repository name'),
      branchName: zImpl.string().describe('Branch name'),
      pipelineName: zImpl.string().describe('Pipeline name'),
      buildSpec: zImpl.string().describe('Build specification file'),
      githubOwner: zImpl.string().describe('GitHub owner'),
    });

  const outputSchema = (zImpl: any) =>
    zImpl.object({
      pipelineExecutionId: zImpl.string().describe('Pipeline execution ID'),
    });

  return createTemplateAction({
    id: 'aws:pipeline:create-v1',
    description: 'Created AWS Code pipeline',
    schema: {
      input: inputSchema,
      output: outputSchema,
    },
    async handler(ctx) {
      const {
        projectName,
        repositoryName,
        pipelineName,
        branchName,
        githubOwner,
        buildSpec,
      } = ctx.input;

      const awsIntegrations = config.get('scaffolder.actions.aws') as {
        accessKeyId?: string;
        secretAccessKey?: string;
        roleArn: string;
        region: string;
        masterPipeline: string;
        githubConnectionArn: string;
        vpc?: string;
        subnets?: string;
        secGroup?: string;
      }[];
      logger.info(awsIntegrations as any);

      const {
        accessKeyId,
        secretAccessKey,
        roleArn,
        region,
        masterPipeline,
        githubConnectionArn,
        vpc,
        subnets,
        secGroup,
      } = awsIntegrations[0];

      const stsClient = new STSClient({
        region: region,
        ...(accessKeyId &&
          secretAccessKey && {
            credentials: {
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
            },
          }),
      });
      logger.info('STS Client:', stsClient as any);
      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'flowsourcesession',
        // The duration, in seconds, of the role session. The value specified
        // can range from 900 seconds (15 minutes) up to the maximum session
        // duration set for the role.
        DurationSeconds: 900,
      });
      logger.info('Assume Role Command:', assumeRoleCommand as any);

      const response: AssumeRoleCommandOutput = await stsClient.send(assumeRoleCommand as any);
      const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials ?? {};
      logger.info('Response:', response as any);
      const input = {
        // StartPipelineExecutionInput
        name: masterPipeline, // required
        variables: [
          {
            // PipelineVariable
            name: 'PIPELINE_NAME', // required
            value: pipelineName, // required
          }, // PipelineVariableList
          {
            // PipelineVariable
            name: 'PROJECT_NAME', // required
            value: projectName, // required
          },
          {
            // PipelineVariable
            name: 'REPOSITORY_NAME', // required
            value: repositoryName.toLowerCase(), // required
          },
          {
            // PipelineVariable
            name: 'BRANCH_NAME', // required
            value: branchName, // required
          },
          {
            // PipelineVariable
            name: 'GITHUB_CONNECTION_ARN', // required
            value: githubConnectionArn, // required
          },
          {
            // PipelineVariable
            name: 'USE_VPC', // required
            value: 'true', // required
          },
          {
            // PipelineVariable
            name: 'VPC_ID', // required
            value: vpc, // required
          },
          {
            // PipelineVariable
            name: 'SUBNETS', // required
            value: subnets, // required
          },
          {
            // PipelineVariable
            name: 'SECURITY_GROUP_ID', // required
            value: secGroup, // required
          },
          {
            // PipelineVariable
            name: 'GITHUB_OWNER', // required
            value: githubOwner, // required
          },
          {
            // PipelineVariable
            name: 'BUILDSPEC', // required
            value: buildSpec, // required
          },
          {
            // PipelineVariable
            name: 'ECR_REPO_NAME', // required
            value: repositoryName.toLowerCase(), // required
          },
        ],
      };

      const client = new CodePipelineClient({
        region: region,
        credentials: {
          accessKeyId: AccessKeyId!,
          secretAccessKey: SecretAccessKey!,
          sessionToken: SessionToken!,
        },
      });
      logger.info('Client:', client as any);
      logger.info(`Creating an AWS pipeline for the repository ${repositoryName}.`);

      try {
        logger.info('Input:', input as any);
        const command = new StartPipelineExecutionCommand(input);
        logger.info('Command:', command as any);
        const result = await client.send(command);
        logger.info("Result:", result as any);

        ctx.output('pipelineExecutionId', result.pipelineExecutionId!);
        ctx.logger.info(`Pipeline ${pipelineName} started with execution ID ${result.pipelineExecutionId}`);
      } catch (err) {
        ctx.logger.error(`Error starting pipeline ${pipelineName}: ${err}`);
        throw new Error(`Error starting pipeline ${pipelineName}: ${err}`);
      }
    },
  });
};
