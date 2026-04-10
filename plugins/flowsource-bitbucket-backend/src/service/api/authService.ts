import { URLSearchParams } from 'url';
import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';

export default class AuthService {
  logger: LoggerService;
  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  /**
   * Resolve an auth token and api baseUrl for Bitbucket.
   * Priority:
   *  1) If bitbucket client credentials are configured in `config`, use them to fetch a token from the configured auth URL.
   *  2) Otherwise fall back to the token and apiBaseUrl provided by the ScmIntegrations config for the host.
   *
   * Returns an object { token, baseUrl } or throws an error with status=503 when values are missing.
   */
  async getAuthToken(
    config: Config,
    integrations: ScmIntegrations,
    hostFromCatalog?: string,
  ): Promise<{ token: string; baseUrl: string }> {
    const host = hostFromCatalog || 'bitbucket.org';

    // Read values from config (if present)
    const clientId = config.getOptionalString('bitbucket.clientId') || '';
    const clientSecret = config.getOptionalString('bitbucket.clientSecret') || '';
    const authUrl = config.getOptionalString('bitbucket.authorizationUrl') || '';
    let baseUrl = config.getOptionalString('bitbucket.apiBaseUrl') || '';

    // If client credentials are provided, use them to fetch a token
    if (clientId && clientSecret && authUrl) {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response: any = await apiRequest(
        'POST',
        authUrl,
        {
          Authorization: 'Basic ' + basic,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        this.logger,
        new URLSearchParams({ grant_type: 'client_credentials' }),
      );

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
      }

      const body = await response.json();
      const token = body.access_token;

      if (!baseUrl) {
        baseUrl = integrations.bitbucket.byHost(host)?.config?.apiBaseUrl || '';
      }

      if (!token || !baseUrl) {
        const err = new Error(
          'Bitbucket plugin failed with error 503, missing values in bitbucketServer',
        );
        (err as any).status = 503;
        throw err;
      }

      return { token, baseUrl };
    }

    // Fallback to ScmIntegrations configured token/baseUrl
    const token = integrations.bitbucket.byHost(host)?.config?.token || '';
    if (!baseUrl) {
      baseUrl = integrations.bitbucket.byHost(host)?.config?.apiBaseUrl || '';
    }

    if (!token || !baseUrl) {
      const err = new Error(
        'Bitbucket plugin failed with error 503, missing values in bitbucketServer',
      );
      (err as any).status = 503;
      throw err;
    }

    return { token, baseUrl };
  }
}