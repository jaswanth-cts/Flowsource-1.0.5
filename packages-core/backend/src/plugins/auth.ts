import {
  providers,
  GithubOAuthResult,
  OAuthResult,
} from '@backstage/plugin-auth-backend';
import { getUpdatedUserRefs, getUserRoles } from './helper/auth-helper';
import { initDatabase } from './database/initDatabase.service';
import { RoleMappingDatabaseService } from './database/roleMappingDatabase.service';
import { Knex } from 'knex';
import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model'; // Added for Azure AD Auth
import { decodeJwt } from 'jose';
import { EmailToRoleMappingDatabaseService } from './database/emailToRoleMappingDatabase.service';
import { AuthResolverContext, OAuthAuthenticatorResult, PassportProfile, SignInInfo ,
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
  createProxyAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { Config } from '@backstage/config';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { DatabaseService, LoggerService, RootConfigService , createBackendModule, coreServices } from '@backstage/backend-plugin-api';

import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import { microsoftAuthenticator } from '@backstage/plugin-auth-backend-module-microsoft-provider';
import { oauth2ProxyAuthenticator } from '@backstage/plugin-auth-backend-module-oauth2-proxy-provider';

import { AwsAlbResult } from '@backstage/plugin-auth-backend-module-aws-alb-provider';
import { GcpIapTokenInfo } from '@backstage/plugin-auth-backend-module-gcp-iap-provider';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from '@octokit/rest';

const HEADER_KEY_PROVIDER = 'provider';
const HEADER_KEY_USER = 'x-auth-request-user';
let gitHubInstalltionId: number;

//Fucntion is use to fetch the team of the user's team info from github
async function getGithubTeamsOfUser(config: Config, username: any) {
  let teams: any = [];
  let octokit: Octokit;
  octokit = await getGithubOctokitClient(config);
  try {
    let environment = config.getString('auth.environment');
    const organization = config.getString('auth.providers.github.' + environment + '.githubOrganization');

    const query = `query($cursor: String, $org: String!, $userLogins: [String!], $username: String!)  {
          user(login: $username) {
              id
          }
          organization(login: $org) {
            teams (first:1, userLogins: $userLogins, after: $cursor) { 
                nodes {
                  name
              }
              pageInfo {
                hasNextPage
                endCursor
              }        
            }
          }
      }`;

    let data: any;
    let cursor = null;

    // We need to check if the user exists, because if it doesn't exist then all teams in the org
    // are returned. If user doesn't exist graphql will throw an exception
    // Paginate
    do {
      data = await octokit.graphql(query, {
        "cursor": cursor,
        "org": organization,
        "userLogins": [username],
        "username": username
      });

      teams = teams.concat(data.organization.teams.nodes.map((val: any) => {
        return val.name;
      }));
      cursor = data.organization.teams.pageInfo.endCursor;
    } while (data.organization.teams.pageInfo.hasNextPage);

  } catch (error) {
    console.log(error);
  }
  return teams;
}

//Fuction to fetch the GitHub App and Github personal access token configuration
function getGithubAppConfig(config: Config) {
  const gitTokenArray: any[] = config.getOptionalConfigArray('integrations.github') || [];
  const githubTokenIndex: number = 0;
  const appIdIndex: number = 0;
  let githubConfigData = {
    appId: gitTokenArray[githubTokenIndex].data.apps[appIdIndex].appId,
    privatekey: gitTokenArray[githubTokenIndex].data.apps[appIdIndex].privateKey,
    clientId: gitTokenArray[githubTokenIndex].data.apps[appIdIndex].clientId,
    clientSecret: gitTokenArray[githubTokenIndex].data.apps[appIdIndex].clientSecret
  };
  return githubConfigData;
}

//Function to get Github Octokit Client
async function getGithubOctokitClient(config: Config): Promise<Octokit> {
  const gitTokenArray: any[] = config.getConfigArray('integrations.github');
  //The first github token from the Integration is taken from the app-config.yaml
  const gitPersonalAccessToken = gitTokenArray[0].data.token;
  const githubAppTokenArray = gitTokenArray[0].data.apps;
  let octokit: Octokit;
  if (gitPersonalAccessToken != null && gitPersonalAccessToken != undefined) {
    //Create a Octokit client using the GitHub Personal Access token
    octokit = new Octokit({
      auth: gitPersonalAccessToken,
    });
  } else if (githubAppTokenArray != null && githubAppTokenArray != undefined) {
    //Create a Octokit client using the GitHub App configration data
    const installationId = await fetchInstallationId(config);
    octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: getGithubAppConfig(config).appId,
        privateKey: getGithubAppConfig(config).privatekey,
        clientId: getGithubAppConfig(config).clientId,
        clientSecret: getGithubAppConfig(config).clientSecret,
        installationId: installationId,
      },
    });
  } else {
    //GitApp or GitHub Personal Access token configuration is not found
    const exceptionMessage = 'GitApp or GitHub Personal Access token confgiguration in app-config.yaml is not found';
    throw new Error(exceptionMessage);
  }
  return octokit;
}

