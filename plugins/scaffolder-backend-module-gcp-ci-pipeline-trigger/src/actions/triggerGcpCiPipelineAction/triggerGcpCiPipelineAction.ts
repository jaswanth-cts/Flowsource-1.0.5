import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { GoogleAuth } from 'google-auth-library';

interface GcpIntegration {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
  triggerId: string;
}

interface ActionOptions {
  config: Config;
  logger: LoggerService;
}


// Function to retrieve GCP configuration from the provided config object
const getGcpConfig = (config: Config): GcpIntegration => {
  try {
    const gcpIntegrations = config.get(
      'integrations.google',
    ) as GcpIntegration[];
    const gcpConfig = gcpIntegrations[0];
    gcpConfig.private_key = gcpConfig.private_key.replace(/\\n/g, '\n');
    return gcpConfig;
  } catch (error) {
    throw new Error(
      `Error retrieving GCP configuration: ${(error as Error).message}`,
    );
  }
};

// Function to create an authentication client using the provided GCP configuration
const createAuthClient = async (gcpConfig: GcpIntegration) => {
  try {
    const auth = new GoogleAuth({
      credentials: gcpConfig,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    return await auth.getClient();
  } catch (error) {
    throw new Error(
      `Error creating authentication client: ${(error as Error).message}`,
    );
  }
};

// Function to trigger GCP Cloud Build using the provided client, project ID, trigger ID, and substitutions
const triggerGcpCloudBuild = async (
  client: any,
  projectId: string,
  triggerId: string,
  substitutions: Record<string, string>,
) => {
  try {
    const url = `https://cloudbuild.googleapis.com/v1/projects/${projectId}/locations/us-east1/triggers/${triggerId}:run`;
    const body = { source: { substitutions } };
    return await client.request({ url, method: 'POST', data: body });
  } catch (error) {
    throw new Error(
      `Error triggering GCP Cloud Build: ${(error as Error).message}`,
    );
  }
};

// Exported function to trigger GCP CI pipeline action
export const triggerGcpCiPipelineAction: any = ({
  config,
  logger,
}: ActionOptions) => {
  
  const inputSchema = (zImpl: any) =>
    zImpl.object({
      githubConnectionName: zImpl.string(),
      githubRepositoryName: zImpl.string(),
      triggerName: zImpl.string(),
      branchName: zImpl.string(),
      githubRepositoryOwner: zImpl.string(),
      region: zImpl.string(),
    });
  
  return createTemplateAction({
    id: 'gcp:cloudbuild:create',
    description: 'Created GCP Cloud Build',
    schema: {
      input: inputSchema,
    },
    async handler(ctx) {
      const {
        githubConnectionName,
        githubRepositoryName,
        triggerName,
        branchName,
        githubRepositoryOwner,
        region,
      } = ctx.input;
      const gcpConfig = getGcpConfig(config);
      const client = await createAuthClient(gcpConfig);
      const substitutions = {
        _BRANCH_NAME: branchName,
        _GITHUB_CONNECTION_NAME: githubConnectionName,
        _GITHUB_REPO_NAME: githubRepositoryName,
        _GITHUB_REPO_OWNER: githubRepositoryOwner,
        _TRIGGER_NAME: triggerName,
        _REGION: region,
        _SERVICE_ACCOUNT_EMAIL: gcpConfig.client_email,
        _CLOUDBUILD_YAML_PATH: 'cloudbuild.yaml',
        _PROJECT_ID: gcpConfig.project_id,
      };
      const res = await triggerGcpCloudBuild(
        client,
        gcpConfig.project_id,
        gcpConfig.triggerId,
        substitutions,
      );
      logger.info(
        `Creating GCP Cloud Build for the repository ${githubRepositoryName}.`,
      );
      logger.info('Substitutions:', res);
    },
  });
};
