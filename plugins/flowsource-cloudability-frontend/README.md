# flowsource-cloudability-frontend

Welcome to the flowsource-cloudability-frontend plugin!

The plugin shows various Cloud Consumption Metrics from Cloudability. It shows data for the current month.

### For Component kind:

### Widget description for Component kind:

- Total Cost Production: It shows the total cost incurred by all the resources across all cloud platforms being deployed for production instances.

- Total Cost Savings Opportunity Production: It shows the total cost saving opportunity for production resources accross all the resources for container and the cloud platform mentioned in the catalog file. 

- Total Cost Non-Prod: It shows the total cost incurred by all the resources across all cloud platforms being deployed for non-production instances.

- Total Cost Savings Opportunity Non-Prod: It shows the total cost saving opportunity for non-production resources accross all the resources for container and the cloud platform mentioned in the catalog file.

- Adhoc Cost: It shows the total cost incurred by the resources accross all cloud providers whose deployment type is Adhoc.


## Pre-requisites for Component kind: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/cloudability-dimension-env: tag14 #### The dimension number for enviromment(from Cloudability Tags & Labels) appended with tag
  flowsource/cloudability-dimension-appid: tag6 #### The dimension number for application id(from Cloudability Tags & Labels) appended with tag
  flowsource/cloudability-prod-tag: prod #### The tag used for production resources
  flowsource/cloudability-appid: ticket-booking #### The application id
  flowsource/cloudability-dimension-deploymentType: tag15 #### The dimension number for deployment type(from Cloudability Tags & Labels) appended with tag
  flowsource/cloudability-view: Development #### The view name for which the data needs to be displayed
  ```

## Changes to be made to the source code to include the plugin for Component kind

    Add the below in EntityPage.tsx
    - import { FlowsourceCloudabilityFrontendPage } from '@flowsource/plugin-flowsource-cloudability-frontend';
    -   under serviceEntityPage & websiteEntityPage
      ```typescript
        <EntityLayout.Route path="/finops" title="FinOps">
          <FlowsourceCloudabilityFrontendPage/>
        </EntityLayout.Route>


    Add the below in packages/app/package.json
    - "@flowsource/plugin-flowsource-cloudability-frontend": PLUGIN_VERSION (eg: "^1.0.0")


### For Environment kind:

### Widget description for Environment kind:

- Total Cost for any environment(Prod,QA etc): It shows the total cost incurred by all the resources across all cloud platforms deployed for the specified environment type.


- Total Cost Savings Opportunity for any environment(Prod,QA etc): Shows the total cost saving opportunity for the specified environment type across all containers and the cloud platform specified in the catalog file.

- Total Budgeted Cost for any environment(Prod,QA etc): Shows the total budgeted cost for the specified environment type, based on the budget name mentioned in the catalog-info.yaml file.

## Pre-requisites for Environment kind: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/cloudability-dimension-env: tag14 #### The dimension number for enviromment(from Cloudability Tags & Labels) appended with tag
  flowsource/cloudability-dimension-appid: tag6 #### The dimension number for application id(from Cloudability Tags & Labels) appended with tag
  flowsource/cloudability-appid: ticket-booking #### The application id
  flowsource/cloudability-view: Development #### The view name for which the data needs to be displayed
  flowsource/cloudability-budget-name: ADM Budget #### The budget name for which the last month budget cost needs to be displayed
  flowsource/cloudability-env-tag: prod #### The tag used for any environment type(this used only if kind type is Environment)
  ```  

## Changes to be made to the source code to include the plugin for Environment kind

Add the below in EntityPage.tsx
- import { FlowsourceCloudabilityFrontendPage } from '@flowsource/plugin-flowsource-cloudability-frontend';
-   under environmentEntityPage
  ```typescript
    <EntityLayout.Route path="/finops" title="FinOps">
      <FlowsourceCloudabilityFrontendPage/>
    </EntityLayout.Route>


Add the below in packages/app/package.json
- "@flowsource/plugin-flowsource-cloudability-frontend": PLUGIN_VERSION (eg: "^1.0.0")

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-cloudability-frontend](http://localhost:3000/flowsource-cloudability-frontend).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
