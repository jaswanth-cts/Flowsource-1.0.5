# Flowsource Jenkins Backend

This plugin displays the pipelines and their runs from Jenkins.

## Prerequisites

To access this plugin, you need to set the JENKINS_BASE_URL, JENKINS_USERNAME, and JENKINS_API_KEY in the app-config file.

Please note that the API key for this plugin requires the Job-read and View-read permissions to function properly.

## Configuration

Update the following values in the `app-config.yaml` file:
```yaml
jenkins:
  baseUrl: ${JENKINS_BASE_URL} # add the base URL of your Jenkins instance.
  username: ${JENKINS_USERNAME} # add Jenkins username.
  apiKey: ${JENKINS_API_KEY} # add API Key obtained from the Jenkins portal.
  enableTrigger: false # By default, it will be false, if you want to enable it, set it to true

```
## Source Code Changes

To make the plugin work, you need to make the following changes in the source code:

1. In `packages/backend/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-cicd-jenkins-backend": "^1.0.1" 
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet 
```typescript
"backend.add(import('@flowsource/plugin-flowsource-cicd-jenkins-backend'));"
```
 after the `createBackend()` function.

## Catalog Configuration

In the `catalog-info.yaml` file, add the following annotations 
```yaml
flowsource/jenkins-pipelines: <pipeline-name>
flowsource/durationInDays: 1
flowsource/jenkins-pipelines-trigger: <pipeline-name>
```
under the annotations field.

You can also specify multiple pipeline names by separating them with commas (without spaces). 
For example, 
```yaml
flowsource/jenkins-pipelines: pipeline1,pipeline2
flowsource/jenkins-pipelines-trigger: pipeline1
```

To access folder-type pipelines, include the path of the pipeline up to the pipeline name with job/.
For example, if the folder pipeline name is demo-folder and the pipeline you want to display is inside this folder, add:
```yaml
flowsource/jenkins-pipelines: demo-folder/job/pipelineName`
```
