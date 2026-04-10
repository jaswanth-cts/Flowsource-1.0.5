import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
 
export const createAzurePipelineAction = (options: {
  config: Config;
  logger: LoggerService;
}) => {
  const { logger, config } = options;
 
  const inputSchema = (zImpl: any) =>
    zImpl.object({
      organization: zImpl.string().describe('Azure DevOps organization name'),
      project: zImpl.string().describe('Azure DevOps project name'),
      repositoryName: zImpl.string().describe('Repository name'),
      token: zImpl.string().optional().describe('Personal Access Token'),
      repoType: zImpl.string().describe('Repository type'),
      branchName: zImpl.string().describe('Branch name'),
      serviceConnectionName: zImpl.string().optional().describe('Service connection name'),
    });
 
  const outputSchema = (zImpl: any) =>
    zImpl.object({
      status: zImpl.number().describe('HTTP status code'),
      statusText: zImpl.string().describe('HTTP status text'),
    });
 
  return createTemplateAction({
    id: 'azure:pipeline:create',
    description: 'Creates an Azure DevOps pipeline',
    schema: {
      input: inputSchema,
      output: outputSchema,
    },
    async handler(ctx) {
        //get from the templates parameters
        const {
            organization,
            project,
            repositoryName,
            repoType,
            branchName,
            serviceConnectionName,
        } = ctx.input;
 
      const host = config.getString('azureDevOps.baseUrl');
      const apiToken = config.getString('azureDevOps.token');
      const apiVersion = '7.1';
      const newPipelineName =
        repoType.toLowerCase() === 'github'
          ? repositoryName.split('/')[1].concat('-ci')
          : repositoryName.concat('-ci-pipeline');
    const masterPipelineName = config.getString('customActions.masterPipelineName');
    const variableGroupName = config.getString('customActions.pipelineVariableGroup');    
 
      logger.info(
        `Creating an Azure pipeline for the repository ${repositoryName}.`
      );
 
      try {
        // Get the pipeline ID
        const getPipelineIdApiUrl = `${host}/${organization}/${project}/_apis/pipelines?api-version=${apiVersion}`;
        const pipelineDataResponse = await fetch(getPipelineIdApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`:${apiToken}`).toString(
              'base64'
            )}`,
          },
        });
        const pipelineData = await pipelineDataResponse.json();
        const pipelineJson = pipelineData.value.find(
          (item: any) => item.name === masterPipelineName
        );
        const pipelineId = pipelineJson ? pipelineJson.id : null;
 
        // Create Azure pipeline
        const apiUrl = `${host}/${organization}/${project}/_apis/pipelines/${pipelineId}/runs?api-version=${apiVersion}`;
 
        // Create the pipeline payload
        const payload = {
          resources: {
            repositories: {
              self: {
                refName: "refs/heads/master",
              },
            },
          },
          templateParameters: {
            pipeline_name: `${newPipelineName}`,
            devops_project_id: `${project}`,
            branch_name: `${branchName}`,
            repo_id: `${repositoryName}`,
            repo_type: `${repoType}`,
            pipeline_variable_group: `${variableGroupName}`,
            pipeline_yaml_path: 'azure-ci-pipeline.yaml',
            service_connection_name: `${serviceConnectionName}`,
          },
        };
        const azurePipelineCreateResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`:${apiToken}`).toString(
              'base64'
            )}`,
          },
          body: JSON.stringify(payload),
        });
 
        const result = await azurePipelineCreateResponse.json();
        ctx.output('status', result.status);
        ctx.output('statusText', result.statusText);
 
        if (azurePipelineCreateResponse.statusText === 'OK') {
          logger.info(
            `Azure pipeline with name ${newPipelineName} is created successfully!!!`
          );
        } else {
          logger.error(
            `Unable to create Azure pipeline with name ${newPipelineName}!!!`
          );
        }
      } catch (error) {
        logger.error(
          `Error creating Azure pipeline with name ${newPipelineName}: ${error}`
        );
        throw error;
      }
    },
  });
};