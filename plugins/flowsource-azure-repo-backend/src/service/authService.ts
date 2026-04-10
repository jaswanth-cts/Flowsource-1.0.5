import { Config } from '@backstage/config'; 

class AuthService {
    private config: Config; 

    constructor(config: Config) { 
        this.config = config;
    }

    async login(): Promise<string> {
        const token: string = this.config.getOptionalString('azureDevOps.token') || ''; 
        if (!token) {
            const error = new Error('This plugin has not been configured with the required values. Please ask your administrator to configure it.');
            (error as any).status = 503;
            throw error;
        }
        const base64Credentials: string = Buffer.from(`${token}:`).toString('base64');
        return base64Credentials;
    }
}

export default AuthService;
