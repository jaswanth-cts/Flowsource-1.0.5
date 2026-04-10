# flowsource-cicd-aws

Welcome to the flowsource-cicd-aws plugin!

## About

The AWS CI/CD Plugin offers a user-friendly interface with accordions and cards to provide detailed insights into AWS Pipelines activities. It allows users to easily visualize and monitor pipelines and jobs.

### Pipeline name (accordion)

Each accordion in the AWS CI/CD Plugin displays the pipeline name along with the latest job status.

### Jobs (cards)

For each accordion in the AWS CI/CD Plugin, cards are displayed with job details such as ID, pipeline ID, status, commit message and duration.

## Pre-requisites

To use this plugin, the following annotations must be added to the `catalog.yaml` file of the project:

- `flowsource/aws-pipelines`: The name of the AWS code pipeline.
- `flowsource/aws-region`: The AWS region where the repository is located.
- `flowsource/durationInDays`: The number of days in the past to fetch pipelines from.
- `flowsource/aws-pipelines-trigger`: The names of the pipelines to trigger the pipeline run.

## Source Code Modifications to Include the Plugin

Add the following code in `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import { FlowsourceCicdAwsPage } from '@flowsource/plugin-flowsource-cicd-aws';

const CICD_AWS_PIPELINE_ANNOTATION = 'flowsource/aws-pipelines';

const isCicdAwsAnnotationAvailable = (entity: any) =>
  Boolean(entity.metadata.annotations?.[CICD_AWS_PIPELINE_ANNOTATION]);

const cicdContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isCicdAwsAnnotationAvailable(entity)}>
      <FlowsourceCicdAwsPage />
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

Add the following to `packages/app/src/App.tsx`

```typescript
import { FlowsourceCicdAwsPage } from '@flowsource/plugin-flowsource-cicd-aws';

const routes = (
  <FlatRoutes>
    <Route path="/flowsource-cicd-aws" element={<FlowsourceCicdAwsPage />} />
  </FlatRoutes>
);
```

Add the following to `packages/app/package.json`:

```json
"@flowsource/plugin-flowsource-cicd-aws": PLUGIN_VERSION
```

## Getting started

Your plugin has been added to the example app in this repository. To access it, run `yarn start` in the root directory and navigate to [/flowsource-cicd-aws](http://localhost:3000/flowsource-cicd-aws).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory. This method provides quicker iteration speed, faster startup, and hot reloads. It is only meant for local development, and the setup instructions can be found inside the [/dev](./dev) directory.

## Release Notes

### Version 1.0.3

- We have introduced a new feature that allows you to trigger the pipeline directly from the CI/CD tab. Simply click the "Trigger Pipeline" button to start the pipeline execution.
