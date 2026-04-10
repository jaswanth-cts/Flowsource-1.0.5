# flowsource-datadog

## Plugin Info

## Datadog Plugin

This Datadog plugin is designed to show application error logs that are already present in the Datadog console. It integrates via API and displays the responses from Datadog, providing a seamless way to monitor and analyze application errors.
With this integration, flowsource system will be able to fetch the selected application specific errors reported for the duration mentioned in the App-config.yaml file. 

## Features

**Error Log Overview**: Showcases application error logs from the existing Datadog console.

### Pre-requisites: 

1. **Configure Datadog Account**: Application/service/website must have integrated with datadog to log the errors and exported to datadog system.
2. Make sure to have appid is added as part of the deployment metadog tag. 
3. **Tags** Make sure to have similar tags defined in the catalog-info.yaml file. 
4. **Update Configuration**: Add the obtained credentials to the `app.config.yaml` file.

To access this page, follow below path. 

1. select the service/application/website from the catalog
2. Select the Well Architected Framework
3. Select the Reliability tab. 

Flowsource system will fetch the errors specific to the selected service and displays errors reported. 

### Compatibility
 
- Datadog version - 2.5.12
- Flowsource version - 0.2.31 or later

### Permissions to be given to the Personal account 

Admin access is required to generate the App Key and API Key. Additionally, these keys must have the Datadog Standard Role to fetch Application Error logs from Datadog. This role includes the necessary permissions to access the API and retrieve error logs.

### Configuration

To get started, you'll need to provide some configuration in your `app-config.yaml` and `catalog-info.yaml` files.

#### app-config.yaml

In your `app-config.yaml` file, add the following properties:

```yaml
datadog:
  api_key: ${DATADOG_API_KEY}
  app_key: ${DATADOG_APP_KEY}
  url: ${DATADOG_SITE}
  max_row_fetch: 1000
  api_version: v2
  duration: 4
```
#### catalog-info.yaml
  
In your catalog-info.yaml file, you need to add an annotation for this plugin to work:

metadata:
  name: example-website
  appid: <appid> (Name already tagged in the Datadog Application)
```annotations:
  flowsource/datadog-tags: <datadog-tags>
  flowsource/datadog-team: <team-email>
```
The flowsource/datadog-tags annotation requires tags to be specified in a specific format. Here’s how to format the tags:

Key-Value Pair: Each tag should be a key-value pair separated by an exclamation mark (!).
Format: key!value

To add another key-value pair, simply append it to the existing tags using an ampersand (&) as a separator. 
For example, to add a `key2!value2` tag, you would format it as `key!value&key2!value2`.

Replace <appid> and <datadog-tags> with the corresponding values in the file.

The flowsource/datadog-team annotation directs alerts and notifications from Datadog monitors (e.g., Latency Monitor, Traffic Monitor) to the specified team. It ensures the correct team receives alert messages.

### Steps to Merge plugin with Flowsource:
1. Add the following dependencies in /packages/backend/package.json under dependencies section: 
"@flowsource/plugin-flowsource-datadog-backend": "^1.0.0" 

2. Add the following to the file /packages/backend/src/index.ts:  
backend.add(import('@flowsource/plugin-flowsource-datadog-backend'));

