import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { LoggerService } from '@backstage/backend-plugin-api';
import { AwsAuthenticator } from './seleniumAwsAuthService';

// AWSS3Service class to interact with Amazon S3
export class AWSS3Service {
  private authService: AwsAuthenticator;
  region: any;
  logger: LoggerService;

  // Constructor to initialize the AWS Authenticator
  constructor(authService: AwsAuthenticator, region: string, logger: LoggerService) {
    this.authService = authService;
    this.region = region;
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

  // List all objects in the specified S3 bucket
  async fetchTestResultsFromS3(
    bucketName: string,
    fileName: string,
    path: string,
  ): Promise<any> {
    try {
      const client = await this.s3Client();
      const normalizedPath = path.endsWith('/') ? path : `${path}/`;
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: `${normalizedPath}${fileName}`,
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
      const stats = objectData.stats || {};
      const suiteTitles = objectData.tests.map((test: any) => test.title);
      const suitesLength = objectData.tests.length;

      return { suiteTitles, suitesLength, stats };
    } catch (error) {
      this.logger.error('Error fetching S3 buckets:', error as Error);
      throw error;
    }
  }
}
