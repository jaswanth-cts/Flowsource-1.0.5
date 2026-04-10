import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { STSClient, AssumeRoleCommand, AssumeRoleCommandOutput } from '@aws-sdk/client-sts';
import { CodePipelineClient, StartPipelineExecutionCommand } from '@aws-sdk/client-codepipeline';
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
      pipelineName: zImpl.string().describe('Pipeline name'),
      branchName: zImpl.string().describe('Branch name'),
      buildSpec: zImpl.string().describe('Build specification file'),
      region: zImpl.string().describe('AWS region'),
    });

  const outputSchema = (zImpl: any) =>
    zImpl.object({
      pipelineExecutionId: zImpl.string().describe('Pipeline execution ID'),
    });

  return createTemplateAction({
    id: 'aws:pipeline:create',
    description: 'Triggers an AWS CodePipeline',
    schema: {
      input: inputSchema,   // (zImpl) => schema
      output: outputSchema, // (zImpl) => schema
    },
    async handler(ctx) {
      const {
        projectName,
        repositoryName,
        pipelineName,
        branchName,
        buildSpec,
      } = ctx.input;

      const awsIntegrations = config.get('scaffolder.actions.aws') as {
        accessKeyId: string;
        secretAccessKey: string;
        roleArn: string;
        masterPipeline: string;
        region: string;
      }[];

      const { accessKeyId, secretAccessKey, roleArn, masterPipeline, region } = awsIntegrations[0];

      const stsClient = new STSClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'flowsourcesession',
        DurationSeconds: 900,
      });

      const response: AssumeRoleCommandOutput = await stsClient.send(assumeRoleCommand as any);
      const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials ?? {};

      const client = new CodePipelineClient({
        region,
        credentials: {
          accessKeyId: AccessKeyId!,
          secretAccessKey: SecretAccessKey!,
          sessionToken: SessionToken!,
        },
      });

      logger.info(`Creating an AWS pipeline for the repository ${repositoryName}.`);

      try {
        const input = {
          name: masterPipeline,
          variables: [
            { name: 'PIPELINE_NAME', value: pipelineName },
            { name: 'PROJECT_NAME', value: projectName },
            { name: 'REPOSITORY_NAME', value: repositoryName },
            { name: 'BRANCH_NAME', value: branchName },
            { name: 'REGION', value: region },
            { name: 'BUILDSPEC', value: buildSpec },
          ],
        };

        logger.info('Input:', input);
        const command = new StartPipelineExecutionCommand(input);
        const result = await client.send(command);
        logger.info('Result:', result as any);

        ctx.output('pipelineExecutionId', result.pipelineExecutionId!);
        ctx.logger.info(`Pipeline ${pipelineName} started with execution ID ${result.pipelineExecutionId}`);
      } catch (err) {
        ctx.logger.error(`Error starting pipeline ${pipelineName}: ${err}`);
        throw new Error(`Error starting pipeline ${pipelineName}: ${err}`);
      }
    },
  });
};