# flowsource-bitbucket

Welcome to the flowsource-bitbucket backend plugin!

_This plugin was created through the Backstage CLI_

The plugin shows the details for pull requests from BitBucket repo for a particular project. 

The plugin first shows three buttons to filter the pull requests:
- **Open**: Fetches and displays data for open pull requests.
- **Closed**: Fetches and displays data for closed pull requests.
- **All**: Fetches and displays data for all pull requests.

Then the plugin shows table:
- it shows a table containing the details about the PR such as the id, title, creator, created date and last updated date.

Then the plugin shows 2 graphs:
- PR Trend: It will show overall pull requests for the each month.
- PR Ageing: It will show for how long each pull request is active.

Then the plugin shows 2 charts:
- Line Chart:: The line chart shows the PR cycle time for the selected duration. Each point represents the count of Merged and Approved PRs created in a specific month.
- Average PR Cycle Time: The average time from PR raised to merged within the duration.
- Average PR Review Time: The average time from PR raised to first approval within the duration.
- Average PR Merged Time: The average time from PR first approval to merged within the duration.
- Note: The color of the average cycle calculations is determined based on the threshold values provided by the user in the catalog file or in the app-config file.

**Note on Color Codes**:
The charts use the following color codes based on the configuration values provided in the `app-config.yaml` or catalog annotations:
- **Red**: Indicates the value exceeds the maximum threshold.
- **Yellow**: Indicates the value is within the range but closer to the maximum threshold.
- **Green**: Indicates the value is within the acceptable range.

## Getting started
Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-bitbucket](http://localhost:3000/flowsource-bitbucket).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

_This plugin was created through the Backstage CLI_

The plugin shows the details for pull request from bitbucket for a particular repository or project or workspace. 

The plugin shows a table containing details of the PR Trend and PR Aging. Details of the PR include id, title, creator, created and lanst updated days. Also the title of each workitem in the table is a link which will directly take the user to the Bitbucket dashboards page. User can also filter the workitems by a particular status ex: merged, open and all.

## Pre-requisites: 


1. In `packages/app/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-bitbucket": "^1.0.4"
``` 
to the dependencies section.
2. In `packages/app/src/App.tsx`, add import 
```tsx
import { FlowsourceBitbucketPage } from '@flowsource/plugin-flowsource-bitbucket';
```
 and add route 
 ```tsx
 <Route path="/flowsource-bitbucket" element={<FlowsourceBitbucketPage />} />
 ```
3. In `packages/app/src/components/catalog/EntityPage.tsx`

- Add the import 
```tsx
 import { FlowsourceBitbucketPage } from '@flowsource/plugin-flowsource-bitbucket';
```
- Add the page content:
```tsx
const BITBUCKET_REPO_NAME = 'flowsource/bitbucket-repo-name';
const BITBUCKET_REPO_OWNER = 'flowsource/bitbucket-repo-owner';
const isShowBitbucketRepoPage = (entity: any) => Boolean(entity.metadata.annotations?.[BITBUCKET_REPO_NAME] && entity.metadata.annotations?.[BITBUCKET_REPO_OWNER]);

const repoPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isShowBitbucketRepoPage(entity)}>
      <FlowsourceBitbucketPage />
    </EntitySwitch.Case>
  </EntitySwitch>
);
```
- Update the constant “serviceEntityPage” and “websiteEntityPage”:
```tsx
const serviceEntityPage = (
    <EntityLayout.Route path="/pull-requests" title="Code repository">
      {repoPage}
    </EntityLayout.Route>
);
const websiteEntityPage = (
   <EntityLayout.Route path="/code-repository" title="Code repository">
      <Grid container style={{marginBottom:'-11rem'}}>
        <Grid item md={12} alignItems="stretch">
            {repoPage}
        </Grid>
      </Grid>
    </EntityLayout.Route>
);
```

## Catalog Configuration

In the `catalog-info.yaml` file, add the annotation 
```yaml
flowsource/bitbucket-repo-owner: ${PROJECTNAME} #### Name of the project
flowsource/bitbucket-repo-name: ${REPONAME} #### repository under the the project
flowsource/bitbucket-host:  BITBUCKET_URL (optional) by default it uses the url from app-config.

To view the PR Cycle Time, the following annotations must be added to the `catalog-info.yaml` file:

flowsource/azure-PRCycleTimeMin : Minimum days for PR Cycle Time (PR Raised to PR Merged).
flowsource/azure-PRCycleTimeMax : Maximum days for PR Cycle Time (PR Raised to PR Merged).
flowsource/azure-PRReviewCycleTimeMin : Minimum days for PR Review Cycle Time (PR Raised to PR Approved).
flowsource/azure-PRReviewCycleTimeMax : Maximum days for PR Review Cycle Time (PR Raised to PR Approved).
flowsource/azure-PRMergeCycleTimeMin : Minimum days for PR Merge Cycle Time (PR Approved to PR Merged).
flowsource/azure-PRMergeCycleTimeMax : Maximum days for PR Merge Cycle Time (PR Approved to PR Merged).

```
 under the annotations field.
## Release Notes
### Version 1.0.2
- UI changes
    - Added status filter buttons
    - Displayed PR status in table
    - Added additional details in table
### Version 1.0.4
- Added a Avg PR cycle time in days for each month in Line Chart.
- Additionally, Three Gauge charts have been included to show the average PR cycle time, average PR review time, and average PR merge time.
