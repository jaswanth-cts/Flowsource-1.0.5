# flowsource-infra-provision

Welcome to the flowsource-infra-provision plugin!

_This plugin was created through the Backstage CLI_

## Pre-requisites and Configurations

Please refer "flowsource-morpheus-backend" README for the plugin configurations.

This plugin UI  List/Manage the Cloud resources created using flowsource morpheus backed plunin.

## UI Descrption
This plugin contains following UI components to Manage the cloud resources.
1. Cards Page: List the configured Resource creation templates in the morpheus server.
2. ConfigurePage : Collects the input for selected template in JSON FORMAT from the User. It will list the sample template with placeholder.
3. InfraProvision Page will list all the resources created using flowsorce in configured cloud.

To make the plugin work, you need to make the following changes in the source code:

1. In packages/app/package.json, add the plugin ID 
```json
"@flowsource/plugin-flowsource-infra-provision": "^1.0.0" to the dependencies section.
```
2. In packages/app/src/App.tsx, add import as follows 
```tsx
    import { FlowsourceInfraProvisionPage } from '@flowsource/plugin-flowsource-infra-provision';
```

3. Add routes as follows in the <FlatRoutes></FlatRoutes> section of App.tsx
```tsx
    <Route path="/flowsource-infra-provision" element={<FlowsourceInfraProvisionPage />} />
```
## Catalog Configuration
There is no catalog-info for this plugin.


## app.config ServiceNow for Environment:
```
    morpheus:
    environment:
        enableServiceNowEnvMapping: ${SNOW_INFRA_PROVISION_ENV_MAPPING}
```
Replace `SNOW_INFRA_PROVISION_ENV_MAPPING` with `true or false`. This is a mandatory field if provision order card needs to be displayed in `Infra Provisioning` page. This must be enabled only if component type `Enviroment` will be used. This key also dependent on the other `ServiceNow - Environment keys` to display data. To make the key enabled set `true` otherwise bydefault this value needs to be set to `false`. The `catalog.yaml`'s annotation which is used by ServiceNow is not needed for this, only `app.config values` are needed, both the `Environment` & `Non-Enviroment` values.
Please refer `Environment Component Documentation` on how to setup `Environment Component` in `Flowsource`. Please refer `Service Now Documentation`on how to enable and load Service Now data. 