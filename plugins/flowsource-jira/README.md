# flowsource-jira

Welcome to the flowsource-jira plugin!

The plugin shows the details for issues from Jira for a particular project. 

The plugin first shows 2 graphs:
- Issues by Status: This graph shows the number of issues for each status type.
- Issues by Priority: This graph shows the number of isuues for each priority type. It also displays the distribution of the issues by issue type counts.

The next section shows the counts for each issue types followed by a table containing details of the Jira issues. Details of the issues include id, title, status, and priority. User can also filter the workitems by a particular status. Also the id of each story in the table is a link which will directly take the user to the Jira story page.


## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/jira-project-key: WebApp  #### The project key
  flowsource/durationInDays: '180' #### duration in days for which data needs to be displayed
  flowsource/jira-storypoint-field: '#notapplicable' #### Add the story point field name for custom story point field, add '#default' for default story point field and add '#notapplicable' for no story point field

  ###below annotations are OPTIONAL and can be used together to filter the list if items displayed on Jira plugin._
  flowsource/jira-filter-field-key: 'Epic Link' ###Specify the field of the Jira to filter. The field name should follow the Jira JQL query field names'
  flowsource/jira-filter-field-value: 'FLOWSOURCE-5' ###Specify the one or more field values separated by commas(",") of the Jira to filter
  flowsource/jira-filter-Id: '10086' ###Specify the query ID to display the particular ID filter details
  flowsource/jira-enable-current-sprint: 'false' #### By default, it will be false, if you want to enable it, set it to true it will display the current sprint details
  ```


## Changes to be made to the source code to include the plugin

Add the below in EntityPage.tsx
- import { FlowsourceJiraPage } from '@flowsource/plugin-flowsource-jira';
-   under serviceEntityPage & websiteEntityPage
  ```typescript
    <EntityLayout.Route path="/stories" title="Stories">
        <FlowsourceJiraPage/>
    </EntityLayout.Route>


Add the below in packages/app/package.json
- "@flowsource/plugin-flowsource-jira": PLUGIN_VERSION (eg: "^1.0.0")



## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-jira](http://localhost:3000/flowsource-jira).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Annotations

The plugin uses the following annotations in the `catalog-info.yaml`:

- `flowsource/jira-project-key`: Specifies the name of the Jira project.
- `flowsource/durationInDays`: Determines the number of days in the past to retrieve Jira issues from the project.  This will filter the list of items based on the modified date.
- `flowsource/jira-storypoint-field`: Indicates the name of the story point field configured in the Jira project.<br>

_below annotations are OPTIONAL and can be used together to filter the list if items displayed on Jira plugin._
- `flowsource/jira-filter-field-key`: 'Specify the field of the Jira to filter. The field name should follow the Jira JQL query field names'
- `flowsource/jira-filter-field-value`: 'Specify the one or more field values separated by commas(",") of the Jira to filter'
- `flowsource/jira-filter-Id: '10086'`: ###Specify the query ID to display the particular ID filter details
- `flowsource/jira-enable-current-sprint: 'false'`: #### By default, it will be false, if you want to enable it, set it to true it will display the current sprint details

For example:

```yaml
flowsource/jira-project-key: 'FLOWSOURCE'
flowsource/durationInDays: '180'
flowsource/jira-storypoint-field: 'Story Points'
flowsource/jira-filter-field-key: 'Owned By[User Picker (multiple users)]'
flowsource/jira-filter-field-value: 'user1,user2,...'
flowsource/jira-enable-current-sprint: 'false'
flowsource/jira-filter-Id: '10086'
```

### Release 1.0.4

- Sonarqube issue fixes