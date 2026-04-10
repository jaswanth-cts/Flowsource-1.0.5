# flowsource-github-copilot

Welcome to the flowsource-github-copilot backend plugin!

This plugin displays details about the summary of the usage metrics for Copilot completions (By Language & Editor), Copilot Chat and number of active users in the IDE across an organization

## Pre-requisites

To use this plugin, you need either a GitHub personal access token or GitHub App credentials. These credentials are used to authenticate API requests to GitHub.

## Requirement about the Token

Copilot usage metrics requires the Github Token or GitHub App tagged to the Organization owner level.

## Permissions Required

Please note that the Github token or GitHub App for this plugin require the below scope to function properly.

```
manage_billing:copilot, read:org or read:enterprise
```

## Configuration

To use the Github Copilot backend, you will need to configure the following in the `app-config.yaml` file.

- `GITHUB_ORGANIZATION`: The Organization for which the copilot metrics have to be fetched.
### Token based
- `INTEGRATIONS_GITHUB_TOKEN`: Generate the github personal access tokens (classic) with correct scope (manage_billing:copilot, read:org or read:enterprise).
### App based
-  `INTEGRATIONS_GITHUB_APP_APP_ID`, `INTEGRATIONS_GITHUB_APP_CLIENT_ID`, `INTEGRATIONS_GITHUB_APP_CLIENT_SECRET`, `INTEGRATIONS_GITHUB_APP_PRIVATE_KEY` & `INTEGRATIONS_GITHUB_APP_WEBHOOK_SECRET': These are generated as part of app based authentication

Note - Either use the GitHub personal access token or GitHub App credentials

```yaml
integrations:
  github:
    - host: github.com
      token: ${INTEGRATIONS_GITHUB_TOKEN}

auth:
  environment: development
  session:
  providers:
    github:
      development:
        githubOrganization: ${GITHUB_ORGANIZATION}
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

auth:
  environment: development
  session:  
  providers:
    github:
      development:
        githubOrganization: ${GITHUB_ORGANIZATION}
```

## Changes to be made to the source code to include the plugin

To make the plugin work, you need to make the following changes in the source code:

1. Add the below plugin ID to the dependencies section in `packages/backend/package.json` 
    ```json
   "@flowsource/plugin-flowsource-github-copilot-backend": "PLUGIN_VERSION"
    ```
2. Add the below snipper after `createBackend()` function in `packages/backend/src/index.ts`
   ```typescript
   "backend.add(import('@flowsource/plugin-flowsource-github-copilot-backend'));"
   ```

## Catalog Configuration

No changes in `catalog-info.yaml` file.