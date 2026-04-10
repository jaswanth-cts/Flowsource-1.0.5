# flowsource-cloudability

Welcome to the flowsource-cloudability backend plugin!

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
  flowsource/cloudability-prod-tag: prod #### The tag used for production resources
  flowsource/cloudability-appid: ticket-booking #### The application id
  flowsource/cloudability-dimension-deploymentType: tag15 #### The dimension number for deployment type(from Cloudability Tags & Labels) appended with tag
  flowsource/cloudability-view: Development #### The view name for which the data needs to be displayed
  flowsource/cloudability-budget-name: ADM Budget #### The budget name for which the last month budget cost needs to be displayed
  flowsource/cloudability-env-tag: prod #### The tag used for any environment type(this used only if kind type is Environment)
  ```
  

### Compatibility
 
- Cloudability version - 2.0.0
- Flowsource version - 0.2.31 or later

## Type of access token:
Service Account Token


## Configuration to be updated in app-config.yaml:
```t
cloudability:
  token: ${FINOPS_CLOUDABILITY_TOKEN} #### Service Account Token
  baseUrl: https://api.cloudability.com/v3
```


## Changes to be made to the source code to include the plugin:
Add the below in index.ts
- backend.add(import('@flowsource/plugin-flowsource-cloudability-backend'));

Add the below in packages/backend/package.json
- "@flowsource/plugin-flowsource-cloudability-backend": PLUGIN_VERSION (eg: "^1.0.0")



## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsourceCloudabilityPlugin/health](http://localhost:7007/api/flowsourceCloudabilityPlugin/health).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.
