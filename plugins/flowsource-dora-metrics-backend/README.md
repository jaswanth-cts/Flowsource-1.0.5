# flowsource-dora-metrics

Welcome to the flowsource-dora-metrics backend plugin!

_This plugin was created through the Backstage CLI_

- Four key metrics that indicate the performance of a software development team.


## Description

The flowsource-dora-metrics backend plugin:

- Fetches deployment frequency, lead time for changes, change failure rate, and mean time to recover metrics from the database using SELECT statements.
- Does minimal calculations, such as averages, date formatting, and epoch to JavaScript date conversion.
- Returns metrics, trends, and the last updated time in a format usable by the frontend plugin.
- Ensures data reflects trends over the specified period as calculated and stored by the Data Engines.


## Permissions Required

#### Permissions for `AWS Redshift` or `AWS Redshift Serverless`:
  The keys INSIGHTS_REDSHIFT_AWS_ACCESS_KEY and INSIGHTS_REDSHIFT_AWS_SECRET_KEY will require access to perform these actions on the configured Redshift DB.
  ```
  "redshift-data:GetStatementResult"
  "redshift-data:DescribeStatement"
  "redshift-data:ExecuteStatement"
  "redshift:GetClusterCredentials"
  ```

#### Permissions for Azure COSMOS DB for PostgreSQL:

The configuration uses username and password for authentication. Ensure that there is network connectivity between the Cluster and Cosmos DB for it to work. Below permissions need to be added for the username to access database, schema and tables.

GRANT CONNECT ON DATABASE your_database TO username;

GRANT USAGE ON SCHEMA your_schema TO username;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO username;

#### Permissions for Google Cloud Big Query DataSet:

- The configuration uses Workload Identity Federation mechanism.The list of roles required to be added on the Google IAM Service Account which is impersonated by Kubernetes service account for the database are
   ```
  roles/bigquery.dataViewer,
  roles/bigquery.jobUser,
  roles/bigquery.user,
  roles/iam.workloadIdentityUser
  ```
- For gcp provider, the Kubernetes ServiceAccount for Authentication should be added in the values.yaml to be used during deployment.


## Configurations
To use the DORA Metrics backend, you will need to configure the following in the `app-config.yaml` file.

The DORA Metrics backend supports three types of database configurations: 
1) Redshift and Redshift Serverless from AWS.
2) Azure COSMOS DB for Postgresql
3) Google Cloud Big Query DataSet 

### Cloud Provider Specific configuration
Specify the cloudProvider. Currently `gcp`, `azure` and `aws` are allowed.
```yaml
dora:
  insights:
    cloudProvider: ${INSIGHTS_CLOUDPROVIDER}
```

### AWS specific Configuration 

For `AWS Redshift` or `AWS Redshift Serverless`, provide the `cloudProvider` as `aws`.

#### Redshift specific Configuration 
For Redshift configuration,`cloudProvider` shoudl be mentioned aws and you need to provide the `clusterIdentifier` and `dbUser` in the `app-config.yaml` file. If these values are provided and not empty, the backend will use Redshift specific configuration.
```yaml
dora:
  insights:
    cloudProvider: ${INSIGHTS_CLOUDPROVIDER}
    aws:
      database: ${INSIGHTS_REDSHIFT_DATABASE}
      dbUser: ${INSIGHTS_REDSHIFT_DB_USER}
      clusterIdentifier: ${INSIGHTS_REDSHIFT_CLUSTER_IDENTIFIER}
      schema: ${INSIGHTS_REDSHIFT_SCHEMA}
      region: ${INSIGHTS_REDSHIFT_REGION}
      accessKeyId: ${INSIGHTS_REDSHIFT_AWS_ACCESS_KEY}
      secretAccessKey: ${INSIGHTS_REDSHIFT_AWS_SECRET_KEY}
```

