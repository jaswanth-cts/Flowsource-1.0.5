import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { LoggerService } from '@backstage/backend-plugin-api';

class GithubHelper {
  octokit: any;
  logger: LoggerService;
  constructor(logger: LoggerService) {
    this.logger = logger;
  }

    // Fetches the installation ID for a GitHub App using the app's credentials.
    async fetchInstallationId(githubApp: any) {
      const appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: githubApp.appId,
          privateKey: githubApp.privateKey,
          clientId: githubApp.clientId,
          clientSecret: githubApp.clientSecret,
        },
      });
  
      const { data: installations } = await appOctokit.apps.listInstallations();
      if (installations.length === 0) {
        throw new Error('No installations found for this app.');
      }
      // Assuming you want the first installation ID
      return installations[0].id;
    }

  // Authenticates with GitHub as an app installation and initializes the Octokit client.
  async fetchGithubAppTokenFromConfig(githubApp: any) {
    const installationId = await this.fetchInstallationId(githubApp);
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        type: 'installation',
        installationId: installationId,
        appId: githubApp.appId,
        privateKey: githubApp.privateKey,
        clientId: githubApp.clientId,
        clientSecret: githubApp.clientSecret,
      },
    });
  }

  // Authenticates with GitHub using a personal access token and initializes the Octokit client.
  async fetchGithubTokenFromConfig(githubToken: any) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  // Generates the Octokit Client
  async getGithubTokenConfig(githubToken: any){
    // Determines the authentication met based on the type of the provided token.
    if (typeof githubToken === 'string') {
        this.logger.info("PSA token found");
      await this.fetchGithubTokenFromConfig(githubToken);
    } else {
        this.logger.info("Non PSA token found");
      await this.fetchGithubAppTokenFromConfig(githubToken);
    }

    return this.octokit;
  }
}

export default GithubHelper;
