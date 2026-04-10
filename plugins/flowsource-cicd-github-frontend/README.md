# flowsource-cicd-custom-frontend

Welcome to the cicd-custom-frontend plugin!

This is backend plugin for CI/CD. It includes Github Workflow actions service.
It shows the details abot the various workflows from GitHub Actions. It shows details like - the run, id and duration for a particular workflow run. Also the title of each card is a link which will directly take the user to the GitHub Actions page.


## Pre-requisites: 

catalog-info.yaml

Annotations in catalog yaml for mentioning the specific tools to use:
  ```yaml
  flowsource/github-workflows: TicketBooking-Pipeline, abc  #### Workflow names separated by ','
  flowsource/durationInDays: '180' #### Duration in days for which data needs to be displayed
  ```

## Changes to be made to the source code to include the plugin

Add the below in EntityPage.tsx
- import {FlowsourceCicdCustomFrontendPage} from '@flowsource/plugin-flowsource-cicd-github-frontend';
-   under serviceEntityPage & websiteEntityPage
  ```typescript
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
        <FlowsourceCicdCustomFrontendPage/>
    </EntityLayout.Route>


Add the below in packages/app/package.json
- "@flowsource/plugin-flowsource-cicd-github-frontend": PLUGIN_VERSION (eg: "^1.0.0")


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-cicd-custom-frontend](http://localhost:3000/flowsource-cicd-custom-frontend).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Release Notes
### Version 1.0.1
- UI Changes
- Fetching failure message and StepName