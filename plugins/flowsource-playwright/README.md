# Flowsource-playwright

Welcome to the flowsource-playwright plugin! This plugin displays test suite details from a cloud storage bucket (AWS S3 and GCS). It provides a visual representation of test results, including a doughnut chart and a table summarizing test suite statistics.

## Features

- Displays suite names with stats in a table and doughnut chart.
- Supports multiple cloud providers: AWS S3, Azure and GCS.
- Dynamically fetches test data based on entity annotations.
- Displays error messages if the plugin is not configured correctly.
- Handles loading states and provides user-friendly error feedback.

## Pre-requisites

Add the following annotations to the `catalog.yaml` file:

- `flowsource/playwright-report-filename`: The filename of the test result file in the cloud storage bucket.
- `flowsource/playwright-report-path`: The folder path of the test result file in the cloud storage bucket.
- `flowsource/playwright-cloud-provider`: Specifies the cloud provider to use. Valid inputs are `AWS`/`aws` , `AZURE`/`azure` or `GCS`/`gcs`.

## Source Code Changes

Add the following to `packages/app/package.json`:

```json
"@flowsource/plugin-flowsource-playwright": "PLUGIN_VERSION"
```

Import and use the plugin in `packages/backend/src/App.tsx`:

```typescript
import { FlowsourcePlaywrightPage } from '@flowsource/plugin-flowsource-playwright';

<Route path="/flowsource-testing" element={<FlowsourceTestingPage />}>
    <FlowsourcePlaywrightPage />
</Route>
```

> **Note:** Ensure that the Testing Plugin is correctly configured before setting up the Playwright plugin.

## Getting Started

Run `yarn start` in the root directory and navigate to `/flowsource-playwright`. For faster development, run `yarn start` in the plugin directory.

## How It Works

The `Playwright` component fetches test execution data from a backend API based on the cloud provider and annotations provided in the entity metadata. It displays:

- A doughnut chart visualizing the percentage of expected, unexpected, skipped, and flaky tests.
- A table listing the suite titles and their corresponding test statistics.

### Error Handling

- If the plugin is not configured correctly, an error message is displayed.
- If the cloud provider annotation is invalid, an error is thrown.

### Data Visualization

- The doughnut chart uses `chart.js` and `chartjs-plugin-datalabels` to display test result percentages.
- The table lists suite titles along with the number of expected, unexpected, skipped, and flaky tests.

## Release Notes

### Version 1.0.2

- Added support for fetching test data from AWS S3 and GCS.
- Displays test suite statistics in a table and doughnut chart.
