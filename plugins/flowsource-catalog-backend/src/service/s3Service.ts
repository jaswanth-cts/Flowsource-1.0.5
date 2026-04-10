import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LoggerService } from '@backstage/backend-plugin-api';
 
// Define a service class for interacting with S3
export class s3Service {
  // Class properties for S3 configuration
  private bucketName: string;
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private s3UploadPath: string;
  private logger: LoggerService;
 
  // Constructor to initialize S3 configuration
  constructor(bucketName: string, region: string, accessKeyId: string, secretAccessKey: string, s3UploadPath: string,logger: LoggerService) {
    this.bucketName = bucketName;
    this.region = region;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.s3UploadPath = s3UploadPath;
    this.logger = logger;
  }
 
  // Public method to upload data to S3, creating  a file
  public async sendDetailsToS3(items: any): Promise<void> {
    // Create an S3 client with the provided credentials and region
    const s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
 
    const timestamp=Date.now();
    // Define the S3 key (path) for the file
    const sanitizedPath = this.s3UploadPath.endsWith('/') ? this.s3UploadPath : `${this.s3UploadPath}/`;
    const key = `${sanitizedPath}catalog-data-${timestamp}.json`;
 
    try {
    //Convert the items to JSON strings and concatenate them
      const concatenatedData = items
        .filter((item: { appid: any; }) => item.appid) // Filter items that have appid
        .map((item: any) => JSON.stringify(item)) // Convert each item to a JSON string
        .join('\n'); // Concatenate the JSON strings with newlines
 
      // Define the parameters for the S3 upload
      const putObjectParams = {
        Bucket: this.bucketName, // S3 bucket name
        Key: key, // S3 key (path)
        Body: concatenatedData, // JSON data to upload
        ContentType: 'application/json', // Content type of the file
      };
 
      // Create a command to put (upload) the object to S3
      const command = new PutObjectCommand(putObjectParams);
      // Send the command to S3
      await s3Client.send(command);
 
      // Log success message
      this.logger.info('Data sent to S3 successfully');
      //Log the components which do not have appid
      const noAppIdComps= items
      .filter((item: any) =>  (item.appid===undefined ||  item.appid.trim()==='')) // Filter items that have appid
      .map((item: any) => item.app_name);
      if(noAppIdComps && noAppIdComps.length>0){
        this.logger.error(`One or more components do not have appid in the catalog-info.yaml , please validate : ${JSON.stringify(noAppIdComps)}`);
      }
    } catch (error:any) {
      // Log and throw an error if something goes wrong
      this.logger.error('Error sending data to S3:', error);
      throw new Error('Failed to send data to S3');
    }
  }
}