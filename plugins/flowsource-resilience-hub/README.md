# flowsource-resilience-hub

Welcome to the flowsource-resilience-hub plugin!

_This plugin was created through the Backstage CLI_

## Getting started

This is a custom Frontend Plugin for showing information from AWS Resilience hub. This page shows a Dashboard highlighting the Resiliency posture of your application with details like Resiliency Score (based on RTO and RPO definition),  operational and Resiliency Recommemdations.
 
Dashboard fetches information based on the annotations provided in catalog-info.yaml
- flowsource/aws-resiliencehub-appname
- flowsource/aws-resiliencehub-region

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-resilience-hub](http://localhost:3000/flowsource-resilience-hub).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
