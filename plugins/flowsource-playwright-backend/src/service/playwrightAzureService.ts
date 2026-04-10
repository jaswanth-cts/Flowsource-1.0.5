
import { AzureAuthenticator } from './playwrightAzureAuthService';
import { BlobServiceClient } from '@azure/storage-blob';
import { Readable } from 'stream';

export class AzureBlobService {
  private authAzureService: AzureAuthenticator;
  private azure_client_id: string;
  private azure_tenant_id: string;
  private azure_secret_key: string;
  private azureStorageAccountName: string;

  constructor(authAzureService: AzureAuthenticator, azure_client_id: string, azure_tenant_id: string, azure_secret_key: string, azureStorageAccountName: string) {
    this.authAzureService = authAzureService;
    this.azure_client_id = azure_client_id;
    this.azure_tenant_id = azure_tenant_id;
    this.azure_secret_key = azure_secret_key;
    this.azureStorageAccountName = azureStorageAccountName; 
  }
  
  private async blobServiceClient(): Promise<BlobServiceClient> {
    const {credential } = await this.authAzureService.getAzureCredentials(this.azure_client_id, this.azure_tenant_id, this.azure_secret_key);  
    
    const blobServiceClient = new BlobServiceClient(
      `https://${this.azureStorageAccountName}.blob.core.windows.net`,
      credential,
    );
    return blobServiceClient;
  }

  // Fetches the list of objects in the specified container
  async fetchAzureBlobs(
    containerName: string,
    azurefileName: string,
  ): Promise<any> {

    const client = await this.blobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(azurefileName);          
   
    const downloadBlockBlobResponse = await blobClient.download();
        if (!downloadBlockBlobResponse.readableStreamBody) {
          throw new Error('No data available');
        }

        const stream = downloadBlockBlobResponse.readableStreamBody as Readable;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const objectData = JSON.parse(buffer.toString('utf-8'));
    const suiteTitles = objectData.suites?.map((suite: any) => suite.title) || [];
    const suitesLength = objectData.suites?.length || 0;
    const stats = objectData.stats || {};
        return { suiteTitles, suitesLength, stats };
      } catch (error: unknown) {
        console.error('Error fetching Azure blobs:', error);
        throw error;
      }
    } 



