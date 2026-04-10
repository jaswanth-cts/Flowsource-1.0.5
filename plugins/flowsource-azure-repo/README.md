# flowsource-azure-repo

Welcome to the flowsource-azure-repo plugin!

The plugin shows the details for pull requests from Azure repo for a particular project. 

The plugin first shows three buttons to filter the pull requests:
 **Open**: Fetches and displays data for open pull requests.
 **Closed**: Fetches and displays data for closed pull requests.
 **All**: Fetches and displays data for all pull requests.

Then the plugin shows table:

- it shows a table containing the details about the PR such as the id, title, creator, created date and last updated date.

Then the plugin shows below graphs:

- PR Trend: It will show overall pull requests for the each month.
- PR Ageing: It will show for how long each pull request is active.
- PR Cycle Time: The line chart shows the PR cycle time for the selected duration. Each point represents the Avg PR Cycle Time in days for Merged and Approved PRs created in a specific month.

#Note: The color of the average cycle calculations is determined based on the threshold values provided by the user in the catalog file or in the app-config file.

## Pre-requisites: 
catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:

- `flowsource/azure-project-name` : Name of the project
- `flowsource/azure-repo-name`: Name of the repository
- `flowsource/durationInDays`: duration in days for which data needs to be displayed

To view the PR Cycle Time, the following annotations must be added to the `catalog.yml` file:

- `flowsource/azure-PRCycleTimeMin` : Minimum days for PR Cycle Time (PR Raised to PR Merged).
- `flowsource/azure-PRCycleTimeMax` : Maximum days for PR Cycle Time (PR Raised to PR Merged).
- `flowsource/azure-PRReviewCycleTimeMin` : Minimum days for PR Review Cycle Time (PR Raised to PR Approved).
- `flowsource/azure-PRReviewCycleTimeMax` : Maximum days for PR Review Cycle Time (PR Raised to PR Approved).
- `flowsource/azure-PRMergeCycleTimeMin` : Minimum days for PR Merge Cycle Time (PR Approved to PR Merged).
- `flowsource/azure-PRMergeCycleTimeMax` : Maximum days for PR Merge Cycle Time (PR Approved to PR Merged).

## Changes to be made to the source code to include the plugin

Add the below in `packages/app/src/components/catalog/EntityPage.tsx`
- import { AzureRepoComponent } from '@flowsource/plugin-flowsource-azure-repo/src/components/AzureRepoComponent';
-   under serviceEntityPage & websiteEntityPage
  ```typescript
    <EntityLayout.Route path="/code-repository" title="Code repository">
        <AzureRepoComponent />
    </EntityLayout.Route>

Add the below in packages/app/package.json
- "@flowsource/plugin-flowsource-azure-devops-workitems": PLUGIN_VERSION (eg: "^1.0.0")

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-azure-repo](http://localhost:3000/flowsource-azure-repo).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Release Notes
### Version 1.0.3
- Added a PR Cycle Time Line chart card to display the cycle time from PR raised to PR merged in same month.
- Additionally, three Gauge charts have been included to show the average PR cycle time, average PR review time, and average PR merge time.