#### Redshift Serverless specific Configuration
For Redshift Serverless configuration,`cloudProvider` shoudl be mentioned aws and  you need to provide the `workgroupName` and `secretArn` in the app-config.yaml file. If these values are provided and not empty, the backend will use Redshift Serverless specific configuration.
```yaml
dora:
  insights:
    cloudProvider: ${INSIGHTS_CLOUDPROVIDER}
    aws:
      database: ${INSIGHTS_REDSHIFT_DATABASE}
      workgroupName: ${INSIGHTS_REDSHIFT_SERVERLESS_WORKGROUP_NAME}
      secretArn: ${INSIGHTS_REDSHIFT_SERVERLESS_SECRET_ARN}
      schema: ${INSIGHTS_REDSHIFT_SCHEMA}
      region: ${INSIGHTS_REDSHIFT_REGION}
      accessKeyId: ${INSIGHTS_REDSHIFT_AWS_ACCESS_KEY}
      secretAccessKey: ${INSIGHTS_REDSHIFT_AWS_SECRET_KEY}
```

#### Note:
For aws `cloudProvider` If both Redshift and Redshift Serverless configurations are provided, the backend will prioritize the Redshift configuration and ignore the Redshift Serverless configuration.

If neither Redshift nor Redshift Serverless configurations are provided, the backend will log an error message and throw an exception: "Invalid database configuration. Please provide either Redshift or Redshift Serverless configuration."

### Azure COSMOS DB for Postgresql configuration

For Azure COSMOS DB for Postgresql, provide the `cloudProvider` as `azure` 
```yaml
dora:
  insights:
    cloudProvider: ${INSIGHTS_CLOUDPROVIDER}
    azure:
      host: ${INSIGHTS_AZURE_DB_HOST}                    
      port: ${INSIGHTS_AZURE_DB_PORT}
      user: ${INSIGHTS_AZURE_DB_USER}
      password: ${INSIGHTS_AZURE_DB_PASSWORD}
      database: ${INSIGHTS_AZURE_DB_DATABASE}
      schema: ${INSIGHTS_AZURE_DB_SCHEMA}
```

### Google Cloud DataSet configuration

For Google Cloud DataSet, provide the `cloudProvider` as `gcp` 
```yaml
dora:
  insights:
    cloudProvider: ${INSIGHTS_CLOUDPROVIDER}
    gcp:
      dataset_name: ${INSIGHTS_GCS_DATASET_NAME}
      projectId: ${INSIGHTS_GCS_PROJECT_ID}
```

```yaml
dora:
  insights:
    cloudProvider: gcp
    gcp:
      dataset_name: ${INSIGHTS_GCS_DATASET_NAME}
      projectId: ${INSIGHTS_GCS_PROJECT_ID}
      # Uncomment the following lines to use Service Account credentials
      # private_key: ${INSIGHTS_GCS_PRIVATE_KEY}
      # client_email: ${INSIGHTS_GCS_CLIENT_EMAIL}
```

- If `private_key` and `client_email` are present, the plugin uses **GCP IAM Service Account credentials** for authentication.
- If they are **not** present, the plugin will automatically use **Google Workload Identity or Application Default Credentials (ADC)** for authentication.  
 
#### Note:
For gcp provider, the serviceAccount for Authentication should be added in the values.yaml to use during deployment.


## Changes to be made to the source code to include the plugin

- Add the below in `index.ts`
  - ```
    backend.add(import('@flowsource/plugin-flowsource-dora-metrics-backend'));
    ```
- Add the below in `packages/backend/package.json`
  - ```
    "@flowsource/plugin-flowsource-dora-metrics-backend": PLUGIN_VERSION
    ```

## Configuration to be updated in `catalog-info.yaml`

- **Annotations** in catalog yaml for mentioning the specific tools to use:
  - `flowsource/dora-cicd-tool` - Allowed values are `jenkins`, `github-actions`, `aws-codepipeline`, `gcp-cloudbuild`
  - `flowsource/dora-scm-tool` - Allowed values are `github`
  - `flowsource/dora-alm-tool` - Allowed values are `jira`, `azure-boards`
  - `flowsource/dora-itsm-tool` - Allowed values are `service-now`
  - `flowsource/dora-observability-platform` - Allowed values are `datadog`, `dynatrace`

  - E.g.,
    ```yaml
    flowsource/dora-cicd-tool: jenkins
    flowsource/dora-scm-tool: github
    flowsource/dora-alm-tool: jira
    flowsource/dora-itsm-tool: service-now
    flowsource/dora-observability-platform: datadog
    ```

- Also, check the metric specific annotations in the pre-requisites below.

