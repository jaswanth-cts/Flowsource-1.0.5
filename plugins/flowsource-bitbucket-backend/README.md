# flowsource-bitbucket

Welcome to the flowsource-bitbucket backend plugin!

The plugin shows the details for pull requests from BitBucket repo for a particular project. 

The plugin first shows three buttons to filter the pull requests:
- **Open**: Fetches and displays data for open pull requests.
- **Closed**: Fetches and displays data for closed pull requests.
- **All**: Fetches and displays data for all pull requests.

Then the plugin shows table:
- it shows a table containing the details about the PR such as the id, title, creator, created date and last updated date.

Then the plugin shows 2 graphs:
- PR Trend: It will show overall pull requests for the each month.
- PR Ageing: It will show for how long each pull request is active.

Then the plugin shows 2 charts:
- Line Chart: The line chart shows the PR cycle time for the selected duration. Each point represents the count of Merged and Approved PRs created in a specific month.
- Average PR Cycle Time: The average time from PR raised to merged within the duration.
- Average PR Review Time: The average time from PR raised to first approval within the duration.
- Average PR Merged Time: The average time from PR first approval to merged within the duration.

**Note on Color Codes**:
The charts use the following color codes based on the configuration values provided in the `app-config.yaml` or catalog annotations:
- **Red**: Indicates the value exceeds the maximum threshold.
- **Yellow**: Indicates the value is within the range but closer to the maximum threshold.
- **Green**: Indicates the value is within the acceptable range.

For example, based on the configuration:
```yaml
pullRequestCycleTime:
  PRCycleTimeMin: 8       # PR Raised to Merged
  PRCycleTimeMax: 9
  PRReviewCycleTimeMin: 3  # PR Raised to Approved
  PRReviewCycleTimeMax: 6
  PRMergeCycleTimeMin: 0  # PR Approved to Merged
  PRMergeCycleTimeMax: 1
```
- A PR cycle time of 7 days would be **Green**.
- A PR cycle time of 9 days would be **Yellow**.
- A PR cycle time of 10 days would be **Red**.
- Similar logic applies to PR review and merge times.

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-bitbucket](http://localhost:3000/flowsource-bitbucket).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

_This plugin was created through the Backstage CLI_

The plugin shows the details for pull request from bitbucket for a particular repository or project or workspace. 

The plugin shows a table containing details of the PR Trend and PR Aging. Details of the PR include id, title, creator, created and lanst updated days. Also the title of each workitem in the table is a link which will directly take the user to the Bitbucket dashboards page. User can also filter the workitems by a particular status ex: merged, open and all.

## Pre-requisites: 

catalog-info.yaml

Repository Access Token or OAuth consumer keys (clientId and clientSecret) is required for the access

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/bitbucket-repo-owner: ${PROJECTNAME} #### Name of the project
  flowsource/bitbucket-repo-name: ${REPONAME} #### repository under the the project
  flowsource/bitbucket-host:  BITBUCKET_URL (optional) by default it uses the url from app-config.yaml
  ```
## Type of access token:
Repository Access Token or OAuth consumer keys (clientId and clientSecret)

## Permissions to be given:
"Repository and Pull requests " --> Read access

## Configuration to be updated in app-config.yaml:
We need two configuration one for catalog import and another for rest API calls.
Under the integrations section we need to define username and appPassword for catalog import.
token and apiBaseUrl is optional if we are using clientId, clientSecret and apiBaseUrl bitbucket configuration in the app root.

To configure the PR cycle times, add the following settings and values to your `app-config.yaml file:

pullRequestCycleTime:
  PRCycleTimeMin: 1       # PR Raised to Merged
  PRCycleTimeMax: 2
  PRReviewCycleTimeMin: 3  # PR Raised to Approved
  PRReviewCycleTimeMax: 4
  PRMergeCycleTimeMin: 5  # PR Approved to Merged
  PRMergeCycleTimeMax: 6

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

`BITBUCKET_OAUTH_URL` is the OAuth2 token endpoint used when exchanging credentials (client ID/secret) for an access token used by the plugin to call the Bitbucket API. In most Bitbucket Cloud setups the standard token endpoint is:

```
https://bitbucket.org/site/oauth2/access_token
```

Where to put it
- Set it in your `app-config.yaml` under the top-level `bitbucket.authorizationUrl` key (recommended for deployments that use client id/secret):

```yaml
bitbucket:
  clientId: ${BITBUCKET_CLIENTID}
  clientSecret: ${BITBUCKET_CLIENTSECRET}
  apiBaseUrl: https://api.bitbucket.org/2.0/
  authorizationUrl: https://bitbucket.org/site/oauth2/access_token
```

- Or provide it via environment variable `BITBUCKET_OAUTH_URL` which will be interpolated when you use `${BITBUCKET_OAUTH_URL}` in `app-config.yaml`.

Notes and guidance
- Default: If you do not set `authorizationUrl`, the plugin expects the standard Bitbucket Cloud token endpoint above. Set this value only if you run a Bitbucket Server/Data Center instance or a proxy with a different token endpoint.
- Scopes / permissions: The OAuth consumer (clientId/clientSecret) needs permission to read repositories and pull requests. For Bitbucket Cloud this typically means repository and pull request read scopes (or a repository-scoped OAuth consumer). If you are using an app password instead, ensure it has the same read permissions.
- Integrations vs. app-config: If you configure a repository `appPassword`/token under the `integrations.bitbucketCloud` section, the plugin will prefer that for catalog imports; `clientId`/`clientSecret` + `authorizationUrl` are used for OAuth flows and API calls when using OAuth credentials.

Troubleshooting
- 500 / token exchange errors: verify `BITBUCKET_CLIENTID` and `BITBUCKET_CLIENTSECRET` are set and match the OAuth consumer in Bitbucket. Confirm `authorizationUrl` points to a reachable token endpoint.
- "clientId is not defined" or similar runtime errors: ensure `app-config.yaml` uses the correct keys (e.g. `bitbucket.clientId`) and that environment variables are exported before starting the backend so interpolation works.
- Example env export (Windows PowerShell):

```powershell
$env:BITBUCKET_CLIENTID = 'your-client-id'
$env:BITBUCKET_CLIENTSECRET = 'your-client-secret'
$env:BITBUCKET_OAUTH_URL = 'https://bitbucket.org/site/oauth2/access_token'
```

If you still see issues after confirming the config, enable backend logging and capture the token exchange request/response for diagnosis.

## Changes to be made to the source code to include the plugin:

1. In `packages/backend/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-bitbucket-backend": "^1.0.4" 
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet 
```typescript
"backend.add(import('@flowsource/plugin-flowsource-bitbucket-backend'));"
```
 after the `createBackend()` function.

## Release Notes
### Version 1.0.2
- Added the status filter.
- Created the endpoint for additional details.
### Version 1.0.4
- Implemented new API endpoints to retrieve PR cycle time data.
