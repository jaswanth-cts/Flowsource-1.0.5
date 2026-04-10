import { apiRequest } from './apiRequest';
import CheckmarxCredentials from './model/CheckmarxCredentials';
import ClientCredentials from './model/ClientCredentials';
import { LoggerService } from '@backstage/backend-plugin-api';

class AuthService {
  private logger: LoggerService;
  constructor(logger: LoggerService) {
    this.logger = logger;
  }
  async getCheckmarxAuthToken(checkmarxCredentials: CheckmarxCredentials): Promise<ClientCredentials | undefined> {
    this.logger.info('Fetching checkmarx auth token');
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('client_id', checkmarxCredentials.getClientId());
    urlEncodedData.append('username', checkmarxCredentials.getUsername());
    urlEncodedData.append('password', checkmarxCredentials.getPassword());
    urlEncodedData.append('grant_type', checkmarxCredentials.getGrantType());
    urlEncodedData.append('client_secret', checkmarxCredentials.getClientSecret());
    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      const response = await apiRequest(
        'POST',
        checkmarxCredentials.getBaseAuthUrl(),
        headers,
        this.logger,
        urlEncodedData,
      )
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.text();
      const responseData = JSON.parse(data);
      return responseData;
    } catch (error) {
      this.logger.error('Error fetching auth token: ', error as Error);
      throw error;
    }
    return undefined;
  }
}

export default AuthService;