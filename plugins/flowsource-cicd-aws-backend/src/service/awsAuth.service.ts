import {
  STSClient,
  AssumeRoleCommand,
  AssumeRoleCommandOutput,
} from '@aws-sdk/client-sts';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export class AwsAuthenticator {
  private config: Config;
  private region: string;
  logger: LoggerService;

  constructor(config: Config, region: string, logger: LoggerService) {
    this.config = config;
    this.region = region;
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
      const awsIntegration = this.config.get('aws.awsCodePipeline') as {
        accessKeyId?: string;
        secretAccessKey?: string;
        roleArn: string;
        region: string;
      };

      if (!awsIntegration.roleArn || !awsIntegration.region) {
        throw new Error(
          `AWS CICD getCredentials failed with error 503, missing config values in awsCodePipeline`,
        );
      }

      const { accessKeyId, secretAccessKey, roleArn, region } = awsIntegration;

      const stsClient = new STSClient({
        region: this.region || region,
        ...(accessKeyId &&
          secretAccessKey && {
            credentials: {
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
            },
          }),
      });

      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn!,
        RoleSessionName: 'flowsourcesession',
        // The duration, in seconds, of the role session. The value specified
        // can range from 900 seconds (15 minutes) up to the maximum session
        // duration set for the role.
        DurationSeconds: 900,
      });

      const response: AssumeRoleCommandOutput = await stsClient.send(
        assumeRoleCommand as any,
      );

      const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials ?? {};

      return {
        awsAccessKeyId: AccessKeyId ?? '',
        awsSecretAccessKey: SecretAccessKey ?? '',
        awsSessionToken: SessionToken ?? '',
        awsRegion: this.region || region,
      };
    } catch (error) {
      this.logger.error('Error while assuming role:', error as Error);
      throw error;
    }
  }
}
