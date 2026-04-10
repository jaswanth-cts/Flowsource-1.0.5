import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';
export class AuthService {
  private logger: LoggerService;
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private authUrl: string;
  private token: string;
  private tokenExpiry: number;

  constructor(logger: LoggerService, clientId: string, clientSecret: string, baseUrl: string) {
    this.logger = logger;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.authUrl = `${this.baseUrl}/controller/api/oauth/access_token`;
    this.token = '';
    this.tokenExpiry = 0;
  }

  private async generateToken(): Promise<string> {

    const body = `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`;
    try { 
      const response = await apiRequest('POST', this.authUrl,
        {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        this.logger,
       body,
      );
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }

      const data = await response.json();
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 10) * 1000;
      return this.token;
    } catch (error: any) {
      this.logger.error('Error fetching auth token:', error);
      throw error;
    }
  }

  public async getAuthHeader(): Promise<any> {
     const currentTime = Date.now();
    if (!this.token || currentTime >= this.tokenExpiry) {
      await this.generateToken();
    } 

    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }
}
