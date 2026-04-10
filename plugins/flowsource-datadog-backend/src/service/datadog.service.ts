import xss from 'xss';
import { LoggerService } from '@backstage/backend-plugin-api';

export class datadogService {
  private datadogApiUrl: string;
  private apiHeaders: any;
  private apiVersion: string;

  private readonly SEARCH_URL = '/logs/events/search';
  private readonly SEARCH = 'search';
  private readonly API = 'api/';
  private readonly POST = 'POST';
  private readonly APPLICATION_JSON = 'application/json';
  logger: LoggerService;

  constructor(
    datadogApiUrl: string,
    datadogApiKey: string,
    datadogAppKey: string,
    datadogApiVersion: string,
    logger: LoggerService,
  ) {
    this.datadogApiUrl = datadogApiUrl;
    this.apiVersion = datadogApiVersion;
    this.apiHeaders = {
      Accept: this.APPLICATION_JSON,
      'Content-Type': this.APPLICATION_JSON,
      'DD-API-KEY': datadogApiKey,
      'DD-APPLICATION-KEY': datadogAppKey,
    };
    this.logger = logger;
  }

  getLogSearchEndpointUrl(endpoint: string) {
    let api = this.datadogApiUrl.endsWith('/') ? '' : '/';
    if (endpoint === this.SEARCH) {
      api += this.API + this.apiVersion + this.SEARCH_URL;
      var url = this.datadogApiUrl + api;
      return url;
    } else {
      return '';
    }
  }
  getRequestConfig(bodyData: any) {
    bodyData = JSON.parse(xss(JSON.stringify(bodyData)));
    return {
      method: this.POST,
      headers: this.apiHeaders,
      body: JSON.stringify(bodyData),
    };
  }

  private async fetchData(body: any, defaultValue: any) {
    try {
      const urlToCall = this.getLogSearchEndpointUrl(this.SEARCH);
      const config = this.getRequestConfig(body);

      const response = await fetch(urlToCall, config);
      const responseJson = await response.json();
      if (responseJson) {
        return responseJson;
      } else {
        this.logger.error(`Error in fetching data for endpoint: `, responseJson);
        return defaultValue;
      }
    } catch (error) {
      this.logger.error(`Error in fetching data for endpoint- `, error as Error);
      return defaultValue;
    }
  }

  async searchAppErrors(body: any) {
    return this.fetchData(body, {});
  }
}
