# Flowsource Code Quality Backend

This plugin displays details about the Sonar scan analysis for a project from the SonarQube.

## Pre-requisites

To access the SonarQube plugin, you need to acquire an authentication token (SONARQUBE_TOKEN). This token, along with the SonarQube URL, are necessary credentials. These are typically stored in the app-config.yaml file.
Please note that the API key for this plugin requires the `Browse` access to function properly.

### Compatibility
 
- Sonarqube Community Edition version - 8.9
- Flowsource version - 0.2.31 or later

## Configuration

Update the following values in the `app-config.yaml` file:
```yaml
sonarqube:
  baseUrl: ${SONARQUBE_URL} # add the base URL of your SonarQube instance
  apiKey: ${SONARQUBE_TOKEN} # add the API Key obtained from the sonarqube portal 
```

## Source Code Changes

To make the plugin work, you need to make the following changes in the source code:

1. In `packages/backend/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-code-quality-backend": "^1.0.0"
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet 
```typescript
"backend.add(import('@flowsource/plugin-flowsource-code-quality-backend'));"
```
after the `createBackend()` function.

## Catalog Configuration

In the `catalog-info.yaml` file, add the annotation 
```yaml
"flowsource/sonarqube-project-key: <project-key>"
```
under the annotations field.

## Release Notes

### Version 1.0.1
- Added version along with baseUrl,apiKey in the `app-config.yaml` file:
```yaml
  sonarqube:
    baseUrl: ${SONARQUBE_URL} # add the base URL of your SonarQube instance
    apiKey: ${SONARQUBE_TOKEN} # add the API Key obtained from the sonarqube portal 
    version: ${SONARQUBE_VERSION"} # add sonarqube version
```
- Added showUpdatedLabel parameter in response based on sonarqube version to let gui display different labels.