//Fetches the installation ID for a GitHub App using the app's credentials.
async function fetchInstallationId(config: Config) {

  if (gitHubInstalltionId != null && gitHubInstalltionId != undefined) {
    return gitHubInstalltionId;
  } else {

    const appOctokit: any = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: getGithubAppConfig(config).appId,
        privateKey: getGithubAppConfig(config).privatekey,
        clientId: getGithubAppConfig(config).clientId,
        clientSecret: getGithubAppConfig(config).clientSecret,
      },
    });
    const { data: installations } = await appOctokit.apps.listInstallations();
    if (installations.length === 0) {
      throw new Error('No installations found for this app.');
    }
    // Assuming you want the first installation ID
    return installations[0].id;
  }
}

export async function githubResolver(info: SignInInfo<GithubOAuthResult> | SignInInfo<OAuthAuthenticatorResult<PassportProfile>>,
  ctx: AuthResolverContext,
  config: Config | RootConfigService,
  database: PluginDatabaseManager,
  logger: LoggerService) {
  let username: any = info?.result?.fullProfile?.username;
  let teams: any = await getGithubTeamsOfUser(config, username);

  const db: Knex = await database.getClient();
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);

  const userRefs = await getUpdatedUserRefs(teams, 'github', roleMappingDatabaseService); // Fetch the updated user references
  const usernameEntityRef = stringifyEntityRef({
    kind: 'User',
    name: username,
    namespace: DEFAULT_NAMESPACE,
  });
  logger.info(`Resolved user ${username} with ${userRefs.length} userRefs entities`);

  return ctx.issueToken({
    claims: {
      sub: usernameEntityRef, // The user's own identity
      ent: userRefs
    },
  });
}

export async function microsoftResolver(info: SignInInfo<OAuthResult> | SignInInfo<OAuthAuthenticatorResult<PassportProfile>> | any,
  database: PluginDatabaseManager,
  ctx: AuthResolverContext,
  logger: LoggerService) {
  logger.debug('In microsoft resolver - info - ' + JSON.stringify(info));
  let idToken: any;
  const params = info.result.params;
  const session = info.result.session;
  if (params) {
    idToken = decodeJwt(params.id_token!);
    logger.info('Using id_token from info.result.params, in microsoft resolver');
  } else if (session) {
    idToken = decodeJwt(session.idToken!);
    logger.info('Using idToken from info.result.session, in microsoft resolver');
  } else {
    logger.warn('Can\'t extract idToken from info object, in microsoft resolver');
  }

  if (!info.profile.email) {
    throw new Error(
      'Login failed, user profile does not contain an email'
    );
  }
  const userEntityRef = stringifyEntityRef({
    kind: 'User',
    name: info.profile.email,
    namespace: DEFAULT_NAMESPACE,
  });
  let roleArray: any = [];
  if (idToken.roles) {
    roleArray = idToken.roles;
  } else {
    logger.warn("No role found, in microsoft resolver");
  }

  const db: Knex = await database.getClient();
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);

  const userRefs = await getUpdatedUserRefs(roleArray, 'microsoft', roleMappingDatabaseService); // Fetch the updated user references
  return ctx.issueToken({
    claims: {
      sub: userEntityRef,
      ent: userRefs,
    },
  });
}


