import {
  ResiliencehubClient,
  ListAppsCommand,
  ListAppsCommandOutput,
  DescribeAppCommand,
  DescribeAppCommandOutput,
  DescribeResiliencyPolicyCommand,
  ResiliencyPolicy,
} from "@aws-sdk/client-resiliencehub";
import aws4 from 'aws4';
import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class resilienceHubBackendService {

  awsBaseUrl: string;
  logger: LoggerService;
  accessKeyId?: string;
  secretAccessKey?: string;
  awsRegion: string;
  constructor(awsRegion: string, logger:LoggerService, accessKeyId?: string, secretAccessKey?: string) {
    this.awsBaseUrl = "https://resiliencehub." + awsRegion + ".amazonaws.com/";
    this.logger = logger;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.awsRegion = awsRegion;
  }

  // private signRequest() : {[key: string]: string}{
  //   const signedRequest = aws4.sign({
  //     host: new URL(this.awsBaseUrl).host,
  //     method: 'POST',
  //     region: this.awsRegion,
  //   }, {
  //     accessKeyId: this.accessKeyId,
  //     secretAccessKey: this.secretAccessKey,
  //   });

  //   return signedRequest.headers as  {[key: string]: string};
  // }

  private signRequest(url: string, method: string, body: any = null): { [key: string]: string } {
    const parsedeUrl = new URL(url);
    const request = {
      host: parsedeUrl.hostname,
      path: parsedeUrl.pathname + parsedeUrl.search,
      region: this.awsRegion,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    aws4.sign(request, {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    });

    return request.headers as { [key: string]: string };
  }

  createResiliencehubClient(awsRegion: string) {
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw new Error('AWS credentials are not provided');
    }
    const resiliencehubClient =
      new ResiliencehubClient({
        credentials: { accessKeyId: this.accessKeyId || '', secretAccessKey: this.secretAccessKey || '' },
        region: awsRegion
      });
    return resiliencehubClient;
  }


  async getResiliencePolicyInfoForAppName(applicationName: any, awsRegion: any): Promise<ResiliencyPolicy> {
    try {
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      const appSummaries = listAppsCommandResponse.appSummaries == undefined ? null : listAppsCommandResponse.appSummaries[0];
      const describeAppCommandResponse = await this.getPolicyDetailsForAppArn(appSummaries?.appArn, awsRegion);
      const resiliencyPolicy = await this.getPolicyDetailsForPolicyArn(describeAppCommandResponse.app?.policyArn, awsRegion);
      return resiliencyPolicy;
    } catch (error) {
      this.logger.error('Error fetching data from resilience hub', error as Error);
      throw error;
    }

  }


  async getAppDetailsForAppName(applicationName: any, awsRegion: any): Promise<ListAppsCommandOutput> {
    try {
      const resiliencehubClient = this.createResiliencehubClient(awsRegion);
      const listAppsCommandInput = {
        name: applicationName
      };
      const listAppsCommand = new ListAppsCommand(listAppsCommandInput);
      const listAppsCommandResponse = await resiliencehubClient.send(listAppsCommand);
      if (listAppsCommandResponse.appSummaries === undefined || listAppsCommandResponse.appSummaries.length === 0) {
        throw new Error(`No application found with name: ${applicationName}`);
      } else if (listAppsCommandResponse.$metadata.httpStatusCode !== 200) {
        throw new Error(`Failed to fetch application details. Status code: ${listAppsCommandResponse.$metadata.httpStatusCode}`);
      }
      return listAppsCommandResponse;
    } catch (error: any) {
      this.logger.error('Error in getAppArnForAppName - ', error as Error);
      this.logger.error('Error in getAppArnForAppName - ', error.$response);
      throw new Error(error.$response.statusCode);
    }
  }


  async getPolicyDetailsForAppArn(appArn: any, awsRegion: any): Promise<DescribeAppCommandOutput> {
    try {
      const resiliencehubClient = this.createResiliencehubClient(awsRegion);
      const describeAppCommandInput = {
        appArn: appArn
      }
      const describeAppCommand = new DescribeAppCommand(describeAppCommandInput)
      const describeAppCommandResponse = await resiliencehubClient.send(describeAppCommand);
      if (describeAppCommandResponse.app == undefined) {
        throw new Error(`No application found with ARN: ${appArn}`);
      } else if (describeAppCommandResponse.$metadata.httpStatusCode !== 200) {
        throw new Error(`Failed to fetch application details for ARN ${appArn}. Status code: ${describeAppCommandResponse.$metadata.httpStatusCode}`);
      }
      return describeAppCommandResponse;
    } catch (error: any) {
      this.logger.error('Error in getPolicyArnForAppArn - ', error as Error);
      this.logger.error('Error in getPolicyArnForAppArn - ', error.$response);
      throw new Error(error.$response.statusCode);
    }
  }


  async getPolicyDetailsForPolicyArn(policyArn: any, awsRegion: any): Promise<any> {
    try {
      const resiliencehubClient = this.createResiliencehubClient(awsRegion);
      const describeResiliencyPolicyCommandInput = {
        policyArn: policyArn
      }
      const describeResiliencyPolicyCommand = new DescribeResiliencyPolicyCommand(describeResiliencyPolicyCommandInput);
      const describeResiliencyPolicyCommandResponse = await resiliencehubClient.send(describeResiliencyPolicyCommand);
      const resiliencyPolicy = describeResiliencyPolicyCommandResponse.policy;
      if (resiliencyPolicy == undefined) {
        throw new Error(`No resiliency policy found with ARN: ${policyArn}`);
      } else if (describeResiliencyPolicyCommandResponse.$metadata.httpStatusCode !== 200) {
        throw new Error(`Failed to fetch resiliency policy details for ARN ${policyArn}. Status code: ${describeResiliencyPolicyCommandResponse.$metadata.httpStatusCode}`);
      }
      return resiliencyPolicy;
    } catch (error: any) {
      this.logger.error('Error in getPolicyDetailsForPolicyArn - ', error as Error);
      this.logger.error('Error in getPolicyDetailsForPolicyArn - ', error.$response);
      throw new Error(error.$response.statusCode);

    }
  }

  async getResiliencyScoreDetailsForAppName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      this.logger.info("***getResiliencyScoreDetailsForAppName***");
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true';
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');
      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonData = JSON.parse(res);
      this.logger.info(jsonData.assessmentSummaries[0].assessmentArn);
      const postUrl = this.awsBaseUrl + 'describe-app-assessment';
      const postBody = {
        "assessmentArn": jsonData.assessmentSummaries[0].assessmentArn
      };
      // Sign the request and get headers
      const postHeaders = this.signRequest(postUrl, 'POST', postBody);
      // Make the  post request
      const response = await apiRequest(
        'POST',
        this.awsBaseUrl + 'describe-app-assessment',
        postHeaders,
        this.logger,
        postBody,
      )
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
      }

      const responseData = await response.text();
      const jsonPostData = JSON.parse(responseData);
      this.logger.info(jsonPostData.assessment.resiliencyScore);
      return jsonPostData.assessment.resiliencyScore;
    } catch (error) {
      this.logger.error("Error in getResiliencyScoreDetailsForAppName: ", error as Error);
      throw error;
    }
  }

  async getAlarmRecommendationsForApplicationName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true';
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');
      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonData = JSON.parse(res);
      this.logger.info(jsonData.assessmentSummaries[0].assessmentArn);
      const postUrl = this.awsBaseUrl + 'list-alarm-recommendations';
      const postBody = {
        "assessmentArn": jsonData.assessmentSummaries[0].assessmentArn
      };
      // Sign the request and get headers
      const postHeaders = this.signRequest(postUrl, 'POST', postBody);
      // Make the  post request
      const response = await apiRequest(
        'POST',
        this.awsBaseUrl + 'list-alarm-recommendations',
        postHeaders,
        this.logger,
        postBody
      )
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
      }

      const responseData = await response.text();
      const jsonPostData = JSON.parse(responseData);
      this.logger.info(jsonPostData);
      return jsonPostData;
    } catch (error) {
      this.logger.error("Error: ",error as Error);
      throw error;
    }
  }

  async getSopRecommendationsForApplicationName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true';
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');
      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonData = JSON.parse(res);
      this.logger.info(jsonData.assessmentSummaries[0].assessmentArn);
      const postUrl = this.awsBaseUrl + 'list-sop-recommendations';
      const postBody = {
        "assessmentArn": jsonData.assessmentSummaries[0].assessmentArn
      };
      const postHeaders = this.signRequest(postUrl, 'POST', postBody);
      // Make the  post request
      const response = await apiRequest(
        'POST',
        postUrl,
        postHeaders,
        this.logger,
        postBody
      )
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
      }
      const responseData = await response.text();
      const jsonPostData = JSON.parse(responseData);
      this.logger.info(jsonPostData);
      return jsonPostData;
    } catch (error) {
      this.logger.error("Error: ",error as Error);
      throw error;
    }
  }

  async getTestRecommendationsForApplicationName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true';
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');

      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonData = JSON.parse(res);
      this.logger.info(jsonData.assessmentSummaries[0].assessmentArn);
      const postUrl = this.awsBaseUrl + 'list-test-recommendations';
      const postBody = {
        "assessmentArn": jsonData.assessmentSummaries[0].assessmentArn
      };
      const postHeaders = this.signRequest(postUrl, 'POST', postBody);

      // Make the  post request
      const response = await apiRequest(
        'POST',
        postUrl,
        postHeaders,
        this.logger,
        postBody,
      )
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
      }
      const responseData = await response.text();
      const jsonPostData = JSON.parse(responseData);
      this.logger.info(jsonPostData);
      return jsonPostData;
    } catch (error) {
      this.logger.error("Error: ",error as Error);
      throw error;
    }
  }

  async getResiliencyRecommendationsForApplicationName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true'
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');
      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonData = JSON.parse(res);
      this.logger.info(jsonData.assessmentSummaries[0].assessmentArn);
      const postUrl = this.awsBaseUrl + 'list-app-component-recommendations';
      const postBody = {
        "assessmentArn": jsonData.assessmentSummaries[0].assessmentArn
      };
      const postHeaders = this.signRequest(postUrl, 'POST', postBody);
      // Make the  post request
      const response = await apiRequest(
        'POST',
        postUrl,
        postHeaders,
        this.logger,
        postBody,
      )
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
      }
      const responseData = await response.text();
      const jsonPostData = JSON.parse(responseData);
      return jsonPostData.componentRecommendations;
    } catch (error) {
      this.logger.error("Error: ",error as Error);
      throw error;
    }
  }

  async getComponentCompliancesForApplicationName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true';
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');
      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonData = JSON.parse(res);
      this.logger.info(jsonData.assessmentSummaries[0].assessmentArn);
      const postUrl = this.awsBaseUrl + 'list-app-component-compliances';
      const postBody = {
        "assessmentArn": jsonData.assessmentSummaries[0].assessmentArn
      };
      const postHeaders = this.signRequest(postUrl, 'POST', postBody);
      // Make the  post request
      const response = await apiRequest(
        'POST',
        postUrl,
        postHeaders,
        this.logger,
        postBody,
      )
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
      }
      const responseData = await response.text();
      const jsonPostData = JSON.parse(responseData);
      this.logger.info(jsonPostData.componentCompliances);
      return jsonPostData.componentCompliances;
    } catch (error) {
      this.logger.error("Error: ",error as Error);
      throw error;
    }
  }

  async getVersionAndAssessmentName(applicationName: any, awsRegion: any): Promise<any> {
    try {
      this.logger.info("***getResiliencyScoreDetailsForAppName***");
      const listAppsCommandResponse = await this.getAppDetailsForAppName(applicationName, awsRegion);
      if (listAppsCommandResponse.appSummaries == undefined) {
        return null;
      }
      const applicationArn = listAppsCommandResponse.appSummaries[0].appArn;
      const getUrl = this.awsBaseUrl + 'list-app-assessments?appArn=' + applicationArn + '&reverseOrder=true';
      // Sign the request and get headers
      const getHeaders = this.signRequest(getUrl, 'GET');

      // Make the get request
      const listAppAssessmentsResponse = await apiRequest(
        'GET',
        getUrl,
        getHeaders,
        this.logger,
      )
      if (!listAppAssessmentsResponse.ok) {
        const errorText = await listAppAssessmentsResponse.text();
        throw new Error(`HTTP error! status: ${listAppAssessmentsResponse.status}, Response body: ${errorText}`);
      }

      const res = await listAppAssessmentsResponse.text();
      const jsonPostData = JSON.parse(res);
      const response = {
        latestAssessmentName: jsonPostData.assessmentSummaries[0].assessmentName,
        appVersion: jsonPostData.assessmentSummaries[0].versionName
      }
      this.logger.info(' version and assessment name ' + response);
      return response;
    } catch (error) {
      this.logger.error("Error: ",error as Error);
      throw error;
    }
  }

}
