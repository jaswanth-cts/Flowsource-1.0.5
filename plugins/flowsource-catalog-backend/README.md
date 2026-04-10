# flowsource-catalog

This plugin provides a scheduler that periodically fetches catalog items and updates s3 or Azure Storage with these items by calling  API.
The scheduler's refreshInterval, timeout  are made configurable.


_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-catalog](http://localhost:3000/flowsource-catalog).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.


## Pre-requisites: 
Requires access to Azure or AWS S3 => access_key_id; secret_access_key; s3_region; s3_bucket_name; s3_upload_path;


## Configurations
To use the flowsource-catalog backend plugin, you will need to configure the following in the `app-config.yaml` file.
(The configurations related to the scheduler are optional.)
```
catalogExtended:
  insights:
    url: ${INSIGHTS_URL}
    api_key: ${INSIGHTS_API_KEY}
  scheduler:
    refreshInterval:
      hours: ${CATALOGEXTENDED_REFRESH_INTERVAL_HOURS}
      minutes: ${CATALOGEXTENDED_REFRESH_INTERVAL_MINUTES}
      seconds: ${CATALOGEXTENDED_REFRESH_INTERVAL_SECONDS}
    timeout:
      hours: ${CATALOGEXTENDED_TIMEOUT_HOURS}
      minutes: ${CATALOGEXTENDED_TIMEOUT_MINUTES}
      seconds: ${CATALOGEXTENDED_TIMEOUT_SECONDS}
```
## Cloud Provider Specific configuration
Specify the cloudProvider .Currently azure and aws are allowed
```yaml
catalogInfo:
  cloudProvider: ${CATALOG_INFO_CLOUD_PROVIDER}
```

## S3 Configuration

For S3 configuration, `cloudProvider` should be mentioned `aws`
```yaml
catalogInfo:
  cloudProvider: ${CATALOG_INFO_CLOUD_PROVIDER 
  awsS3:
    access_key_id: ${CATALOG_S3_ACCESS_KEY_iD}
    secret_access_key: ${CATALOG_S3_ACCESS_KEY_iD}
    s3_region: ${CATALOG_S3_REGION}
    s3_bucket_name: ${CATALOG_S3_BUCKET_NAME}
    s3_upload_path: ${CATALOG_S3_UPLOAD_PATH}
```

## Azure Blob Storage Configuration

For Azure Blob Storage configuration, `cloudProvider` should be mentioned `azure`
```yaml
catalogInfo:
  cloudProvider: ${CATALOG_INFO_CLOUD_PROVIDER}
  azure:
    storage_account_name: ${CATALOG_STORAGE_ACCOUNT_NAME}
    blob_container_name: ${CATALOG_BLOB_CONTAINER_NAME}
    blob_folder_name: ${CATALOG_BLOB_FOLDER_NAME}
    azure_client_id:  ${CATALOG_AZURE_CLIENT_ID}
    azure_tenant_id:  ${CATALOG_AZURE_TENANT_ID}
    azure_secret_key:  ${CATALOG_AZURE_SECRET_KEY}
```

## Google Cloud Storage Configuration

For Google Cloud Storage configuration, `cloudProvider` should be mentioned `googleGcs`
```yaml
catalogInfo:
  cloudProvider: ${CATALOG_INFO_CLOUD_PROVIDER}
  googleGcs:
      dataset_name: ${INSIGHTS_GCS_DATASET_NAME}
      projectId: ${INSIGHTS_GCS_PROJECT_ID}
    # Uncomment the following lines to use Service Account credentials
    # private_key: ${INSIGHTS_GCS_PRIVATE_KEY}
    # client_email: ${INSIGHTS_GCS_CLIENT_EMAIL}
```
- If `private_key` and `client_email` are present, the plugin uses **GCP IAM Service Account credentials** for authentication.
- If they are **not** present, the plugin will automatically use **Google Workload Identity or Application Default Credentials (ADC)** for authentication.  

**Note:**  
When running locally, ensure you have authenticated with `gcloud auth application-default login` if using ADC.
---
For googleGcs provider,  the serviceAccount  for Authentication should be added in the values.yaml to use during deployment.

### Release Notes
### Version 1.0.2
- Added support for both GCP IAM Service Account credentials and Google Workload Identity / Application Default Credentials (ADC) for GCS authentication. The plugin will automatically use Workload Identity/ADC if service account credentials are not provided in the config.