
import { ClientSecretCredential } from '@azure/identity';
export class AzureAuthenticator {

  async getAzureCredentials(azure_client_id: string, azure_tenant_id: string, azure_secret_key: string): Promise<{
    credential: ClientSecretCredential;   
  }> {
    try {
      const credential = new ClientSecretCredential(
          azure_tenant_id,
          azure_client_id,
          azure_secret_key,
        );      
      return {
        credential: credential,
      };
    } catch (error) {
      console.error('Error while getting Azure credentials:', error);
      throw error;
    }
  }
}



