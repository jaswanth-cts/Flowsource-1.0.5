# flowsource-bitbucket

Welcome to the flowsource-bitbucket backend plugin!

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-bitbucket](http://localhost:3000/flowsource-bitbucket).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

_This plugin was created through the Backstage CLI_

The plugin shows the details for workflow from bitbucket for a particular repository or project or workspace. 

The plugin shows a list of pipline names, by expanding the each pipeline will list workflow runs details of the pipeline include id, title, duration. Also the title of each workitem in the list is a link which will directly take the user to the Bitbucket dashboards page.

## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/bitbucket-repo-owner: ${PROJECTNAME} #### Name of the project
  flowsource/bitbucket-repo-name: ${REPONAME} #### repository under the the project
  flowsource/bitbucket-host:  BITBUCKET_URL (optional) by default it uses the url from app-config.yaml
  ```
## Type of access token:
Repository Access Token or OAuth consumer keys (clientId and clientSecret)

## Permissions to be given:
"Repository and Pipelines " --> Read access

## Configuration to be updated in app-config.yaml:
We need two configuration one for catalog import and another for rest API calls.
Under the integrations section we need to define username and appPassword for catalog import.
token and apiBaseUrl is optional if we are using clientId, clientSecret and apiBaseUrl bitbucket configuration in the app root.

Note: if we provide toekn under the integration section then bitbucket configuration under the app root is not required.

# bitbucket configuration under integrations section
```yaml
  bitbucketCloud:
    - host: bitbucket.org
      token: ${BITBUCKET_TOKEN}
      username: ${BITBUCKET_CLOUD_APP_USERNAME}
      appPassword: ${BITBUCKET_CLOUD_APP_PASSWORD}
      apiBaseUrl: https://api.bitbucket.org/2.0/repositories/

```
# bitbucket configuration under app root section
```yaml
  bitbucket:
    clientId: ${BITBUCKET_CLIENTID}
    clientSecret: ${BITBUCKET_CLIENTSECRET}
    apiBaseUrl: ${BITBUCKET_API_URL}
    authorizationUrl: ${BITBUCKET_OAUTH_URL}
```

## BITBUCKET_OAUTH_URL

`BITBUCKET_OAUTH_URL` is the OAuth2 token endpoint used when exchanging credentials (client ID/secret) for an access token used by the plugin to call the Bitbucket API. For Bitbucket Cloud the standard token endpoint is:

```
https://bitbucket.org/site/oauth2/access_token
```

How to configure
- Add it to `app-config.yaml` under `bitbucket.authorizationUrl`, or provide it via the `BITBUCKET_OAUTH_URL` environment variable and reference it with `${BITBUCKET_OAUTH_URL}` in your config.

Example `app-config.yaml` snippet:

```yaml
bitbucket:
  clientId: ${BITBUCKET_CLIENTID}
  clientSecret: ${BITBUCKET_CLIENTSECRET}
  apiBaseUrl: https://api.bitbucket.org/2.0/
  authorizationUrl: https://bitbucket.org/site/oauth2/access_token
```

Notes
- Default: if not set, the plugin expects the standard Bitbucket Cloud token endpoint. Change it only for Bitbucket Server/Data Center or custom proxies.
- Scopes: OAuth consumer needs repository/pipelines read permissions. If using app passwords, ensure equivalent read scopes are granted.

Troubleshooting
- Token exchange 500 errors: verify `BITBUCKET_CLIENTID` and `BITBUCKET_CLIENTSECRET` and that `authorizationUrl` is reachable.
- "clientId is not defined": make sure `bitbucket.clientId` is present in `app-config.yaml` and environment variables are exported before starting the backend.

Example Windows PowerShell env export:

```powershell
$env:BITBUCKET_CLIENTID = 'your-client-id'
$env:BITBUCKET_CLIENTSECRET = 'your-client-secret'
$env:BITBUCKET_OAUTH_URL = 'https://bitbucket.org/site/oauth2/access_token'
```

If issues persist, enable backend logging to capture the token exchange request/response for debugging.

## Changes to be made to the source code to include the plugin:

1. In `packages/backend/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-cicd-bitbucket-backend" 
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet 
```typescript
"backend.add(import('@flowsource/plugin-flowsource-cicd-bitbucket-backend'));"
```
 after the `createBackend()` function.

## Release Notes
### Release version : 1.0.1
 - Optimized code to fetch only the required data.