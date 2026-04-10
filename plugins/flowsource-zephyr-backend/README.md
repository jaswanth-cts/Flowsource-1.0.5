# flowsource-zephyr

Welcome to the flowsource-zephyr backend plugin!

_This plugin was created through the Backstage CLI_

## Description

This plugin provides a comprehensive overview of your test management process by displaying key metrics such as
- Count of test cases
- Count of defects
- Stories that lack associated test cases
- Defects
- Test cycles and their respective executions

By leveraging Zephyr APIs, this plugin ensures that you have up-to-date and accurate data to monitor and improve your testing efforts effectively.

## Permissions Required

To use this plugin, you need to generate an access token to authenticate API requests to Zephyr Scale and update it in the application configurations.

### How to Generate the Token
- Click your Jira profile icon and select Zephyr Scale API Access Tokens.
- Click Create access token. A pop-up window will appear.
- Click the copy button to copy the access token.

_(Refer [api-access-tokens-management](https://support.smartbear.com/zephyr-scale-cloud/docs/en/rest-api/api-access-tokens-management.html) for more details.)_

## Configurations

Add the following configurations to your application:

#### Zephyr specific:
```yaml
zephyr:
  baseUrl: ${ZEPHYR_BASE_URL}
  accessToken: ${ZEPHYR_ACCESS_TOKEN}
```

#### JIRA specific:
```yaml
jiracustom:
  jiraUserEmail: ${JIRA_USER_EMAIL}
  jiraAccessKey: ${JIRA_ACCESS_KEY}
  jiraBaseUrl: ${JIRA_BASE_URL}
```

The base URL for API requests is usually:
```
https://api.zephyrscale.smartbear.com/v2/
```
_Refer [Zephyr Base URL](https://zephyrdocs.atlassian.net/wiki/spaces/DEVELOPER/pages/33095698/Zephyr+Enterprise+REST+API+Documentation#ZephyrEnterpriseRESTAPIDocumentation-BaseURL) for more details on which Base URL to use. For Zephyr Enterprise it could be different. E.g., `https://YOUR_SUBDOMAIN.yourzephyr.com/flex/services/rest/latest`._

### Configuration to be updated in catalog-info.yaml

Add the following annotations to your catalog-info.yaml file to specify the tools to use:

_Mandatory Annotations_:
```yaml
flowsource/jira-project-key: WebApp  #### The project key
```

_Optional Annotations_:
```yaml
flowsource/durationInDays: '180' #### Duration in days for which data needs to be displayed. By default it will 60 days (as taken from app-config.yaml). If more duration is required add duration in days for which data needs to be displayed. This will filter the list of items based on the mentioned value.
```

#### Note:
Same annotations are used in the JIRA plugin as well.

## Pre-requisites

Ensure that you have the following pre-requisites in place before using this plugin:

- Jira account with access to the Zephyr Scale API.
- Generated access token for Zephyr Scale.
- Properly configured catalog-info.yaml with the necessary annotations.

## Changes to be made to the source code to include the plugin
- Add the below in `index.ts`
    ```typescript
    backend.add(import('@flowsource/plugin-flowsource-zephyr-backend'));
    ```
- Add the below in `packages/backend/package.json`.  _Note: The version number `^1.0.0` may change over time, so ensure you use the latest version available._
    ```json
    "@flowsource/plugin-flowsource-zephyr-backend": "^1.0.0"
    ```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-zephyr/health](http://localhost:7007/api/flowsource-zephyr/health).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
