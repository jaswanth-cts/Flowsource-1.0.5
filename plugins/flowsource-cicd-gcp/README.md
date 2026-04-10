# flowsource-cicd-gcp

Welcome to the flowsource-cicd-gcp plugin!

## About

The CICD GCP Custom Page plugin is designed to integrate with GCP (Google Cloud Platform) to fetch and display CI/CD pipeline data. It provides a user interface to view pipeline details, workflow run details, and manage pagination for large datasets. The plugin is built using React and integrates with Backstage's core plugin API.

### CiCd Card Component

- **Loading Screen**: Displays a loading message while data is being fetched.
- **Pipeline Cards**: Displays a grid of cards, each representing a pipeline run. The cards show the pipeline name, status, ID, and duration.
- **Pipeline Data Fetching**: Fetches pipeline data from the backend API and processes the response to update the UI with the latest builds, GitHub owner, and any error messages.
- **Workflow Run Details Fetching**: Fetches detailed information about specific workflow runs from the backend API and updates the UI with the latest build details and run count.
- **Pagination**: Provides pagination controls to navigate through multiple pages of pipeline data.

## Pre-requisites

The plugin requires the following annotations in the `catalog.yaml` of the project:

- `flowsource/gcp-pipelines`: The name of the GCP Pipelines.
- `flowsource/gcp-region`: The GCP region where the pipeline is located.
- `flowsource/durationInDays`: The number of days in the past to fetch pipelines from.

## Source Code Modifications to Include the Plugin

Add the following code in `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import { FlowsourceCicdGcpPage } from '@flowsource/plugin-flowsource-cicd-gcp';

const CICD_GCP_PIPELINE_ANNOTATION = 'flowsource/gcp-pipelines';
const CICD_GCP_REGION_ANNOTATION = 'flowsource/gcp-region';

const isCicdGcpAnnotationAvailable = (entity: any) =>
  Boolean(
    entity.metadata.annotations?.[CICD_GCP_PIPELINE_ANNOTATION] &&
      entity.metadata.annotations?.[CICD_GCP_REGION_ANNOTATION],
  );

const cicdContent = (
  <EntitySwitch>
    /* Add this switch case to repoPage */
    <EntitySwitch.Case if={(entity, _) => isCicdGcpAnnotationAvailable(entity)}>
      <FlowsourceCicdGcpPage />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      <>
        <Grid container>
          <Grid item alignItems="stretch" md={12}>
            {cicdContent}
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>
  </EntityLayout>
);

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>
  </EntityLayout>
);
```

Add the following to `packages/app/package.json`:

```json
"@flowsource/plugin-flowsource-cicd-gcp": PLUGIN_VERSION
```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-cicd-gcp](http://localhost:3000/flowsource-cicd-gcp).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Release Notes
### Release version : 1.0.1
- Updated the UI to show build failure reasons with StepName/id, Message and Build URL.
- Trunkate commit message to 40 characters.