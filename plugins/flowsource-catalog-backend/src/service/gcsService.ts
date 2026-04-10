import { LoggerService } from '@backstage/backend-plugin-api';
import { Storage } from '@google-cloud/storage';
 
// Define a service class for interacting with S3
export class GcsService {

    // Class properties for GCS configuration
  private bucketName: string;
  private gcsUploadPath: string;
  private projectId: string;
  private logger: LoggerService;
  private credentials?: { client_email: string; private_key: string };

 // Constructor to initialize GCS configuration
  constructor(
    bucketName: string,
    gcsUploadPath: string,
    projectId: string,
    logger: LoggerService,
    credentials?: { client_email: string; private_key: string }
  ) {
    this.bucketName = bucketName;
    this.gcsUploadPath = gcsUploadPath;
    this.projectId = projectId;
    this.logger = logger;
    this.credentials = credentials;
  }

// Public method to upload data to GCS, creating  a file
   
  public async sendDetailsToGCS(items: any): Promise<void> {
    try {
      let storage: Storage;
      if (this.credentials && this.credentials.client_email && this.credentials.private_key) {
        this.logger.info('Using GCP Service Account credentials for GCS authentication.');
        storage = new Storage({
          projectId: this.projectId,
          credentials: {
            client_email: this.credentials.client_email,
            private_key: this.credentials.private_key,
          },
        });
      } else {
        this.logger.info('Using GCP Workload Identity or ADC for GCS authentication.');
        storage = new Storage({
          projectId: this.projectId,
        });
      }

      const timestamp = Date.now();
      const sanitizedPath = this.gcsUploadPath.endsWith('/') ? this.gcsUploadPath : `${this.gcsUploadPath}/`;
      const destFileName = `${sanitizedPath}catalog-data-${timestamp}.json`;
      const concatenatedData = items
        .filter((item: { appid: any }) => item.appid)
        .map((item: any) => JSON.stringify(item))
        .join('\n');

      const bucket = storage.bucket(this.bucketName);
      const file = bucket.file(destFileName);

      await file.save(concatenatedData, {
        resumable: false,
        contentType: 'application/json',
      });
      this.logger.info('Data sent to GCS successfully');
      const noAppIdComps = items
        .filter((item: any) => item.appid === undefined || item.appid.trim() === '')
        .map((item: any) => item.app_name);
      if (noAppIdComps && noAppIdComps.length > 0) {
        this.logger.error(
          `One or more components do not have appid in the catalog-info.yaml , please validate : ${JSON.stringify(
            noAppIdComps
          )}`
        );
      }
    } catch (error: any) {
      this.logger.error('Error sending data to GCS:', error);
      throw new Error('Failed to send data to GCS');
    }
  }
}
