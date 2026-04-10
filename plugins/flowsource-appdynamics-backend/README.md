# Flowsource AppDynamics Backend

The Flowsource AppDynamics Backend plugin provides a interface to display application error logs from AppDynamics. This plugin helps you monitor and analyze error logs efficiently.

## Features

- Displays the Application Error logs with Date and Time 
- Details column will display the whole StackTrace of the error logs 
- All the Error Count will be displayed in the bar graph for respective days.

## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
flowsource/appdynamics-application-name: <application-name>  #### Name of the project
```
### Compatibility
 
- App Dynamics version - 24.7.0
- Flowsource version - 0.2.31 or later

### app-config.yaml Configuration
```yaml
appDynamics:
  baseUrl: ${APPDYNAMICS_BASEURL}  ### Add the base url
  clientId: ${APPDYNAMICS_CLIENTID} ### Provide Client ID
  clientSecret: ${APPDYNAMICS_CLIENTSECRET}  ### Provide Client Secret
  duration: 10 ### duration in days for which data needs to be displayed
```

## Source Code Changes
1. Add the following dependencies in /packages/backend/package.json under dependencies section: 
```json
"@flowsource/plugin-flowsource-appdynamics-backend": "^1.0.0"
```

2. Add the following to the file /packages/backend/src/index.ts:  
```typescript
backend.add(import('@flowsource/plugin-flowsource-appdynamics-backend'));
```
