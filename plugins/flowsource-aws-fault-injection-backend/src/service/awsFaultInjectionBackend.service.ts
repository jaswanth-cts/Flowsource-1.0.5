import { LoggerService } from '@backstage/backend-plugin-api';
import {
  FisClient,
  ListExperimentsCommand,
  ListExperimentTemplatesCommand
} from "@aws-sdk/client-fis";

export class awsFaultInjectionBackendService {

    awsBaseUrl: string;
    logger: LoggerService;
    accessKeyId?: string;
    secretAccessKey?: string;
    constructor(awsRegion: string, logger:LoggerService, accessKeyId?: string, secretAccessKey?: string) {
      this.awsBaseUrl = "https://resiliencehub." + awsRegion + ".amazonaws.com/";
      this.logger = logger;
      this.accessKeyId = accessKeyId || '';
      this.secretAccessKey = secretAccessKey || '';
   }
   
    createFisClient(awsRegion: string){
      if (!this.accessKeyId || !this.secretAccessKey) {
        throw new Error('AWS credentials are not provided');
      }
      const fisclient =
      new FisClient({
        credentials: { accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey },
        region: awsRegion
      });
      
      return fisclient;
    }

    async getAWSFisExperiments(awsRegion: any, applicationId: any): Promise<any> {
        this.logger.info('AWSFisExperiments applicationId:'+applicationId);
        try {
          const fisclient= this.createFisClient(awsRegion);

          const awsFisInput = { // ListExperimentsRequest
            maxResults: 100
          };
          const command = new ListExperimentsCommand(awsFisInput);

          const resp = await fisclient.send(command);
          //filter expereiments based on tag - application_id

          var exp = resp.experiments;

          if (exp != null) {
            var filteredExp = [];
            exp.filter((element: any) => element?.tags?.application_id === applicationId)
              .forEach((element: any) => filteredExp.push({
                "creationTime": element?.creationTime?.toString(),
                "experimentTemplateId": element?.experimentTemplateId?.toString(),
                "id": element?.id?.toString(),
                "state": element?.state,
                "tags": this.customTag(element?.tags!),
                "url": 'https://' + awsRegion + '.console.aws.amazon.com/fis/home?region=' + awsRegion + '#ExperimentDetails:ExperimentId=' + element?.id?.toString()
              }));

            if (exp?.length > 0 && filteredExp?.length == 0) {
              const error = new Error(`No experiments found for the application id ${applicationId}.`);

              (error as any).status = 404; // Attach status code to error object
              (error as any).response = {
                status: 404,
                data: { message: `No experiments found for the application id ${applicationId}.` },
                statusText: '',
                headers: {},
                config: {},
              }; // Attach response object to error object

              throw error;
            }
          }

          resp.experiments = filteredExp;

          return resp;

        } catch (error:any) {
          this.logger.error('Exception in getAWSFisExperiments: ', error as Error);

          if(error.message && error.message.includes('getaddrinfo ENOTFOUND'))
          {
            const customError = new Error(`AWS Hostname could not be resolved.`);

            (customError as any).status = 404; // Attach status code to error object
            (customError as any).response = {
              status: 404,
              data: { message: `AWS Hostname could not be resolved.` },
            }; // Attach response object to error object

            console.error('Error in AWS FIS: ', customError);

            throw customError;
          } else if(error.message && error.message.includes("The security token included in the request is invalid.")) {
            const customError = new Error(`The security token included in the request is invalid.`);

            (customError as any).status = 403; // Attach status code to error object
            (customError as any).response = {
              status: 403,
              data: { message: `The security token included in the request is invalid.` },
            }; // Attach response object to error object

            console.error('Error in AWS FIS: ', customError);

            throw customError;
          }
          else {
            throw error;
          }
        }
      }

      customTag(tags : Record<string, string> ){
        var restunString='';
        Object.values(tags).map((name) =>{ 
          ( restunString +=name+',');
        });
        const lastCommaRemoved = restunString.replace(/,*$/, '');
        return lastCommaRemoved;
      }

      async getAWSFisExperimentTemplates(awsRegion: any, applicationId: any): Promise<any> {
        this.logger.info('AWSFisExperimentTemplates applicationId:'+applicationId);
        try {
          const fisclient= this.createFisClient(awsRegion);
          const awsFisInput = { // ListExperimentsRequest
            maxResults: 100
          };
          const command = new ListExperimentTemplatesCommand(awsFisInput);
          const resp = await fisclient.send(command);
    
          //filter response based on the tag - application-id
          var exp = resp.experimentTemplates;
          if (exp != null) {
            var filteredExpTemplates = [];
            exp.filter((element: any) => element?.tags?.application_id === applicationId)
              .forEach((element: any) => filteredExpTemplates.push({
                "creationTime": element?.creationTime?.toString(),
                "description": element?.description?.toString(),
                "id": element?.id?.toString(),
                "lastUpdateTime": element?.lastUpdateTime,
                "tags": this.customTag(element?.tags!),
                "url": 'https://' + awsRegion + '.console.aws.amazon.com/fis/home?region=' + awsRegion + '#ExperimentTemplateDetails:ExperimentTemplateId=' + element?.id?.toString()
              }));

            if (exp?.length > 0 && filteredExpTemplates?.length == 0) {
              const error = new Error(`No Templates found for the application id ${applicationId}.`);

              (error as any).status = 404; // Attach status code to error object
              (error as any).response = {
                status: 404,
                data: { message: `No Templates found for the application id ${applicationId}.` },
                statusText: '',
                headers: {},
                config: {},
              }; // Attach response object to error object

              throw error;
            }
          }

          resp.experimentTemplates = filteredExpTemplates;
          return resp;

        } catch (error: any) {
          this.logger.error('Error in getAWSFisExperimentTemplates', error as Error);

          if(error.message && error.message.includes('getaddrinfo ENOTFOUND'))
          {
            const customError = new Error(`AWS Hostname could not be resolved.`);

            (customError as any).status = 404; // Attach status code to error object
            (customError as any).response = {
              status: 404,
              data: { message: `AWS Hostname could not be resolved.` },
            }; // Attach response object to error object

            this.logger.error('Error in AWS FIS: ', customError);

            throw customError;
          } else if(error.message && error.message.includes("The security token included in the request is invalid.")) {
            const customError = new Error(`The security token included in the request is invalid.`);

            (customError as any).status = 403; // Attach status code to error object
            (customError as any).response = {
              status: 403,
              data: { message: `The security token included in the request is invalid.` },
            }; // Attach response object to error object

            this.logger.error('Error in AWS FIS: ', customError);

            throw customError;
          }
          else {
            throw error;
          }
        }
      }
}