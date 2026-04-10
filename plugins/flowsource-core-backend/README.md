# flowsource-core

Welcome to the flowsource-core backend plugin!

_This plugin was created through the Backstage CLI_


## Plugin Info

This Core plugin is mainly used for 

1) downloading the promptlibrary for VS code in the Zip file format from flowsource gui
2) Rest Api for adding and deleting rows in  role_mappings and email_to_role_mappings tables in auth database.
 

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-core](http://localhost:3000/flowsource-core).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

#### Token For download-aip

 Download zip functionality is allowed only with the token  with group:default/default-group, below static access token is not allowed to access download-zip.

#### Static Access Token for Rest API

For  the endpoints of roleMapping and emailtoRoleMapping,send the ROLE_RESTAPI_APIKEY as Authorization Bearer header in the request


#### app-config.yaml

In your `app-config.yaml` file, add the following property under backend.auth:
```yaml
 externalAccess:
      - type: static
        options:
          token: ${ROLE_RESTAPI_APIKEY}      
          subject: roleMapping-access
        accessRestrictions:
          - plugin: flowsource-core          ## Permits access to make requests with the static token only to this plugin

```
#### About Rest API

Endpoints:

 i) /roleMapping with put, delete and body in below format:  
   ```json  
   {
        "flowsourceRole":"xxxxx",
        "authProvider":"xxxxx",
        "authProviderRole":"xxxxxx"
   }
```

 ii) /emailtoRoleMapping with put, delete and body in below format: 
   ```json  
   {
        "email":"xxxx",
        "authProviderRole":"xxxxxxx"
   }
```


#### index.ts

In `packages/backend/src/index.ts` add the below:
```ts
backend.add(import('@flowsource/plugin-flowsource-core-backend'));
```

