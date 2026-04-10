# flowsource-service-now

  Welcome to the flowsource-service-now plugin!

  This plugin shows info for Service Now Incidents and Requests.
  ```
    1. Non-Enviroment Component Flow:
      - Incidents from Service Now will only be displayed in ITSM Tab. Various options for filters are available.

    2. Enviroment Component Flow:
      - Order Requests and Provision Orders from Service Now will be displayed in Task Tab.
      - Incidents and Service Requests from Service Now will be displayed in ITSM Tab.
  ```

  `NOTE: Enviroment section steps and configurations can be skipped for ServiceNow if Enviroment component will not be used. In-case Enviroment component will be used, both Environment & Non-Enviroment steps & configurations must be implemented for the Environment feature to work. Please refer Enviroment Component documentation for the setup before enabling ServiceNow Environment features.`

## Prerequisites
  1. Required configuration values from `app.config` and `catalog.yaml` to retrive data from Service Now.`(Configuration values step should be same for Frontend & Backend plugin)`
  2. Integrating required code for `Service Now Frontend Plugin` to work with `Flowsource`.

### Configuration

To get started, you'll need to provide some configuration in your `app-config.yaml` and `catalog-info.yaml` files.

### 1. app-config.yaml

  In your `app-config.yaml` file, add the following properties:

  ```yaml
  SERVICENOW_USERNAME: <your_servicenow_username>
  SERVICENOW_PASSWORD: <your_servicenow_password>
  SERVICENOW_INSTANCE_URL: <your_servicenow_instance_url>
  ```
  In your `app-config.yaml` file, for `Environments` add the following properties:
  ```
    serviceNow:
      environment:
        orderTypeField: ${SERVICENOW_ORDER_FIELD}
        serviceTypeValue: ${SERVICENOW_SERVICE_TYPE_VALUE}
        orderTypeValue: ${SERVICENOW_ORDER_TYPE_VALUE}
        provisionTypeValue: ${SERVICENOW_PROVISION_TYPE_VALUE}
        agenticAIOpsLink: ${SERVICENOW_AGENTIC_AIOPS_URL}
  ```

  Replace `SERVICENOW_ORDER_FIELD` with the `name (not the label)` of your field from the ServiceNow request. The `order field` is a custom field which must be created. To get name of the field we can,
  within a request > Configure > FormDesign > Click on the `gear icon` of the respective field and get the name of the field.

  Replace `SERVICENOW_SERVICE_TYPE_VALUE, SERVICENOW_ORDER_TYPE_VALUE, SERVICENOW_PROVISION_TYPE_VALUE` with dropdown field `names (not the label)`. To get name of the field we can, within a request > Configure > FormDesign > Click on the `gear icon` of the respective field and check the dropdown section to get the names of the dropdowns.

  Replace `SERVICENOW_AGENTIC_AIOPS_URL` with URL provided by NeuroITOps team.

### 2. catalog-info.yaml
  
  In your catalog-info.yaml file, you need to add an annotation for this plugin to work:

  ```annotations:
    flowsource/servicenow-configuration-item: <configuration_item_name>
  ```
  Replace <configuration_item_name> with the name of your configuration item from ServiceNow incident.

  For `Environment` component, in catalog-info.yaml file, need to add an annotation for this plugin to work:

  ```annotations:
    flowsource/servicenow-environment-configuration-item: <configuration_item_name>
  ```
  Replace <configuration_item_name> with the name of your configuration item from `ServiceNow Request`.
  This annotation must be added to a `catalog.yaml` file with `kind: Environment` for Task Tab & ITSM Tab to work.

### 3. Service Now:
  When creating a ticket in ServiceNow, it is mandatory to fill the `Configuration Item` Field. This plugin fetches `incidents` from ServiceNow using this field.

  ## Changes to be made to the source code to include the plugin
  ```
    1.Add the below in packages/app/package.json
      - "@flowsource/plugin-flowsource-service-now": PLUGIN_VERSION (eg: "^1.0.0")
    
    2. Add the below in packages/app/src/App.tsx
      - import { FlowsourceServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
      - Under routes,
        <Route path="/flowsource-service-now" element={<FlowsourceServiceNowPage />} />
    
    3.Add the below in packages/app/src/components/catalog/EntityPage.tsx
      - import { FlowsourceServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
      - Under serviceEntityPage & websiteEntityPage, to render the tab,

        <EntityLayout.Route path="/flowsource-service-now" title="ITSM">
          <FlowsourceServiceNowPage />
        </EntityLayout.Route>
  ```

### 4. Service Now for Environments:
  When creating a `request` in ServiceNow for Environments, it is mandatory to fill the `Configuration Item` and `Custom Orders Field`. This plugin fetches requests from ServiceNow using these fields. This feature is dependent on `Environment Component` which must be setup first in `Flowsource`. Please refer `Environment Component documentation` for more info.

  ## Changes to be made to the source code to include the plugin for Environment
  ```
    1.Add the below in packages/app/package.json
      - "@flowsource/plugin-flowsource-service-now": PLUGIN_VERSION (eg: "^1.0.0")
    
    2. Add the below in packages/app/src/App.tsx
      - import { FlowsourceServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
      - Under routes,
        <Route path="/flowsource-service-now" element={<FlowsourceServiceNowPage />} />

    3.Add the below in packages/app/src/components/catalog/EntityPage.tsx
      - import { EnvironmentServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
      - import { FlowsourceServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
      - Under environmentEntityPage, to render the tabs,

        <EntityLayout.Route path="/stories" title="Tasks">
          <EnvironmentServiceNowPage />
        </EntityLayout.Route>

        <EntityLayout.Route path="/flowsource-service-now" title="ITSM">
          <FlowsourceServiceNowPage />
        </EntityLayout.Route>
  ```
<br>
