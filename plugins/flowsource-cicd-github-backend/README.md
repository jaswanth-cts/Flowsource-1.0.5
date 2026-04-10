# flowsource-cicd-custom

Welcome to the flowsource-cicd-custom backend plugin!

This is backend plugin for CI/CD. It includes Github Workflow actions service.
It shows the details abot the various workflows from GitHub Actions. It shows details like - the run, id and duration for a particular workflow run. Also the title of each card is a link which will directly take the user to the GitHub Actions page.


## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/github-workflows: TicketBooking-Pipeline, abc  #### Workflow names separated by ','
  flowsource/durationInDays: '180' #### Duration in days for which data needs to be displayed
  ```


## Authentication mechanism
- Using Access Token
- App Based Authentication

## Using Access Token
Type of access token: Personal Access Token

Permissions to be given: "workflow" 


## App Based Authentication
The below configurations need to be updated in app-config.yaml:

```yaml
integrations:
  github:
    - host: github.com
      # This is a Personal Access Token or PAT from GitHub. You can find out how to generate this token, and more information
      # about setting up the GitHub integration here: https://backstage.io/docs/getting-started/configuration#setting-up-a-github-integration
      # Either use the below token or config under integration.github.apps: section for setting up the integrations with GitHub 
      token: ${INTEGRATIONS_GITHUB_TOKEN}
    ### Example for how to add your GitHub Enterprise instance using the API:
    # - host: ghe.example.net
    #   apiBaseUrl: https://ghe.example.net/api/v3
    #   token: ${GHE_TOKEN}
      apps:
        - appId: ${INTEGRATIONS_GITHUB_APP_APP_ID}
          clientId: ${INTEGRATIONS_GITHUB_APP_CLIENT_ID}
          clientSecret: ${INTEGRATIONS_GITHUB_APP_CLIENT_SECRET}
          privateKey: ${INTEGRATIONS_GITHUB_APP_PRIVATE_KEY}
```

## Configuration to be updated in app-config.yaml:
```yaml
githubActions:
  baseUrl: ${CICD_GITHUB_ACTIONS_BASEURL} #### Base URL

integrations:
  github:
    - host: github.com
      # This is a Personal Access Token or PAT from GitHub. You can find out how to generate this token, and more information
      # about setting up the GitHub integration here: https://backstage.io/docs/getting-started/configuration#setting-up-a-github-integration
      # Either use the below token or config under integration.github.apps: section for setting up the integrations with GitHub 
      token: ${INTEGRATIONS_GITHUB_TOKEN}
    ### Example for how to add your GitHub Enterprise instance using the API:
    # - host: ghe.example.net
    #   apiBaseUrl: https://ghe.example.net/api/v3
    #   token: ${GHE_TOKEN}
      apps:
        - appId: ${INTEGRATIONS_GITHUB_APP_APP_ID}
          clientId: ${INTEGRATIONS_GITHUB_APP_CLIENT_ID}
          clientSecret: ${INTEGRATIONS_GITHUB_APP_CLIENT_SECRET}
          privateKey: ${INTEGRATIONS_GITHUB_APP_PRIVATE_KEY}
          webhookSecret: ${INTEGRATIONS_GITHUB_APP_WEBHOOK_SECRET}
```


## Changes to be made to the source code to include the plugin:
Add the below in index.ts
- backend.add(import('@flowsource/plugin-flowsource-cicd-github-backend'));

Add the below in packages/backend/package.json
- "@flowsource/plugin-flowsource-cicd-github-backend": PLUGIN_VERSION (eg: "^1.0.0")


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-cicd-custom](http://localhost:3000/flowsource-cicd-custom).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Release Notes
### Version 1.0.1
- UI Changes
- Fetching failure message and StepName
