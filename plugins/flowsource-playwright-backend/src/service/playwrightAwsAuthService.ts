import {
  AssumeRoleCommand,
  AssumeRoleCommandOutput,
  STSClient,
} from '@aws-sdk/client-sts';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export class AwsAuthenticator {
  private config: Config;
  logger: LoggerService;

  constructor(config: Config, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  async getCredentials(): Promise<{
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsSessionToken: string;
    awsRegion: string;
  }> {
    try {
      // Implement logic to assume the role and obtain valid credentials
      // Used STSClient and AssumeRoleCommand
      const awsIntegrations = this.config.get('playwright.awsS3Bucket') as {
        accessKeyId?: string;
        secretAccessKey?: string;
        region: string;
        roleArn: string;
        bucketName: string;
      };
      const requiredProperty = awsIntegrations.region && awsIntegrations.roleArn && awsIntegrations.bucketName;

      if (!requiredProperty) {
        throw new Error(
          `AWS S3 getCredentials failed with error 503, missing config values in awsS3`
        );
      }
      const { accessKeyId, secretAccessKey, roleArn } = awsIntegrations;
     
      const stsClient = new STSClient({
        region: awsIntegrations.region,
        credentials: accessKeyId && secretAccessKey ? {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          } : undefined,
      });

      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn!,
        RoleSessionName: 's3session',
        DurationSeconds: 900,
      });

      const response: AssumeRoleCommandOutput = await stsClient.send(
        assumeRoleCommand as any);
      
      if (!response.Credentials) {
        throw new Error('Failed to assume role and obtain credentials');
      }
      const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials;
      return {
        awsAccessKeyId: AccessKeyId ?? '',
        awsSecretAccessKey: SecretAccessKey ?? '',
        awsSessionToken: SessionToken ?? '',
        awsRegion: awsIntegrations.region,
      };
    } catch (error) {
      this.logger.error('Error while assuming role:', error as Error);
      throw error;
    }
  }
}
