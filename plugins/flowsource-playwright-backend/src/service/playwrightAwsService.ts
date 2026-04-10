import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { AwsAuthenticator } from './playwrightAwsAuthService';
import { LoggerService } from '@backstage/backend-plugin-api';

// AWSS3Service class to interact with Amazon S3
export class AWSS3Service {
  private authService: AwsAuthenticator;
  logger: LoggerService;

  // Constructor to initialize the AWS Authenticator
  constructor(authService: AwsAuthenticator, logger: LoggerService) {
    this.authService = authService;
    this.logger = logger;
  }

  // Returns the S3Client instance used to interact with Amazon S3
  private async s3Client(): Promise<S3Client> {
    const credentials = await this.authService.getCredentials();
    return new S3Client({
      credentials: {
        accessKeyId: credentials.awsAccessKeyId,
        secretAccessKey: credentials.awsSecretAccessKey,
        sessionToken: credentials.awsSessionToken,
      },
      region: credentials.awsRegion,
    });
  }

  // Fetches the list of objects in the specified bucket
  async fetchTestResultsFromS3(
    bucketName: string,
    fileName: string,
    path: string,
  ): Promise<any> {
    try {
      const client = await this.s3Client();
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: `${path}/${fileName}`,
      });
      const objectResponse = await client.send(getObjectCommand);
      if (!objectResponse.Body) {
        throw new Error('No data available');
      }
      const stream = objectResponse.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks.map(chunk => Uint8Array.from(chunk)));
      const objectData = JSON.parse(buffer.toString('utf-8'));
      const suiteTitles =
        objectData.suites?.map((suite: any) => suite.title) || [];
      const suitesLength = objectData.suites?.length || 0;
      const stats = objectData.stats || {};

      return { suiteTitles, suitesLength, stats };
    } catch (error) {
      this.logger.error('Error fetching test results from S3:', error as Error);
      throw error;
    }
  }
}