export async function awsCognitoResolver(info: SignInInfo<OAuthResult> | SignInInfo<OAuthAuthenticatorResult<PassportProfile>> | any,
  database: PluginDatabaseManager,
  ctx: AuthResolverContext) {
  const idToken: any = decodeJwt(info.result.fullProfile.tokenset.id_token!);
  if (!info.profile.email) {
    throw new Error(
      'Login failed, user profile does not contain an email'
    );
  }
  const usernameEntityRef = stringifyEntityRef({
    kind: 'User',
    name: info.profile.email,
    namespace: DEFAULT_NAMESPACE,
  });

  let roleArray: any = [];
  if (idToken?.['cognito:groups']) {
    roleArray = idToken?.['cognito:groups'];
  } else {
    console.log("No role found");
  }
  const db: Knex = await database.getClient();
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);
  const userRefs = await getUpdatedUserRefs(roleArray, 'cognito', roleMappingDatabaseService); // Fetch the updated user references

  return ctx.issueToken({
    claims: {
      sub: usernameEntityRef, // The user's own identity
      ent: userRefs,
    },
  });
}

export async function keycloakResolver(info: SignInInfo<OAuthResult> | SignInInfo<OAuthAuthenticatorResult<PassportProfile>> | any, config: Config,
  database: PluginDatabaseManager,
  ctx: AuthResolverContext) {
  var resp: any = info.result.fullProfile.userinfo.resource_access;
  const email = info.result.fullProfile.userinfo?.email + '';
  const userPrincipalName = info.result.fullProfile.userinfo?.userPrincipalName + '';
  var environment = config.getString('auth.environment');
  var clientIdPath = 'auth.providers.keycloak.' + environment + '.clientId';
  var clientId = config.getString(clientIdPath);
  const roles: any[] = resp?.[clientId].roles;
  const userRef = stringifyEntityRef({
    kind: 'User',
    name: email,
    namespace: DEFAULT_NAMESPACE,
  });


  const db: Knex = await database.getClient();
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);
  const userRefs = await getUpdatedUserRefs(roles, 'keycloak', roleMappingDatabaseService); // Fetch the updated user references
  if(userPrincipalName !== null && userPrincipalName !== undefined && userPrincipalName !== 'undefined'  ){
    return ctx.issueToken({
      claims: {
        sub: userRef, // The user's own identity
        ent: userRefs, // A list of identities that the user claims ownership through
        upn: userPrincipalName //Add user principal name in claims
      },
    });
  } else {
    return ctx.issueToken({
      claims: {
        sub: userRef, // The user's own identity
        ent: userRefs, // A list of identities that the user claims ownership through
      },
    });
  }
}

