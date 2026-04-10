# flowsource-github

Welcome to the flowsource-github plugin!

## About

This plugin is designed to provide a comprehensive overview of GitHub repository pull requests (PRs) within a Flowsource application. It fetches data from a backend API and displays it using various charts and tables. The plugin includes components for visualizing PR trends, PR aging, and detailed PR lists.

### PR Trend Panel

- **Component**: LineChart
- **Description**: Displays a line chart showing the trend of pull requests over time. The x-axis represents the time period, and the y-axis represents the number of pull requests.

### PR Aging Panel

- **Component**: BarChart
- **Description**: Displays a bar chart showing the aging of pull requests. The x-axis represents different aging categories (e.g., 0-15 days, 15-30 days), and the y-axis represents the number of pull requests in each category.

### PR List Panel

- **Component**: TableComponent
- **Description**: Displays a table listing all pull requests, including those created by the user and those assigned for review. It provides detailed information about each pull request.

## Pre-requisites

To use this plugin, the following annotations must be added to the `catalog.yaml` file of the project:

- `flowsource/github-repo-owner` : The name of the github organization owner.
- `flowsource/github-repo-name`: The name of the github repository.
- `flowsource/durationInDays`: (Optional) The number of days in the past to fetch PRs from.
- `flowsource/github-host`: (Optional) The URL of the github repository, if not provided it uses from the app-config.yaml file.

To view the PR Cycle Time, the following annotations must be added to the `catalog.yml` file:

- `flowsource/github-PRCycleTimeMin` : Minimum days for PR Cycle Time (PR Raised to PR Merged).
- `flowsource/github-PRCycleTimeMax` : Maximum days for PR Cycle Time (PR Raised to PR Merged).
- `flowsource/github-PRReviewCycleTimeMin` : Minimum days for PR Review Cycle Time (PR Raised to PR Approved).
- `flowsource/github-PRReviewCycleTimeMax` : Maximum days for PR Review Cycle Time (PR Raised to PR Approved).
- `flowsource/github-PRMergeCycleTimeMin` : Minimum days for PR Merge Cycle Time (PR Approved to PR Merged).
- `flowsource/github-PRMergeCycleTimeMax` : Maximum days for PR Merge Cycle Time (PR Approved to PR Merged).

## Source Code Modifications to Include the Plugin

Add the following code in `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import { FlowsourceGithubPage } from '@flowsource/plugin-flowsource-github';

const GITHUB_REPO_OWNER = 'flowsource/github-repo-owner';
const GITHUB_REPO_NAME = 'flowsource/github-repo-name';

const isGithubRepoOwnerAvailable = (entity: any) =>
  Boolean(entity.metadata.annotations?.[GITHUB_REPO_OWNER]);
const isGithubRepoNameAvailable = (entity: any) =>
  Boolean(entity.metadata.annotations?.[GITHUB_REPO_NAME]);

const repoPage = (
  <EntitySwitch>
    <EntitySwitch.Case
      if={(entity, _) =>
        isGithubRepoOwnerAvailable(entity) && isGithubRepoNameAvailable(entity)
      }
    >
      <FlowsourceGithubPage />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/code-repository" title="Code repository">
      <>
        <Grid container style={{ marginBottom: '-11rem' }}>
          <Grid item md={12} alignItems="stretch">
            {repoPage}
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>
  </EntityLayout>
);

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/pull-requests" title="Code repository">
      {repoPage}
    </EntityLayout.Route>
  </EntityLayout>
);
```

Add the following to `packages/app/src/App.tsx`

```typescript
import { FlowsourceGithubPage } from '@flowsource/plugin-flowsource-github';

const routes = (
  <FlatRoutes>
    <Route path="/flowsource-github" element={<FlowsourceGithubPage />} />
  </FlatRoutes>
);
```

Add the following to `packages/app/package.json`:

```json
"@flowsource/plugin-flowsource-cicd-aws": PLUGIN_VERSION
```
## Release notes
### Release version : 1.0.2

Updated the Github UI for table content and added MERGED filter.

### Release version : 1.0.3

- Added a PR Cycle Time chart card to display the cycle time from PR raised to PR merged.
- Additionally, three charts have been included to show the average PR cycle time, average PR review time, and average PR merge time.

## Getting started


Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-github](http://localhost:3000/flowsource-github).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads. It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

