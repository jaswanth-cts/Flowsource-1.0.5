# flowsource-azure-release

Welcome to the flowsource-azure-release plugin!

The plugin displays details of release pipelines from Azure Pipelines for a specific project.

The plugin shows all the valid release pipelines in separate accordions and on expanding the accordion it shows the build/run details for each pipeline. The build/run details include the build name, duration and the status(success in green or failure in red). Also the title of each card is a link which will directly take the user to the Azure DevOps pipeline page.


## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/azure-release-pipeline: TicketBooking,SeatAvailability  #### Name of the pipelines separated by ','
  flowsource/azure-organization: myproject
  flowsource/azure-project: 336997
  ```


## Changes to be made to the source code to include the plugin

Add the below in EntityPage.tsx
- import { FlowsourceAzureReleasePage } from '@flowsource/plugin-flowsource-azure-release';

-   under serviceEntityPage & websiteEntityPage
  ```typescript
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
        <FlowsourceAzureReleasePage />
    </EntityLayout.Route>
    
Add the below in packages/app/package.json
- "@flowsource/plugin-flowsource-azure-devops-workitems": PLUGIN_VERSION (eg: "^1.0.0")

## UI
We will display 'N/A' in place of commit message if no commit message fetched in api.

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-azure-release](http://localhost:3000/flowsource-azure-release).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
