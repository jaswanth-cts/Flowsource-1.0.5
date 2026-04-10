# flowsource-dora-metrics

Welcome to the flowsource-dora-metrics plugin!

_This plugin was created through the Backstage CLI_


## Description

The flowsource-dora-metrics plugin provides insights into the performance of a software development team, by tracking these key metrics and their respective trends:

- Deployment Frequency
- Lead Time for Changes
- Change Failure Rate
- Mean Time to Recover


## Description of Each of the Widget / Panel

### Metrics
- **`Deployment Frequency`**: Tracks how often an organization successfully releases to production. This metric is an average of the deployment frequencies over the past specified months.
- **`Lead Time for Changes`**: Measures the time taken for a commit to reach production. This metric is an average of the lead times over the past specified months.
- **`Change Failure Rate`**: Calculates the percentage of deployments that cause a failure in production. This metric is an average of the change failure rates over the past specified months.
- **`Mean Time to Recover`**: Tracks how long it takes the team to recover this application from a failure in production. This metric is an average of the recovery times over the past specified months.

### Trends
- **`Deployment Frequency`**: Shows the trend of deployment frequency over the past specified months.
- **`Lead Time for Changes`**: Shows the trend of lead time for changes over the past specified months.
- **`Change Failure Rate`**: Shows the trend of change failure rate over the past specified months.
- **`Mean Time to Recover`**: Shows the trend of mean time to recover over the past specified months.


## Changes to be made to the source code to include the plugin

- Add the below in `EntityPage.tsx`
  - ```
    import { DoraMetricsComponent } from '@flowsource/plugin-flowsource-dora-metrics/src/components/DoraMetricsComponent';
    ```
  - Update the constants `serviceEntityPage` and `websiteEntityPage`:
    ```
    <EntityLayout.Route path="/dora-metrics" title="DORA metrics">
        <DoraMetricsComponent />
    </EntityLayout.Route>
    ```

- Add the below in `packages/app/package.json`
  - ```
    "@flowsource/plugin-flowsource-dora-metrics": PLUGIN_VERSION
    ```


## Pre-requisites: 

- Refer `plugins/flowsource-dora-metrics-backend/README.md` for the tool specific pre-requisites for each metric.


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-dora-metrics](http://localhost:3000/flowsource-dora-metrics).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
