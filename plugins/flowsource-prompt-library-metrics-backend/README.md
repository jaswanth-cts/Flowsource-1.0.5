# flowsource-prompt-library-metrics-backend

This backend plugin provides APIs for retrieving prompt usage metrics, including total prompts, total unique users, top prompt categories by usage by time range (30/60/120 days) and Prompt usage count over time (chart) filtering by type (editor, category).

## Type of access token:
Datadog access

## Configuration 

Add the following configuration to your `app-config.yaml`:

```yaml
  datadog:
    api_key: ${DATADOG_API_KEY}
    app_key: ${DATADOG_APP_KEY}
    url: ${DATADOG_SITE}
    # Replace the variables with your actual Datadog credentials.
```

## Changes to be made to the source code to include the plugin:
Add the below in index.ts
- backend.add(import('@flowsource/plugin-flowsource-prompt-library-metrics-backend'));

Add the below in packages/backend/package.json
- "@flowsource/plugin-flowsource-prompt-library-metrics-backend": PLUGIN_VERSION (eg: "^1.0.0")

## Getting Started

Run `yarn start` in the root directory and navigate to `/flowsource-prompt-library-metrics`. For faster development, run `yarn start` in the plugin directory.
## How Prompt Library Sends Data to Datadog
## IDE Integration with OpenTelemetry 

IDE Integration with OpenTelemetry for Prompt Usage Metrics 
1. Location 
OpenTelemetry Collector Path (Windows): 
C:\Program Files\OpenTelemetry Collector 
Ensure it is installed on the developer machine or shared VM 
2. How to Enable OpenTelemetry in IDE 
VS Code 
Open VS Code. 
Go to Extension Settings of the Prompt Library plugin. 
Enable: Enable sending Prompt Library usage data to Open Telemetry.
Configure Telemetry Endpoint (e.g., http://localhost:4317). 
Set Telemetry Interval (Seconds) (e.g., 60). 
IntelliJ 
Open IntelliJ. 
Go to Prompt Library Settings. 
Enable: Enable Telemetry. 
Configure Telemetry Endpoint (e.g., http://localhost:4317). 
Set Telemetry Interval (Seconds) (e.g., 60). 
Click Apply and OK. 
3. Sample Configuration for OpenTelemetry Collector 
Add the following to your config.yaml file: 
exporters: 
  debug: 
    verbosity: detailed 
  prometheus: 
    endpoint: "0.0.0.0:8889" 
  datadog/exporter: 
    api: 
      site: us3.datadoghq.com 
      key: <your_datadog_api_key> 

Note: Replace <your_datadog_api_key> with your actual key. 

4. Verification in Backend Tools 
Prometheus 
Open Prometheus dashboard (e.g., http://localhost:9090). 
Search for metric: Prompts_Count. 
Confirm the metric is present and updating. 
Datadog 
Go to: https://us3.datadoghq.com/metric. 
Search for Prompts_Count. 
Confirm the metric is present and updating. 
5. Notes 
Ensure OpenTelemetry Collector is installed and running. 
IDE plugins must be configured correctly with telemetry settings. 
Logging interval should not exceed 60 seconds. 

## OpenTelemetry Collector & Datadog Integration 
OpenTelemetry Collector & Datadog Integration for Prompt Usage Metrics  
1. Location 
OpenTelemetry Collector Path: 
C:\Program Files\OpenTelemetry Collector 
(on EC2-NitOpsResolve-Dev-Win2019 VM) 
2. How to Run OpenTelemetry Collector 
Open Command Prompt as Administrator. 
Navigate to the installation directory: 
cd "C:\Program Files\OpenTelemetry Collector" 
Run the collector with your configuration file: 
otelcol-contrib --config .\config.yaml 
3. Sample Configuration for Datadog Exporter 
Add the following to your config.yaml file: 
exporters: 
  debug: 
    verbosity: detailed 
  datadog/exporter: 
    api: 
      site: us3.datadoghq.com              # Datadog site URL 
      key: b8ce8c1e7af4dd8c45bf1ac87c1b9bf7 # Datadog API Key 

Replace the API key with your own if needed. 

4. Verification in Datadog 
Go to: https://us3.datadoghq.com/metric 
In the Metrics Summary page, search for Prompts_Count. 
Confirm the metric is present and updating. 

## Release Notes
### Version 1.0.0
- Added new plugin