## Pre-requisites specific to each metrics
- ### `Deployment Frequency` Pre-requisites
  
  **Annotations** to be added in catalog:
  
  - #### For Jenkins
    - `flowsource/jenkins-prod-deployment-job-full-project-name` - Full project name of the Jenkins Deployment Job. It is of the format `PIPELINE_NAME/JOB_NAME`.
  
  - #### For AWS CodePipeline
    - `flowsource/aws-region` - Production AWS region.
    - `flowsource/awscodepipeline-prod-deployment-pipelines` - Production deployment pipeline for AWS.

  - #### For GCP Cloud Build
    - `flowsource/gcp-region` - Production GCP region.
    - `flowsource/gcpcodebuild-prod-deployment-pipelines` - Production deployment pipeline for GCP Cloud Build.

- ### `Mean Time to Recover` Pre-requisites
  - #### Datadog specific Pre-requisites
    **Tags to be added for Datadog Monitors**:
    - `appid:<APPID_VALUE_FROM_CATALOG_YAML>`
    - `environment:prod`
    - `resourceMonitor:true`

    To **verify the list of configured monitors**, search them with this below  text:
    ```
    tag:("appid:APPID_VALUE_FROM_CATALOG_YAML" AND "environment:prod" AND "resourceMonitor:true")
    ```

    **Sample Monitor details**:
    - Monitor type: Live Process 
    - Query: `processes('').over('env:engg,service:ticket-booking-component').rollup('count').last('5m') <= 0`

    - **Steps to create the monitor**:
      1. Select "Live Process" type monitor
      2. Under "Search Process" add the tags that identify the resources in prod.
          Eg: `environment:prod`, `appid:ticket-booking` and `resourceMonitor:true`
      3. Under "Process" add the process. Eg: java -jar /app/target/ticket-booking.jar
      4. Alert type: Simple Alert
      5. Evaluate the query over the last: 5mins
      6. Save and create the monitor
  
  - #### Dynatrace specific Pre-requisites
    **Tags to be added for Dynatrace Monitoring entity**:
    - `appId:<APPID_VALUE_FROM_CATALOG_YAML>`
    - `environment:prod`

    Note:
    - **Tags in Dynatrace Monitoring Entity**: Whether it's a Process Group, Pod, etc., (whichever is being monitored) the tags should be defined on the monitored entity.
    - **Tag Propagation**: These tags will propagate whenever a problem or alert event is created for that entity. There is a list of Problems under the Problem tab, each problem should have the tags.
    - **Agent Collection**: The agent collects these problems/alerts with the defined tags.

- ### `Change Failure Rate` Pre-requisites
  Tags to be added for Service Now Ticket:
  - `appid`
  - `deploymentid`
  
  SNOW Incident's priority should be `critical` or `high`
  
- ### `Lead Time for changes` Pre-requisites
  For commits to be part of a story:
  - Jira and Github (or other supported developer tools) should be integrated
  https://support.atlassian.com/jira-software-cloud/docs/reference-issues-in-your-development-work/
  - GIT Commit message should contain JIRA story key prefixed with `#`.
    Eg: `#ONEDEVOPS-2273  addressed PR comments for logger message and method name`

  **Annotations** to be added in catalog:
  - `flowsource/jira-project-key` - Unique Jira Project KEY
  - To configure the final (done) status of the story
    - For JIRA tool, below annotation can be used
      - `flowsource/dora-jira-final-status` _(till flowsource version v0.2.26)_
      - `flowsource/dora-alm-final-status` _(from flowsource version v0.2.27)_
    - For Azure Devops, its a fixed value `Done`


## Other Pre-requisites 
- Ensure the `flowsource-catalog` backend plugin is properly configured for the data engines to access catalog details from the specific cloud environment.
- Verify the database is populated with the necessary data, processed and stored by the Data Engines, to enable this backend plugin to fetch the required details.


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-dora-metrics](http://localhost:3000/flowsource-dora-metrics).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

### Release Notes
### Release version : 1.0.2
- Added support for both GCP IAM Service Account credentials and Google Workload Identity / Application Default Credentials (ADC) for BigQuery authentication. The plugin will automatically use Workload Identity/ADC if service account credentials are not provided in the config.