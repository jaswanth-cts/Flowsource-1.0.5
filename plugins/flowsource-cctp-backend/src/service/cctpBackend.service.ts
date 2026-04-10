import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class CctpBackendService {
  baseurl: string = ''
  username: string = ''
  password: string = ''
  headers: any;
  auth: any = null;
  logger: LoggerService;

  constructor(baseurl: string, username: string, password: string, logger: LoggerService) {
    this.baseurl = baseurl;
    this.username = username;
    this.password = password;
    this.logger = logger;
  }

  // Retrieves the count of work items based on the provided query, filtered by the current user's display name
  async getCctpToken(): Promise<any> {

    if (this.auth != null
      && this.auth != undefined
      && this.auth.leap_token != null
      && this.auth.leap_token != undefined) {
      this.logger.info('Reusing token');
      let currentTime = new Date();
      const expiresAt = new Date(this.auth.expiresAt);
      if (currentTime.getTime() > expiresAt.getTime()) {
        this.logger.info('token expired- fetching new token');
        await this.invokeCctpTokenService();
      }
    } else {
      this.logger.info('Creating token');
      await this.invokeCctpTokenService();
    }
  }

  async invokeCctpTokenService(): Promise<any> {
    try {
      const body = { "type": "native", "ue": this.username, "pd": this.password };
      this.headers = {
        'Content-Type': 'application/json'
      }
      const response = await apiRequest(
        'POST',
        `${this.baseurl}/auth/token`,
        this.headers,
        this.logger, // Pass logger as 4th parameter
        body // Pass body as 5th parameter
      );
      if (response.status === 203) {
        const error = new Error('Request failed with status code 401') as any;
        error.response = {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: '',
          headers: {},
          config: {},
        };
        throw error;
      }
       if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json();
      this.auth = {
        leap_token: data.leap_token,
        expiresAt: data.expiresAt
      }
    } catch (error) {
      this.logger.error("Error occured during token creation", error as Error);
    }
  }

  async getCctpProxy(uri: string, method: string, requestBody: any): Promise<any> {
    await this.getCctpToken();
    this.headers = {
      'Authorization': 'Bearer ' + this.auth.leap_token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    try {
      let httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
      switch (method.toUpperCase()) {
        case 'GET': {
          httpMethod = 'GET'
          break;
        }
        case 'POST': {
          httpMethod = 'POST'
          break;
        }
        case 'PUT': {
          httpMethod = 'PUT'
          break;
        }
        case 'DELETE': {
          httpMethod = 'DELETE'
          break;
        }
        default: {
          throw new Error('HTTP method set is invalid');
        }
      }
      let response: any = '';
      if (httpMethod == 'GET') {
        response = await apiRequest(
          httpMethod,
          `${this.baseurl}${uri}`,
          this.headers,
          this.logger // Pass logger as 4th parameter
        );
      } else {
        response = await apiRequest(
          httpMethod,
          `${this.baseurl}${uri}`,
          this.headers,
          this.logger, // Pass logger as 4th parameter
          requestBody // Pass body as 5th parameter
        );
      }
      return response;
    } catch (error) {
      this.logger.error("Error occured during CCTP API call", error as Error);
      return error;
    }
  }
}

