import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

class FeatureFlagService {
  private unleashBaseUrl: string;
  private unleashToken: string;
  private logger: LoggerService;

  constructor(
    unleashBaseUrl: string,
    unleashToken: string,
    logger: LoggerService,
  ) {
    this.unleashBaseUrl = unleashBaseUrl;
    this.unleashToken = unleashToken;
    this.logger = logger;
  }


  // Get details for all feature flags in a project
  async getAllFeatureFlagsDetails(projectId: string, appName: string) {
    // get the list of flags
    const flags = await this.getFlags(appName);

    if (!flags || flags.length === 0) {
      return [];
    }
    // get the details for each flag
    const flagDetails = await Promise.all(
      flags.map((flag: any) =>
        this.getFlagDetails(projectId, flag.name),
      ),
    );
    return flagDetails;
  }

  // Get the list of flags
  async getFlags(appName: string) {
    const url = `${this.unleashBaseUrl}/api/admin/metrics/applications/${appName}`;

    const response = await apiRequest(
      'GET',
      url,
      { Authorization: `Bearer ${this.unleashToken}` },
      this.logger,
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

    const data = await response.json();

    const flags = data.seenToggles.map((flag: any) => ({
      name: flag.name,
    }));

    this.logger.info(`List of flags: ${JSON.stringify(flags)}`);
    return flags;
  }

  // Get details for a specific flag
  async getFlagDetails(projectId: string, flagName: string) {
    const url = `${this.unleashBaseUrl}/api/admin/projects/${projectId}/features/${flagName}`;

    const response = await apiRequest(
      'GET',
      url,
      { Authorization: `Bearer ${this.unleashToken}` },
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

    const data = await response.json();

    const flagData = {
      name: data.name,
      createdAt: data.createdAt,
      createdBy: data.createdBy?.name,
      lifecycleStage: data.lifecycle?.stage,
      enteredStageAt: data.lifecycle?.enteredStageAt,
      environments: (data.environments || []).map((env: any) => ({
        name: env.name,
        enabled: env.enabled,
        lastSeenAt: env.lastSeenAt,
      })),
    };
    this.logger.debug(`Feature flag return data: ${JSON.stringify(flagData)}`);
    return flagData;
  }

  // Enable or disable a feature flag for a specific environment
  async toggleFeatureFlag(
    projectId: string,
    flagName: string,
    environment: string,
    enabled: string,
  ) {
    const url = `${this.unleashBaseUrl}/api/admin/projects/${projectId}/features/${flagName}/environments/${environment}/${enabled}`;

    const response = await apiRequest(
      'POST',
      url,
      { Authorization: `Bearer ${this.unleashToken}` },
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

    const message =
      enabled === 'on'
        ? `Feature flag "${flagName}" is enabled in ${environment}`
        : `Feature flag "${flagName}" is disabled in ${environment}`;

    return { status: response.status, message: message };
  }

}
export default FeatureFlagService;
