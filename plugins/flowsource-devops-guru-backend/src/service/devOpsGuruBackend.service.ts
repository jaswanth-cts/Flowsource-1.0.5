import { apiRequest } from './apiRequest';
import aws4 from 'aws4';
import { LoggerService } from '@backstage/backend-plugin-api';

export class devOpsGuruBackendService {
  awsBaseUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
  statusFilterFromTime: string;
  private headers: any;
  logger: LoggerService;
  constructor(accessKeyId: string, secretAccessKey: string, statusFilterFromTime: string, logger: LoggerService) {
    this.awsBaseUrl = "https://devops-guru.ap-southeast-1.amazonaws.com/";
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.statusFilterFromTime = statusFilterFromTime;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.logger = logger;
  }
  private signRequest(endpoint: string, body: any) : {[key: string]: string}{
    const signedRequest = aws4.sign({
      host: new URL(this.awsBaseUrl).host,
      path: endpoint,
      method: 'POST',
      region: 'ap-southeast-1',
      headers: this.headers,
      body: JSON.stringify(body)
    }, {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    });

    return signedRequest.headers as  {[key: string]: string};
  }


  async getReactiveInsightsFromAwsDevOpsGuru(_applicationName: string): Promise<any> {
    let dateNow = Date.now();
    const endpoint = 'insights';
    const body = {
      "StatusFilter": {
        "Any": {
          "StartTimeRange": {
            "FromTime": parseInt(this.statusFilterFromTime),
            "ToTime": dateNow
          },
          "Type": "REACTIVE"
        }

      }
    };
    // Sign the request and get headers
    const signedHeaders = this.signRequest(endpoint, body);

    // Make the request
    const response = await apiRequest(
      'POST',
      this.awsBaseUrl + endpoint,
       signedHeaders,
        this.logger,
       body
    )
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
    }

    return await response.json();
  }

  async getProactiveInsightsFromAwsDevOpsGuru(_applicationName: string): Promise<any> {
    let dateNow = Date.now();
    const endpoint = 'insights';
    const body = {
      "StatusFilter": {
        "Any": {
          "StartTimeRange": {
            "FromTime": parseInt(this.statusFilterFromTime),
            "ToTime": dateNow
          },
          "Type": "PROACTIVE"
        }

      }
    };
    // Sign the request and get headers
    const signedHeaders = this.signRequest(endpoint, body);

    // Make the request
    const response = await apiRequest(
      'POST',
      this.awsBaseUrl + endpoint,
       signedHeaders,
       this.logger,
       body
    )
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
    }

    return await response.json();
  }
}