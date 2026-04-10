import { GoogleAuth } from 'google-auth-library';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

interface GCPIntegration {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
  gitToken?: string;
  github?: string;
}

export class AuthService {
  private config: Config;
  logger: LoggerService;

  constructor(config: Config, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  async getCredentials(): Promise<string> {
    try {
      // Try to get service account credentials from config
      const gcpIntegrations: GCPIntegration[] = this.config.getOptionalConfigArray('integrations.google')?.map(config => ({
        type: config.getOptionalString('type'),
        project_id: config.getOptionalString('project_id'),
        private_key_id: config.getOptionalString('private_key_id'),
        private_key: config.getOptionalString('private_key'),
        client_email: config.getOptionalString('client_email'),
        client_id: config.getOptionalString('client_id'),
        auth_uri: config.getOptionalString('auth_uri'),
        token_uri: config.getOptionalString('token_uri'),
        auth_provider_x509_cert_url: config.getOptionalString('auth_provider_x509_cert_url'),
        client_x509_cert_url: config.getOptionalString('client_x509_cert_url'),
        universe_domain: config.getOptionalString('universe_domain'),
        gitToken: config.getOptionalString('gitToken'),
        github: config.getOptionalString('github'),
      })) || [];

      const serviceAccount = gcpIntegrations[0];

      // Check if service account credentials are present
      const hasServiceAccountCreds = serviceAccount?.type && serviceAccount?.private_key && serviceAccount?.client_email;

      let auth: GoogleAuth;
      if (hasServiceAccountCreds) {
        // Use service account credentials
        serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, '\n');
        auth = new GoogleAuth({
          credentials: serviceAccount,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        this.logger.info('Using GCP service account credentials from config');
      } else {
        // Use Application Default Credentials (Workload Identity)
        auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        this.logger.info('Using GCP Workload Identity/Application Default Credentials');
      }

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token as string;
    } catch (error) {
      this.logger.error('Error while assuming role:', error as Error);
      throw error;
    }
  }

  async getSource(): Promise<any> {
    const gcpIntegrationConfig = this.config.get('integrations.google');
    const gcpIntegrations = Array.isArray(gcpIntegrationConfig)
      ? gcpIntegrationConfig as GCPIntegration[]
      : [gcpIntegrationConfig as GCPIntegration];
    return gcpIntegrations[0]?.github;
  }
  
  async getExternalSourceCredentials(): Promise<any> {
    const gcpIntegrationConfig = this.config.get('integrations.google');
    const gcpIntegrations = Array.isArray(gcpIntegrationConfig)
      ? gcpIntegrationConfig as GCPIntegration[]
      : [gcpIntegrationConfig as GCPIntegration];
    return gcpIntegrations[0]?.gitToken;
  }
  
  async getProjectId(): Promise<any> {
    const gcpIntegrationConfig = this.config.get('integrations.google');
    const gcpIntegrations = Array.isArray(gcpIntegrationConfig)
      ? gcpIntegrationConfig as GCPIntegration[]
      : [gcpIntegrationConfig as GCPIntegration];
    return gcpIntegrations[0]?.project_id || process.env.GOOGLE_CLOUD_PROJECT;
  }
}

export default AuthService;
