# Flowsource-selenium

Welcome to the flowsource-selenium plugin! This plugin displays test suite details from a cloud storage bucket (AWS S3 and GCS). It provides a visual representation of test results, including a doughnut chart and a table summarizing test suite statistics.

## Features

- Displays suite names with stats in a table and doughnut chart.
- Supports multiple cloud providers: AWS S3 and GCS.
- Dynamically fetches test data based on entity annotations.

## Pre-requisites

Add the following annotations to the `catalog.yaml` file:

- `flowsource/selenium-report-filename`: The filename of the test result file in the cloud storage bucket.
- `flowsource/selenium-report-path`: The folder path of the test result file in the cloud storage bucket.
- `flowsource/selenium-cloud-provider`: Specifies the cloud provider to use. Valid inputs are `AWS`/`aws`, `AZURE`/`azure` and `GCS`/`gcs`.

## Source Code Changes

Add the following to `packages/app/package.json`:

```json
"@flowsource/plugin-flowsource-selenium": "PLUGIN_VERSION"
```

Import and use the plugin in `packages/backend/src/App.tsx`:

```typescript
import { FlowsourceSeleniumPage } from '@flowsource/plugin-flowsource-selenium';

<Route path="/flowsource-testing" element={<FlowsourceTestingPage />}>
  <FlowsourceSeleniumPage />
</Route>
```

> **Note:** Ensure that the Testing Plugin is correctly configured before setting up the Selenium plugin.

## Getting Started

Run `yarn start` in the root directory and navigate to `/flowsource-selenium`. For faster development, run `yarn start` in the plugin directory.

## Flowsource Version Compatibility

This plugin is compatible with Flowsource version 1.0.0 and above.

## Release Notes

### Version 1.0.2

- Added support for fetching test data from AWS S3, Azure and GCS.
- Displays test suite statistics in a table and doughnut chart.
