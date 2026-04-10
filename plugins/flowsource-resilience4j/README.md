# flowsource-resilience4j

Welcome to the flowsource-resilience4j plugin!

_This plugin was created through the Backstage CLI_


# Pre-requisites: 

1. Spring Boot Application Setup: Implement a Spring Boot application with the following dependencies:

i)  Resilience4j: This is required for implementing resilience patterns like Circuit Breaker, Bulkhead, and Rate Limiter. It provides detailed insights into the behavior of these patterns during runtime.

ii) Micrometer: Micrometer is a metrics collection facade that supports numerous monitoring systems. 

2. Datadog Monitor Configuration: To view the details related to Resilience4j (like Circuit Breaker), a monitor needs to be created in Datadog. This monitor will be based on the metrics provided by the Micrometer-Datadog integration. It will enable the visualization and tracking of Resilience4j’s resilience patterns. 

3. The Resilience4j Bulkhead and RateLimiter, we are utilizing metrics from Datadog. For the Bulkhead, we are tracking the available concurrent calls and maximum concurrent calls from metrics. For the RateLimiter, we are monitoring the metrics for waiting threads and available permissions.

# Steps to create a datadog monitor for circuitbreaker:

1. Navigate to Monitors: Go to the Datadog dashboard, and click on Monitors > New Monitor.
2. Choose dection method: Select Threshold alert (An alert will be triggered whenever a metric crosses a threshold).
3. Select Metric: Choose Metric as the monitor type.
4. Define the Metric: Specify the metric you want to monitor. For monitoring the state of a Resilience4j circuit breaker, use the metric sum:resilience4j.circuitbreaker.state{service:<your-service-name> AND state:half_open OR state:open} by {service}. Replace <your-service-name> with the name of your service
5. Set Alert Conditions: Define thresholds for alerts. For instance, you could set it to trigger an alert when the evaluated value is above 0.1 for any service.
6. Configure Notifications: Set up who should be notified and how (email, Slack, etc.).
7. Save the Monitor: Review your settings and save the monitor.


4. To access the resilience4j API, and to view the resilience4j patterns you need to have the following credentials in app-config and catalog-info files.

app-config.yaml

datadog:
  api_key: ${DATADOG_API_KEY}
  app_key: ${DATADOG_APP_KEY}
  url: ${DATADOG_SITE}

catalog-info.yaml

metadata: 
  name: example-website
  appid: example-name
  annotations:
    flowsource/resilience4j-datadog-monitor-name: MONITOR NAME
    flowsource/resilience4j-durationInDays: '1'
    flowsource/resilience4j-datadog-applicationName: APPLICATION NAME

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-resilience4j](http://localhost:3000/flowsource-resilience4j).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