export async function oauth2ProxyResolver(result: any,
  ctx: AuthResolverContext,
  config: Config | RootConfigService,
  database: PluginDatabaseManager,
  logger: LoggerService) {
  logger.debug('In oauth2Proxy resolver - result - ', result);

  const authProvider = result.getHeader(HEADER_KEY_PROVIDER);
  if (!authProvider) {
    logger.error('Missing auth provider in the request header');
    throw new Error('Missing auth provider in the request header');
  }

  let teamsOrRoles: any = [];
  let userEntityName: any;
  let usernameEntityRef: any;

  if (authProvider === 'github') {
    const username = result.getHeader(HEADER_KEY_USER);
    if (!username) {
      logger.error('Missing username in the request header');
      throw new Error('Missing username in the request header');
    }
    userEntityName = username;

    teamsOrRoles = await getGithubTeamsOfUser(config, username);

  } else if (authProvider === 'microsoft') {
    const idTokenEncoded: any = result.getHeader('Auth');
    const idToken: any = decodeJwt(idTokenEncoded);

    if (!idToken.email) {
      logger.error('Login failed, user profile does not contain an email');
      throw new Error('Login failed, user profile does not contain an email');
    }
    userEntityName = idToken.email;

    if (idToken.roles) {
      teamsOrRoles = idToken.roles;
    } else {
      console.log("No role found");
    }

  }

  usernameEntityRef = stringifyEntityRef({
    kind: 'User',
    name: userEntityName,
    namespace: DEFAULT_NAMESPACE,
  });

  const db: Knex = await database.getClient();
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);

  const userRefs = await getUpdatedUserRefs(teamsOrRoles, authProvider, roleMappingDatabaseService); // Fetch the updated user references

  return ctx.issueToken({
    claims: {
      sub: usernameEntityRef, // The user's own identity
      ent: userRefs, // A list of identities that the user claims ownership through
    },
  });
}

async function awsAlbResolver(obj: SignInInfo<AwsAlbResult>, database: DatabaseService, ctx: AuthResolverContext) {
  const profile: any = obj?.profile;
  if (!profile.email) {
    throw new Error('Profile contained no email');
  }

  const [id] = profile.email.split('@');
  if (!id) {
    throw new Error('Invalid email format');
  }

  const userRef = stringifyEntityRef({
    kind: 'User',
    name: profile.email,
    namespace: DEFAULT_NAMESPACE,
  });

  let roleArray: any = [];
  if (profile.accessToken) {
    const accessTokenDecoded: any = decodeJwt(profile.accessToken);
    if (accessTokenDecoded.roles) {
      roleArray = accessTokenDecoded.roles;
    } else {
      console.warn("roles not found in accessToken");
    }
  }

  const db: Knex = await database.getClient();
  const emailToRoleMappingDatabaseService = new EmailToRoleMappingDatabaseService(db);
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);

  if (!roleArray || roleArray.length === 0) {
    // Get the authProvider roles from the emailToRoleMapping database service for the given email
    roleArray = await getUserRoles(profile.email, emailToRoleMappingDatabaseService);
  }

  if (!roleArray || roleArray.length === 0) {
    // If no roles are found for the user, log a warning and continue with the default role
    console.warn('Unauthorized - No roles found for the user - ' + profile.email);
  }

  const userRefs = await getUpdatedUserRefs(roleArray, 'microsoft', roleMappingDatabaseService);

  const { token } = await ctx.issueToken({
    claims: {
      sub: userRef,
      ent: userRefs,
    },
  });

  return { id, token };
}

function awsAlbAuthHandler(obj: AwsAlbResult) {
  const fullProfile = obj?.fullProfile;
  const accessToken = obj?.accessToken;
  let email: string | undefined = undefined;
  if (fullProfile.emails && fullProfile.emails.length > 0) {
    const [firstEmail] = fullProfile.emails;
    email = firstEmail.value;
  }

  const displayName: string | undefined = fullProfile.displayName ?? fullProfile.username ?? fullProfile.id;

  return {
    profile: {
      email,
      displayName,
      accessToken,
    },
  };
}


function gcpIapAuthHandler(iapToken: GcpIapTokenInfo) {
  const gcpObj = JSON.stringify(iapToken.gcip);
  const parsedObj = JSON.parse(gcpObj);

  const displayName: string | undefined =
    parsedObj.name ?? parsedObj.email ?? parsedObj.user_id;
  const parsedEmail: string = parsedObj.email ?? '';

  return {
    profile: {
      parsedEmail,
      displayName,
    },
  };
}

