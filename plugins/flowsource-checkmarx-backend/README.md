# flowsource-checkmarx

Welcome to the flowsource-checkmarx backend plugin!

_This plugin was created through the Backstage CLI_

## Description

This plugin displays details about the summary report of Static Analysis from the CheckMarx scan.
Scan summary page displays details of vulnerability and other related information from CheckMarx scan in the pie chart format with  catergories of vulnerability high medium low for old issues and new issues.
Also, it shows top few files with high number of vulnerabilities

## Prerequisites
To access this plugin, you need to get the CHECKMARK-CLIENT-ID and CLIENT_SECRET and CHECKMARX server Url  and should be configired in the app-config file.

### Compatibility
 
- Checkmarx version - 9.4
- Flowsource version - 0.2.31 or later

grantType "password" is supported.


## Type of access token:
Oauth Access Token

## Permissions to be given:
grantType: password

## Configuration
 Update the following values in the app-config.yaml file: You have to connect with Checkmarx support team to collect the required config items.
    
    clientId: <CHECKMARX_CLIENT_ID>  
    clientSecret: <CHECKMARX_CLIENT_SECRET>  
    username: <CHECKMARX_USERNAME>
    password: <CHECKMARX_PASSWORD>
    grantType: <CHECKMARX_GRANT_TYPE>
    baseUrl: <CHECKMARX_BASE_URL>
    
## Source Code Changes
To make the plugin work, you need to make the following changes in the source code:

1. In packages/backend/package.json, add the plugin ID "@flowsource/plugin-flowsource-checkmarx" "^1.0.0" to the dependencies section.
```json
  "@flowsource/plugin-flowsource-checkmarx-backend": "^1.0.0",
```
2. In packages/backend/src/index.ts, add this snippet "backend.add(import('@flowsource/plugin-flowsource-checkmarx-backend'));" after the createBackend() function.

```ts
    backend.add(import('@flowsource/plugin-flowsource-checkmarx-backend'));
```

## Catalog Configuration

In the catalog-info.yaml file, add the annotation "cognizant/checkmarx-project-id: <app_name>" under the annotations field.

#### Plugin Configuration
following details  need to be provided in app-config.yaml.

## app-config.yaml
In your app-config.yaml file, add the following properties:
```yaml
checkmarx:
  clientId: <CHECKMARX_CLIENT_ID>
  clientSecret: <CHECKMARX_CLIENT_SECRET>
  username: <CHECKMARX_USERNAME>
  password: <CHECKMARX_PASSWORD>
  grantType: <CHECKMARX_GRANT_TYPE>
  baseUrl: <CHECKMARX_BASE_URL>
```
## catalog-info.yaml
In your catalog-info.yaml file, add the following properties under annotations section:
```yaml
    cognizant/checkmarx-project-id: <app-name>
```
