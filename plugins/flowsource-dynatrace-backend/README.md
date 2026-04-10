# flowsource-dynatrace

## Plugin Info

## Dynatrace Plugin
This Dynatrace plugin is designed to demonstrate application error logs that are already present in the Dynatrace console. It integrates via API and displays the responses from Dynatrace, providing a seamless way to monitor and analyze application errors.

## Features
Error Log Demonstration: Showcases application error logs from the existing Dynatrace console.
API Integration: Integrates with Dynatrace via API to fetch and display error log data.
Real-time Monitoring: Provides real-time insights into application errors for efficient troubleshooting.


### Prerequisites

1. **Configure Dynatrace Account**: Ensure your Dynatrace account is configured to generate an OAuth2 token (Admin Access).
2. **Generate OAuth2 Token**: Obtain the necessary credentials:
   - **Client ID**
   - **Client Secret**
   - **Resource** with all required scopes
3. **Update Configuration**: Add the obtained credentials to the `app.config.yaml` file.

### Compatibility
 
- Dynatrace version - 1.230
- Flowsource version - 0.2.31 or later

### API Calls

1. **Generate OAuth2 Token**: 
   - Make a POST API call to generate an OAuth2 token for authorization purposes.
   - Ensure you include the necessary credentials (Client ID, Client Secret, and Resource) in the request body.

2. **Fetch Application Error Response**:
   - Make a POST API call to fetch the application error response from Dynatrace.
   - Use the Grail query method to specify the required parameters and retrieve the relevant data.



### Steps to Integrate Kubernetes Cluster with Dynatrace OneAgent

1. **Deploy Kubernetes Cluster**: Deploy your Kubernetes cluster with Dynatrace OneAgent.
2. **View Namespace**: After deployment, you will be able to view the namespace in the Kubernetes cluster.
3. **Query Logs and Events**: Query logs and events using the cluster name and deployment name, which are annotated in the `catalog.info.yaml` file.
4. **Fetch Response**: Use the Grail query to fetch the response from Dynatrace based on the queried logs and events.

### Permissions to be given to the Personal account 

1. Admin access need to generate Client ID, Client Secret
2. Scope we have given access to generate Client ID, Client Secret
storage:logs:read, storage:logs:write, storage:events:read, storage:events:write, storage:metrics:read, storage:bizevents:read, storage:system:read, storage:buckets:read, storage:bucket-definitions:read, storage:bucket-definitions:write, storage:bucket-definitions:delete, storage:bucket-definitions:truncate, storage:spans:read, storage:entities:read, storage:metrics:write, storage:bizevents:write, storage:fieldsets:read, storage:records:delete, openpipeline:configurations:read, openpipeline:configurations:write.

### Configuration

To get started, you'll need to provide some configuration in your `app-config.yaml` and `catalog-info.yaml` files.

#### app-config.yaml

In your `app-config.yaml` file, add the following properties:

```yaml
DYNATRACE_CLIENTID: <your_dynatrace_clientId>
DYNATRACE_CLIENTSECRET: <your_dynatrace_clientSecret>
DYNATRACE_RESOURCE: <your_dynatrace_resource>
DYNATRACE_ENVIRONMENTID: <your_dynatrace_environmentId>
DYNATRACE_DURATION: <your_dynatrace_duration>
```


#### catalog-info.yaml
  
In your catalog-info.yaml file, you need to add an annotation for this plugin to work:

```annotations:
  flowsource/dynatrace-clusterName: <clusterName>
  flowsource/dynatrace-deploymentName: <deploymentName>
```
Replace <clusterName> and <deploymentName> with the corresponding values in the file.