async function gcpIapResolver(iapToken: GcpIapTokenInfo, database: DatabaseService, ctx: AuthResolverContext) {
  const gcpObj = JSON.stringify(iapToken.gcip);
  const parsedObj = JSON.parse(gcpObj);
  const parsedEmail: string = parsedObj.email ?? '';
  const id = parsedEmail;

  const sub = stringifyEntityRef({
    kind: 'User',
    name: id,
    namespace: DEFAULT_NAMESPACE,
  });

  const db: Knex = await database.getClient();
  const emailToRoleMappingDatabaseService = new EmailToRoleMappingDatabaseService(db);
  const roleMappingDatabaseService = new RoleMappingDatabaseService(db);

  // Get the roles for the user
  let roleArray = await getUserRoles(
    parsedEmail,
    emailToRoleMappingDatabaseService,
  );

  if (!roleArray || roleArray.length === 0) {
    // If no roles are found for the user, log a warning and continue with the default role
    console.warn('Unauthorized - No roles found for the user - ' + parsedEmail);
  }

  const userRefs = await getUpdatedUserRefs(
    roleArray,
    'gcp-iap',
    roleMappingDatabaseService,
  );

  const ent = userRefs;

  return ctx.issueToken({ claims: { sub, ent } });
}

export const customAuthProvidersModule = createBackendModule({
  // This ID must be exactly "auth" because that's the plugin it targets
  pluginId: 'auth',
  // This ID must be unique, but can be anything
  moduleId: 'custom-auth-providers-module',

  register(reg) {

    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
        config: coreServices.rootConfig,
        database: coreServices.database,
        logger: coreServices.logger,
      },

      async init({ providers: authProviders, config, database, logger }) {

        const oidcProvider:any = oidcAuthenticator;
        // Initialize/create the database
        await initDatabase({
          logger: logger,
          database: database,
        });

        // Register Github provider
        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'github',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator,
            async signInResolver(info, ctx) {
              return githubResolver(info, ctx, config, database, logger);
            },
          }),
        });

        const microsoftOauthAuthenticator: any = microsoftAuthenticator;
        // Register Microsoft provider
        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'microsoft',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: createOAuthProviderFactory({
            authenticator: microsoftOauthAuthenticator,
            async signInResolver(info, ctx) {
              return microsoftResolver(info, database, ctx, logger);
            },
          }),
        });

        // Register AWS Cognito Auth provider
        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'cognito',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: createOAuthProviderFactory({
            authenticator: oidcProvider,
            async signInResolver(info, ctx) {
              return awsCognitoResolver(info, database, ctx);
            }
          }),
        });

        // Register Keycloak OIDC Auth provider
        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'keycloak',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: createOAuthProviderFactory({
            authenticator: oidcProvider,
            async signInResolver(info, ctx) {
              return keycloakResolver(info, config, database, ctx);
            }
          }),
        });

        // Register OAuth2Proxy provider
        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'oauth2Proxy',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: createProxyAuthProviderFactory({
            authenticator: oauth2ProxyAuthenticator,
            async signInResolver({ result }, ctx) {
              return oauth2ProxyResolver(result, ctx, config, database, logger);
            },
          }),
        });

        const awsAlbFactory: any = providers.awsAlb.create({ // Factory creation based on the old style itself, to include authHandler logic
          async authHandler(obj) {
            return awsAlbAuthHandler(obj);
          },
          signIn: {
            async resolver(obj, ctx) {
              return await awsAlbResolver(obj, database, ctx);
            },
          },
        });

        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'awsalb',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: awsAlbFactory,
        });

        const gcpIapFactory: any = providers.gcpIap.create({ // Factory creation based on the old style itself, to include authHandler logic
          async authHandler({ iapToken }) {
            return gcpIapAuthHandler(iapToken);
          },
          signIn: {
            async resolver({ result: { iapToken } }, ctx) {
              return await gcpIapResolver(iapToken, database, ctx);
            },
          },
        });

        authProviders.registerProvider({
          // This ID must match the actual provider config, e.g. addressing
          // auth.providers.github means that this must be "github".
          providerId: 'gcp-iap',
          // Use createProxyAuthProviderFactory instead if it's one of the proxy
          // based providers rather than an OAuth based one
          factory: gcpIapFactory,
        });
      },
    });
  },
});
