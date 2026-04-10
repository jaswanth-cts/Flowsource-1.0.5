# flowsource-datadog

## Plugin Info

## Datadog Plugin

This Datadog plugin is designed to show application error logs that are already present in the Datadog console. It integrates via API and displays the responses from Datadog, providing a seamless way to monitor and analyze application errors.
With this integration, flowsource system will be able to fetch the selected application specific errors reported for the duration mentioned in the App-config.yaml file.

## Features

**Error Log Overview**: Showcases application error logs from the existing Datadog console.

## Error Tracking and Monitoring


## Table : Application Error Details
This table contains detailed information about errors, including the date, Tags, Message,Source and additional details such as Stacktrace.

## Error Frequency Bar Chart
The bar chart below illustrates the frequency of errors over time, categorized by date.

### Pre-requisites: 
1. Application/service/website must have integrated with datadog to log the errors and exported to datadog system.
2. Make sure to have appid is added as part of the deployment metadog tag. 
3. Make sure to have similar tags defined in the catalog-info.yaml file. 


To access this page, follow below path. 

1. select the service/application/website from the catalog
2. Select the Well Architected Framework
3. Select the Reliability tab. 

Flowsource system will fetch the errors specific to the selected service and displays errors reported. 

### Steps to Merge plugin with Flowsource:
1. Add the following dependencies in /packages/backend/package.json under dependencies section: 
"@flowsource/plugin-flowsource-datadog": "^1.0.0".

2. Add the below entries to  ./packages/app/src/components/catalog/EntityPage.tsx: 
#### Import Statement: 
import { FlowsourceDatadogPage } from '@flowsource/plugin-flowsource-datadog';

#### Update the constant “serviceEntityPage” and “websiteEntityPage”:
const serviceEntityPage = ( 
<EntityLayout.Route path="/datadog" title="Observability">
      <FlowsourceDatadogPage />
    </EntityLayout.Route>
);

const websiteEntityPage = ( 
<EntityLayout.Route path="/datadog" title="Observability">
      <EntityDatadogContent />
    </EntityLayout.Route>
);