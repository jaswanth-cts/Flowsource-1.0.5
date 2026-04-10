import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  createApiRef,
  ApiRef,
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
  discoveryApiRef,
  oauthRequestApiRef
} from '@backstage/core-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';

export const awsCognitoOIDCAuthApiRef: ApiRef<
  OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi
> = createApiRef({
  id: 'cognito',
});

export const keycloakOIDCAuthApiRef: ApiRef<
  OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi
> = createApiRef({
  id: 'keycloak',
});

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: awsCognitoOIDCAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
      OAuth2.create({
        discoveryApi,
        oauthRequestApi,
        provider: {
          id: 'cognito',
          title: 'AWS Cognito auth provider.',
          icon: () => null,
        },
        environment: configApi.getOptionalString('auth.environment'),
        defaultScopes: ['openid', 'profile', 'email'],
        popupOptions: {
          // optional, used to customize login in popup size
          size: {
            fullscreen: false,
          },
          /**
           * or specify popup width and height
           * size: {
              width: 1000,
              height: 1000,
            }
           */
        }
      }),
    }),
  
  createApiFactory({
    api: keycloakOIDCAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
      OAuth2.create({
        discoveryApi,
        oauthRequestApi,
        provider: {
          id: 'keycloak',
          title: 'Keycloak auth provider.',
          icon: () => null,
        },
        environment: configApi.getOptionalString('auth.environment'),
        defaultScopes: ['openid', 'profile', 'email'],
        popupOptions: {
          // optional, used to customize login in popup size
          size: {
            fullscreen: false,
          },
          /**
           * or specify popup width and height
           * size: {
              width: 1000,
              height: 1000,
            }
           */
        }
      }),
    }),
];
