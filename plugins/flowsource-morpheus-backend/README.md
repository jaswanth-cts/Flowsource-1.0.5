# flowsource-morpheus

Welcome to the flowsource-morpheus backend plugin!

_This plugin was created through the Backstage CLI_

This plaugin is used to create/manage the cloud resources in the configured CLOUD enviroment using Morphes API based on resource tempaltes configuired in the Morphues server. The selected template's input is passed as JSON formate from the flowsource Infra plugin UI. 

This plugin porvidies following functionality through the flowsource-infra-provision frontend plugin.
1. Cards Page: List the configured Resource creation templates in the morpheus server.
2. ConfigurePage : Collects the input for selected template in JSON FORMAT from the User. It will list the sample template with placeholder.
3. InfraProvision Page will list all the resources created using flowsorce in configured cloud.


## Pre-requisites
To access the Morpheus API, you need to acquire an authentication token. This token, along with the Morpheus URL. 

## Type of access token:
Oauth2 token

## Permissions to be given:
  grant_type: password



## Changes to be made to the source code to include the plugin:


Plugin Id: @flowsource/plugin-flowsource-morpheus-backend 
Plugin Type: Backend

To make the plugin work, you need to make the following changes in the source code:

1.  In packages/backend/package.json, add the plugin ID "@flowsource/plugin-flowsource-morpheus-backend": "^1.0.0" to the dependencies section.

2.  In packages/backend/src/index.ts, at the end, before the backend.start() add the plugin import as fllows
  backend.add(import('@flowsource/plugin-flowsource-morpheus-backend'));

```json
  "@flowsource/plugin-flowsource-morpheus-backend": "^1.0.0",
```
## packages/backend/src/index.ts - it should be added before backend.start()
```ts
   backend.add(import('@flowsource/plugin-flowsource-morpheus-backend'));
```
## Configuration to be updated in app-config.yaml: 
```yaml
 morpheus:
  morpheus_user: <your_morpheus_user>
  morpheus_password: <your_morpheus_password>
  host_url: <your_morpheus_server_url>    # url where morpheus server installed and accessable.
  client_id: <your_MORPHEUS_CLIENT_ID>  
  grant_type: <morpheus_server_oauth_GRANT_TYPE>         # as per morpheus help document this value should be updated.
  scope: <SCOPE>                   # as per morpheus help document this value should be updated.
  user_id: <FLOWSOURCE_USER_ID>                                # till authenticated user available this value will be used.
  rejectUnauthorized: <MORPHEUS_REJ_UN_AUTH>                   # A flag to enable/disable TLS, while communicating with Morpheus Server over HTTPS.
  order_submission_enabled: <MORPHEUS_ORDER_SUBMISSION_ENABLED> #default value will be false
  field_data_len: <MORPHEUS_INPUT_FIELD_DATA_LEN>  #name of input fields lenth should not exceed this limit used in json, default will be 250 chars
  ```
Replace and with the corresponding values in the file.

