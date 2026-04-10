import { Storage } from '@google-cloud/storage';
import { GCSAuthenticator } from './playwrightGcsAuthService';

export class GCSService {
  private authService: GCSAuthenticator;

  constructor(authService: GCSAuthenticator) {
    this.authService = authService;
  }

  /**
   * Fetches and processes a file from a Google Cloud Storage (GCS) bucket.
   *
   * @param bucketName - The name of the GCS bucket.
   * @param fileName - The name of the file to fetch from the bucket.
   * @param path - The path within the bucket where the file is located.
   * @returns A promise that resolves to an object containing:
   *   - `suiteTitles`: An array of suite titles extracted from the file.
   *   - `suitesLength`: The number of suites in the file.
   *   - `stats`: Statistics data extracted from the file.
   * @throws Will throw an error if the file does not exist, if the file content
   *         is not valid JSON, or if any other error occurs during the process.
   */
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
        const FileNotFoundError = new Error(`File not found`);
        (FileNotFoundError as any).status = 404; // Set status to 404 for "Not Found"
        throw FileNotFoundError;
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
      const suiteTitles =
        objectData.suites?.map((suite: any) => suite.title) || [];
      const suitesLength = objectData.suites?.length || 0;
      const stats = objectData.stats || {};

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
