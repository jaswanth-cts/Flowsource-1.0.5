# flowsource-azure-devops-workitems

Welcome to the flowsource-azure-devops-workitems backend plugin! This plugin displays Azure Boards workitem details for a specific project.

## Features
- Table view with workitem details: id, title, status, priority, and type. Each id links to the Azure Boards page. Filter by status.
- Accordion with workitem type counts and two graphs:
  - Workitems by Status: Number of workitems per status.
  - Workitems by Priority: Number and distribution of workitems by priority and type.

## Pre-requisites: 

catalog-info.yaml
Azure Devops, devopsPAT token is required for the access

#### Annotations in the catalog yaml file should be used for the plugin:

  ##### Mandatory Annotations:
  ```yaml
    flowsource/azure-devops-project-key: SeatAvailability  #### Name of the project
  ```

  ##### Optional Annotations:
  
  below annotations are OPTIONAL and can be used together to filter the list if items displayed on Azure Devops plugin._

  ###### Duration in Days Annotation:
  ```yaml
    flowsource/durationInDays: '180' #### By default it will 60 days if more duration is required add duration in days for which data needs to be displayed. This will filter the list of items based on the modified date.
  ```

  ###### Current Sprint Details Annotation:
  ```yaml
    flowsource/azure-devops-enable-current-sprint: 'true' # By default, it will be false, if you want to enable it, set it to true
    ## If azure-devops-enable-current-sprint is true then flowsource azure-devops-current-sprint-team-name annotation is mandatory to add.
    flowsource/azure-devops-current-sprint-team-name: 'SeatAvailability Team'
    ## Specify the Team Name for the current sprint.
  ```

  ###### Filteration Using Filter Field Key and Filter Field Value:
  ```yaml
    ## flowsource/azure-devops-Filter-Field-Key and flowsource/azure-devops-Filter-Field-Key annotations should be used together
    flowsource/azure-devops-Filter-Field-Key: 'Severity' ###Specify the field of the Azure Devops to filter. The field name should follow the Azure Devops WIQL query field names'
    flowsource/azure-devops-Filter-Field-value: '3 - Medium,1 - Critical,..' ###Specify the one or more field values separated by commas(',') of the Azure Devops a to filter
  ```
  ###### Filteration Using QueryID:
  ```yaml
    flowsource/azure-devops-queryId: '123456..' ###Specify the query ID to display the particular ID filter details
  ```

### Access Token
Personal Access Token/Azure Personal Access Token

### Permissions
Read access to "Project and Team" & "Work Items"

### app-config.yaml Configuration
```yaml
azureDevOps:
  baseUrl: ${AZURE_DEVOPS_BASEURL} #### Add the base URL
  token: ${AZURE_DEVOPS_TOKEN} #### Personal access token
  organization: ${AZURE_DEVOPS_ORGANIZATION} #### Organization of the project
  azureAssignedToMeFilter: true # By default, it will be true, if you want to disable it, set it to false. This configuration is for to view the logged in user's Azure story.
```

## Source Code Changes
### index.ts
```typescript
backend.add(import('@flowsource/plugin-flowsource-azure-devops-workitems-backend'));
```

### packages/backend/package.json
```json
"@flowsource/plugin-flowsource-azure-devops-workitems-backend": "PLUGIN_VERSION"
```

## Getting Started
Run `yarn start` in the root directory and navigate to [/flowsource-azure-devops-workitems](http://localhost:3000/flowsource-azure-devops-workitems). For faster iteration, run `yarn start` in the plugin directory.

## Release Notes

### Version 1.0.2
- Added filtering by "My Stories", "All stories", "Active Sprint", and "All Sprints".

### Release 1.0.3
- Graph UI changes & data filtering options with FilterID or specific field

### Release 1.0.4
- Sonarqube issue fixes

