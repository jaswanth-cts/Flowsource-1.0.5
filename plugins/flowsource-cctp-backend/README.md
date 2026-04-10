# flowsource-cctp

## Plugin Info

## CCTP Plugin

This plugin integrates with CCTP using API to query, execute and update data in CCTP application. It is a proxy service responsible for The request received from the front end and forward it to the CCTP API.

## Features

The CCTP Custom Page plugin, built with React and integrated with Backstage's core plugin API, enhances the display of test plans and execution statuses. 
It offers features like live reporting, centralized reporting, failure causal analysis, duplicate defect detection, defect trend analysis, and single-user performance and accessibility issue tracking. 
Initially designed for the CCTP platform, it now integrates seamlessly, providing comprehensive data visualization in Flowsource.

### Prerequisites

## Type of access token

To access the CCTP API, you need to acquire

- CCTP Endpoint URL
- Username: The username to be used to generate the CCTP token
- Password: The password to be used to generate the CCTP token

### Configuration

To get started, you'll need to provide some configuration in your `app-config.yaml` and `catalog-info.yaml` files.

#### app-config.yaml

To access the CCTP Service, you must provide these configuration object's values. These are typically stored in the `app-config.yaml` file as shown below:

```yaml
cctpProxy:
    target: ${CCTP_TARGET_URL}
    username: ${CCTP_USERNAME}
    password: ${CCTP_PASSWORD}
    headers:
      Accept: 'application/json'
      Content-Type: 'application/json' 
```


### Description of Each Attribute

- `target`: The CCTP endpoint URL
- `username`: Username to generate token.
- `password`: Password for CCTP endpoint.
- `headers`: Array of headers name and value pair. For example: Accept: 'application/json'

#### catalog-info.yaml
  
In your catalog-info.yaml file, you need to add an annotation for this plugin to work:

- `flowsource/CCTP-project-name`: <CCTPProjectname>

The CCTP service can be accessed from the flowsource frontend by invoking the backend endpoint with the CCTP path parameters appended at the end of the endpoint

http://localhost:7007/api/flowsource-cctp/cctp-proxy/{CCTP Path Parameter}



