# flowsource-testing

Welcome to the flowsource-testing plugin!

_This plugin was created through the Backstage CLI_

## Description

The `flowsource-testing` plugin provides a unified interface to display various testing-related plugins such as `Zephyr`, `Playwright`, `Selenium`, and others. 

Each plugin is organized in a separate accordion, allowing users to easily navigate and interact with the data and functionalities provided by each plugin.

## Widgets / Panels Description

### Zephyr Plugin Accordion

- **Description**: Displays key metrics and data fetched from Zephyr APIs, including test case counts, defect counts, stories without test cases, test cycles, and respective executions.
- **Components**: Includes widgets and panels specific to the Zephyr plugin.

### Playwright Plugin Accordion

- **Description**: Displays suite details _(from an AWS S3 bucket)_ with stats in a table and doughnut chart.
- **Components**: Includes widgets and panels to display Playwright-specific data.
- **Note**: More details for the Playwright plugin can be found in the `flowsource-playwright/README.md` file.

### Selenium Plugin Accordion

- **Description**: Displays suite details from an AWS S3 bucket.
- **Components**: Includes widgets and panels to display Selenium-specific data.

### Note:
The plugin can be extended to include additional testing-related plugins as needed, each displayed in its own accordion.
Each additional plugin will have its own set of widgets and panels to display relevant data.

## Changes to be Made to the Source Code

To include this `flowsource-testing` frontend plugin in your project, follow these steps:

1. Make sure to include the specific testing related plugins as per your requirement (E.g., `@flowsource/plugin-flowsource-zephyr`, `@flowsource/plugin-flowsource-playwright`, `@flowsource/plugin-flowsource-selenium`, etc.).

2. In `packages/app/package.json`, add the plugin ID to the dependencies section. _Note: The version number `^1.0.0` may change over time, so ensure you use the latest version available._
    ```json
    "@flowsource/plugin-flowsource-testing": "^1.0.0"
    ``` 

3. In `packages/app/src/App.tsx`, add import 
    ```tsx
    import { FlowsourceTestingPage } from '@flowsource/plugin-flowsource-testing';
    ```
     and add the route
    ```tsx
        <Route path="/flowsource-testing" element={<FlowsourceTestingPage />}>
            <FlowsourcePlaywrightPage />
            <FlowsourceZephyrPage />
        </Route>
    ```

4. Add the below in EntityPage.tsx
    ```tsx
    import { FlowsourceTestingPage } from '@flowsource/plugin-flowsource-testing';
    ```
    under `serviceEntityPage` & `websiteEntityPage`
    ```tsx
        <EntityLayout.Route path="/testing" title="Testing">
            <FlowsourceTestingPage />
        </EntityLayout.Route>
    ```

## Pre-requisites

Ensure that you have the following pre-requisites in place before using this frontend plugin:

- Dependencies on the respective required frontend plugins for each testing tool (e.g., `@flowsource/plugin-flowsource-zephyr`, `@flowsource/plugin-flowsource-playwright`, `@flowsource/plugin-flowsource-selenium`, etc.).

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-testing](http://localhost:3000/flowsource-testing).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
