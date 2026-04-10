# flowsource-zephyr

Welcome to the flowsource-zephyr plugin!

_This plugin was created through the Backstage CLI_

## Description

This frontend plugin provides an intuitive and interactive interface for displaying key metrics and data related to test management. It includes:
- Count of test cases
- Count of defects
- Stories that lack associated test cases
- Defects
- Test cycles and their respective executions

The plugin calls the backend plugin which leverages Zephyr APIs to fetch and display the data in various widgets and panels within the UI.

## Widgets / Panels Description

### Test Case Count Widget

- **Description**: Displays the total count of test cases in the project.
- **Functionality**: Fetches the total number of test cases using Zephyr APIs and displays it in a concise widget.

### Defect Count Widget

- **Description**: Shows the total number of defects found in the project.
- **Functionality**: Retrieves defect data from Zephyr APIs and presents it in a concise widget.

### Stories Without Test Cases Panel

- **Description**: Lists all the stories that do not have any associated test cases.
- **Functionality**: Utilizes Zephyr APIs to identify and display stories lacking test cases, allowing easy tracking and management.

### Defect Panel

- **Description**: Lists all the defects found in the project.
- **Functionality**: Utilizes Zephyr APIs to identify and display defects found in the project, allowing easy tracking and management.

### Test Cycles Panel

- **Description**: Provides details of all test cycles and their respective executions.
- **Functionality**: Fetches and displays information about each test cycle and the executions performed within them, enabling thorough analysis and monitoring.
- **Note**: The execution details are available inside each of the test cycles' accordions.

## Changes to be Made to the Source Code

To include this `flowsource-zephyr` frontend plugin in your project, follow these steps:

1. Make sure to include the testing plugin as well (`@flowsource/plugin-flowsource-testing`).

2. In `packages/app/package.json`, add the plugin ID to the dependencies section. _Note: The version number `^1.0.0` may change over time, so ensure you use the latest version available._
```json
"@flowsource/plugin-flowsource-zephyr": "^1.0.0"
``` 

3. In `packages/app/src/App.tsx`, add import 
```tsx
import { FlowsourceZephyrPage } from '@flowsource/plugin-flowsource-zephyr';
```
 and add to the flowsource-testing route
 ```tsx
    <Route path="/flowsource-testing" element={<FlowsourceTestingPage />}>
      <FlowsourcePlaywrightPage />
      <FlowsourceZephyrPage />
    </Route>
 ```

## Pre-requisites

Ensure that you have the following pre-requisites in place before using this frontend plugin:

- Backend setup of the `flowsource-zephyr` plugin.
- Properly configured `catalog-info.yaml` with the necessary annotations.
- The Zephyr frontend plugin is displayed within the testing plugin (`@flowsource/plugin-flowsource-testing`). Make sure to     include it as well.

## Annotations

The plugin uses the following annotations in the `catalog-info.yaml`:


_Mandatory Annotations_:
- `flowsource/jira-project-key`: Specifies the name of the Jira project.

_Optional Annotations_:
- `flowsource/durationInDays`: Determines the number of days in the past to retrieve Jira issues from the project. By default it will 60 days (as taken from app-config.yaml). If more duration is required add duration in days for which data needs to be displayed. This will filter the list of items based on the mentioned value.

For example:
```yaml
flowsource/jira-project-key: 'FLOWSOURCE'
flowsource/durationInDays: '180'
```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-zephyr](http://localhost:3000/flowsource-zephyr).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
