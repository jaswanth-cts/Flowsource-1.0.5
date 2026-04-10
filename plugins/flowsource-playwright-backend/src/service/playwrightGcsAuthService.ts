import { Config } from '@backstage/config';
import { GoogleAuth } from 'google-auth-library';

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
}

export class GCSAuthenticator {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async getCredentials(): Promise<GCPIntegration> {
    const gcsBucketConfig: GCPIntegration =
      this.config.getOptionalConfig('playwright.gcsBucket')?.get() || {};

    // Check for service account credentials
    const hasServiceAccountCreds =
      gcsBucketConfig.client_email && gcsBucketConfig.private_key;

    if (hasServiceAccountCreds) {
      gcsBucketConfig.private_key = gcsBucketConfig.private_key?.replace(/\\n/g, '\n');
      return gcsBucketConfig;
    }

    // If not present, return empty object to signal use of Workload Identity
    return {};
  }

  async getAccessToken(): Promise<string> {
    try {
      const gcsBucketConfig = await this.getCredentials();
      let auth: GoogleAuth;

      if (gcsBucketConfig.client_email && gcsBucketConfig.private_key) {
        auth = new GoogleAuth({
          credentials: gcsBucketConfig,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
      } else {
        // Use Workload Identity / Application Default Credentials
        auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
      }

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token as string;
    } catch (error) {
      throw error;
    }
  }

  async getProjectId(): Promise<string> {
    const gcsBucketConfig: GCPIntegration =
      this.config.getOptionalConfig('playwright.gcsBucket')?.get() || {};
    return gcsBucketConfig.project_id || process.env.GOOGLE_CLOUD_PROJECT || '';
  }
}

export default GCSAuthenticator;