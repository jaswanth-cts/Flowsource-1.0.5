# flowsource-azure-repo

Welcome to the flowsource-azure-repo backend plugin!

The plugin shows the details for pull requests from Azure repo for a particular project. 

The plugin first shows three buttons to filter the pull requests:
- **Open**: Fetches and displays data for open pull requests.
- **Closed**: Fetches and displays data for closed pull requests.
- **All**: Fetches and displays data for all pull requests.

Then the plugin shows table:
- it shows a table containing the details about the PR such as the id, title, creator, created date and last updated date.

Then the plugin shows 2 graphs:
- PR Trend: It will show overall pull requests for the each month.
- PR Ageing: It will show for how long each pull request is active.
- PR Cycle Time: The line chart shows the PR cycle time for the selected duration. Each point represents the Avg PR Cycle Time in days for Merged and Approved PRs created in a specific month.

## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  - `flowsource/azure-project-name`: Name of the project
  - `flowsource/azure-repo-name`: Name of the repository
  - `flowsource/azure-pipelines`: Name of the pipelines
  - `flowsource/durationInDays`: duration in days for which data needs to be displayed
  ```

## Type of access token:
Personal Access Token
## Permissions to be given:
"Code" --> Read access


## Configuration to be updated in app-config.yaml:
```t
azureDevOps:
  baseUrl: ${AZURE_DEVOPS_BASEURL} #### Add the base URL
  token: ${AZURE_DEVOPS_TOKEN} #### Personal access token
  organization: ${AZURE_DEVOPS_ORGANIZATION} #### Organization of the project
```

To configure the PR cycle times, add the following settings and values to your `app-config.yaml file:

```yaml
pullRequestCycleTime:
  PRCycleTimeMin: 1       # PR Raised to Merged
  PRCycleTimeMax: 2
  PRReviewCycleTimeMin: 3  # PR Raised to Approved
  PRReviewCycleTimeMax: 4
  PRMergeCycleTimeMin: 5  # PR Approved to Merged
  PRMergeCycleTimeMax: 6
```

## Changes to be made to the source code to include the plugin:
Add the below in index.ts
- backend.add(import('@flowsource/plugin-flowsource-azure-repo-backend'));
Add the below in packages/backend/package.json
- "@flowsource/plugin-flowsource-azure-repo-backend": PLUGIN_VERSION (eg: "^1.0.0")


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-azure-repo](http://localhost:3000/flowsource-azure-repo).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Release Notes
### Version 1.0.3
- Implemented new API endpoints to retrieve PR cycle time data.