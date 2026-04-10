# flowsource-azure-pipeline

Welcome to the flowsource-azure-pipeline plugin!

The plugin shows the details for pipelines from Azure pipeline for a particular project. 

The plugin shows all the valid pipelines in separate accordions and on expanding the accordion it shows the build/run details for each pipeline. The build/run details include the build name, duration and the status(success in green or failure in red). Also the title of each card is a link which will directly take the user to the Azure DevOps pipeline page.


## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/azure-project-name: TicketBooking #### Name of the project
  flowsource/azure-pipelines: TicketBooking,SeatAvailability  #### Name of the pipelines separated by ','
  flowsource/durationInDays: '180' #### duration in days for which data needs to be displayed
  ```


## Changes to be made to the source code to include the plugin

Add the below in EntityPage.tsx
- import{ CicdAzurePipelineComponent } from '@flowsource/plugin-flowsource-azure-pipeline/src/components/CicdAzurePipelineComponent';
-   under serviceEntityPage & websiteEntityPage
  ```typescript
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
        <CicdAzurePipelineComponent />
    </EntityLayout.Route>
    
Add the below in packages/app/package.json
- "@flowsource/plugin-flowsource-azure-devops-workitems": PLUGIN_VERSION (eg: "^1.0.0")

## UI
We will display 'N/A' in place of commit message if no commit message fetched in api.

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-azure-pipeline](http://localhost:3000/flowsource-azure-pipeline).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
