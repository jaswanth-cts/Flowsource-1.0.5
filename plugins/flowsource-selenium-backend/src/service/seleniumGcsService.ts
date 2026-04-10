import { Storage } from '@google-cloud/storage';
import GCSAuthenticator from './seleniumGcsAuthService';

export class GCSService {
  private authService: GCSAuthenticator;

  constructor(authService: GCSAuthenticator) {
    this.authService = authService;
  }

  async getTestResultFileFromGCS(
    bucketName: string,
    fileName: string,
    path: string,
  ): Promise<any> {
    try {
      const credentials = await this.authService.getCredentials();
      const projectId = await this.authService.getProjectId();

      let client: Storage;
      if (credentials.client_email && credentials.private_key) {
        client = new Storage({
          projectId,
          credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          },
        });
      } else {
        // Use ADC (Workload Identity, gcloud, etc.)
        client = new Storage({ projectId });
      }

      const bucket = client.bucket(bucketName);
      const filePath = path.endsWith('/')
        ? `${path}${fileName}`
        : `${path}/${fileName}`;
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      const stream = file.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks.map(chunk => Uint8Array.from(chunk)));
      let objectData;
      try {
        objectData = JSON.parse(buffer.toString('utf-8'));
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid JSON content in the file');
      }
      const stats = objectData.stats || {};
      const suiteTitles = objectData.tests.map((test: any) => test.title);
      const suitesLength = objectData.tests.length;
      return { suiteTitles, suitesLength, stats };
    } catch (error) {
      console.error(
        `Error fetching GCS buckets for bucket "${bucketName}" and file path "${
          path.endsWith('/') ? `${path}${fileName}` : `${path}/${fileName}`
        }":`,
        error,
      );
      throw error;
    }
  }
}
