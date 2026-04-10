import { BlobServiceClient } from '@azure/storage-blob';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ClientSecretCredential } from '@azure/identity';

export class AzureStorageService{
    private storageAccount:string;
    private containerName:string;
    private folderName:string;
    private clientId:string;
    private tenantId:string;
    private secretKey: string ;
    private logger: LoggerService;


    // Constructor to initialize Azure Storage configuration
  constructor(storageAccount: string, containerName: string,  folderName: string, clientId: string,  tenantId: string, secretKey: string,   logger: LoggerService) {
    this.storageAccount = storageAccount;
    this.containerName = containerName;
    this.folderName = folderName;
    this.clientId = clientId;
    this.tenantId = tenantId;
    this.secretKey = secretKey;
    this.logger = logger;
  }

  // Public method to upload data to Storage, creating  a file
  public async sendDetailsToAzureStorage(items: any): Promise<void> {    
    
    const credential = new ClientSecretCredential(this.tenantId,this.clientId,this.secretKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${this.storageAccount}.blob.core.windows.net`,
        credential
    );
    const containerClient = blobServiceClient.getContainerClient(this.containerName);
    const timestamp=Date.now();
    const blobName = `${this.folderName}/catalog-data-${timestamp}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
      //Convert the items to JSON strings and concatenate them
      const concatenatedData = items
        .filter((item: { appid: any; }) => item.appid) // Filter items that have appid
        .map((item: any) => JSON.stringify(item)) // Convert each item to a JSON string
        .join('\n'); // Concatenate the JSON strings with newlines
        await blockBlobClient.upload(concatenatedData, concatenatedData.length);
      // Log success message
        this.logger.info('Data sent to Azure Blob Storage successfully');
        //Log the components which do not have appid
        const noAppIdComps= items
        .filter((item: any) =>  (item.appid===undefined ||  item.appid.trim()==='')) // Filter items that have appid
        .map((item: any) => item.app_name);
        if(noAppIdComps && noAppIdComps.length>0){
          this.logger.error(`One or more components do not have appid in the catalog-info.yaml , please validate : ${JSON.stringify(noAppIdComps)}`);
        }
    } catch (error:any) {
      // Log and throw an error if something goes wrong
      this.logger.error('Error sending data to Azure Blob Storage:', error);
      throw new Error('Failed to send data to Azure Blob Storage');
    }
  }

}