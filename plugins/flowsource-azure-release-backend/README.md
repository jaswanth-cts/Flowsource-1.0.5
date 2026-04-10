# flowsource-azure-release

Welcome to the flowsource-azure-release backend plugin!

The plugin displays details of release pipelines from Azure Pipelines for a specific project.

The plugin shows all the valid pipelines in separate accordions and on expanding the accordion it shows the build/run details for each pipeline. The build/run details include the build name, duration and the status(success in green or failure in red). Also the title of each card is a link which will directly take the user to the Azure DevOps pipeline page.


## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/azure-release-pipeline: TicketBooking,SeatAvailability  #### Name of the pipelines separated by ','
  ```


## Type of access token:
Personal Access Token (PAT)
 
## Permissions to be given:
Azure DevOps Service	| Scope		| Purpose
Release			| Read	        | To fetch release definitions and release details
Build			| Read		| If build artifacts are linked to releases


## Configuration to be updated in app-config.yaml:
```t
azureRelease:
  baseUrl: ${AZURE_RELEASE_BASE_URL}
  hostUrl: ${AZURE_RELEASE_HOST_URL}
  token: ${AZURE_RELEASE_TOKEN} #### Personal access token
```

## Changes to be made to the source code to include the plugin:
Add the below in index.ts
- backend.add(import('@flowsource/plugin-flowsource-azure-release-backend'));
Add the below in packages/backend/package.json
- "@flowsource/plugin-flowsource-azure-release-backend": PLUGIN_VERSION (eg: "^1.0.0")


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-azure-release](http://localhost:3000/flowsource-azure-release).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.
