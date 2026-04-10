# flowsource-azure-devops-workitems

Welcome to the flowsource-azure-devops-workitems plugin! This plugin displays Azure Boards workitems for a specific project.

## Features

- **My Stories**: Shows workitems assigned to the current user.
- **All Stories**: Displays all project workitems.
- **Active Sprint**: Filters workitems in the active sprint.
- **All Sprints**: Shows workitems from all sprints.

The plugin presents a table with workitem details (ID, title, status, priority, type). Each ID links to the Azure Boards page. Users can filter workitems by status.

An accordion section provides workitem counts and two graphs:
- **Workitems by Status**: Number of workitems per status.
- **Workitems by Priority**: Number of workitems per priority, with type distribution.

## Pre-requisites

catalog-info.yaml

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

## Integration

In `EntityPage.tsx`:
```typescript
import { FlowsourceAzureDevopsWorkitemsPage } from '@flowsource/plugin-flowsource-azure-devops-workitems';

<EntityLayout.Route path="/stories" title="Stories">
  <FlowsourceAzureDevopsWorkitemsPage/>
</EntityLayout.Route>
```

In `packages/app/package.json`:
```json
"@flowsource/plugin-flowsource-azure-devops-workitems": "PLUGIN_VERSION"
```

## Getting Started

Run `yarn start` in the root directory and navigate to [/flowsource-azure-devops-workitems](http://localhost:3000/flowsource-azure-devops-workitems). For faster development, run `yarn start` in the plugin directory.

## Release Notes

### Version 1.0.2
- UI updates for graphs and table.
- Added filtering by "My Stories", "All Stories", "Active Sprint", and "All Sprints".
- Displayed workitems with ID, title, status, priority, and type.

### Release 1.0.3
- Graph UI changes & data filtering options with FilterID or specific field

### Release 1.0.4
- Sonarqube issue fixes