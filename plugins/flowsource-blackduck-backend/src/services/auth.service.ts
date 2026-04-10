import { apiRequest } from './apiRequest';
import BlackduckCredentials from './model/BlackduckCredentials';
import ClientCredentials from './model/ClientCredentials';
import { LoggerService } from '@backstage/backend-plugin-api';

class AuthService {
  private logger: LoggerService;
  constructor(logger: LoggerService) {
          this.logger = logger;
  }
  async getBlackduckAuthToken(blackduckCredentials: BlackduckCredentials): Promise<ClientCredentials | undefined> {
          this.logger.info('Fetching Blackduck auth token');
        
          try {
            const headers = {
              'Content-Type': 'application/json',
              Authorization: `token ${blackduckCredentials.getAuthToken()}`,
            };
        
            const response = await apiRequest(this.logger,
              'POST',
              blackduckCredentials.getBaseUrl()+"/api/tokens/authenticate",
              headers,
              {}, // Empty body as required
            );
        
            if (!response.ok) {
              const errorText = await response.text();
              const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
              (error as any).status = response.status;
              (error as any).response = response;
              throw error;
            }
        
            const data = await response.json();
        
            return data; 
          } catch (error : any) {
            this.logger.error('Error fetching Blackduck auth token:', error);
            throw error;
          }
        }

}

export default AuthService;