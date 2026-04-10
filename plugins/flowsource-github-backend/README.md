# flowsource-github

Welcome to the flowsource-github backend plugin!

## About

The Flowsource GitHub Pull Request Plugin fetches and processes pull request data from a specified GitHub repository. It provides insights such as the number of pull requests, their aging details, and categorizes them by month.

## Type of access token

To use this plugin, you need either a GitHub personal access token or GitHub App credentials. These credentials are used to authenticate API requests to GitHub.

## Permissions to be given

The following permissions are required for the GitHub token or GitHub App:

- `repo`: Read access to fetch the PR details.

## Configuration

To access the GitHub Pull Request plugin, you need to add these following configurations. These are typically stored in the `app-config.yaml` file as shown below:

Note - Either use the GitHub personal access token or GitHub App credentials

```yaml
integrations:
  github:
    - host: github.com
      token: ${INTEGRATIONS_GITHUB_TOKEN}
```

OR

```yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${INTEGRATIONS_GITHUB_APP_APP_ID}
          clientId: ${INTEGRATIONS_GITHUB_APP_CLIENT_ID}
          clientSecret: ${INTEGRATIONS_GITHUB_APP_CLIENT_SECRET}
          privateKey: ${INTEGRATIONS_GITHUB_APP_PRIVATE_KEY}
          webhookSecret: ${INTEGRATIONS_GITHUB_APP_WEBHOOK_SECRET}
```

To configure the PR cycle times, add the following settings and values to your `app-config.yaml file:

```yaml
githubPRCycleTime:
  PRCycleTimeMin: 1       # PR Raised to Merged
  PRCycleTimeMax: 2
  PRReviewCycleTimeMin: 3  # PR Raised to Approved
  PRReviewCycleTimeMax: 4
  PRMergeCycleTimeMin: 5  # PR Approved to Merged
  PRMergeCycleTimeMax: 6
```

## Changes to be made to the source code to include the plugin

Add the below code in `packages/backend/src/index.ts`

```typescript
backend.add(import('@flowsource/plugin-flowsource-github-backend'));
```

Add the below in `packages/backend/package.json`

```json
"@flowsource/plugin-flowsource-github-backend": PLUGIN_VERSION

```
## Release Notes
### Release version : 1.0.2

- Updated the Graphql query for additional details , icons and model.
- Refactored the routes to fetch PRs based on state.

### Release version : 1.0.3

- Implemented new API endpoints to retrieve PR cycle time data.

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-github](http://localhost:3000/flowsource-github).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.
