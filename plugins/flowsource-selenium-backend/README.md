# flowsource-selenium

Welcome to the flowsource-selenium backend plugin! This plugin retrieves the results of a Selenium test run from either an AWS S3 bucket or Google Cloud Storage (GCS) bucket and displays it.

### Prerequisites

## Access Token Requirements
To use this plugin, you need an AWS Access Key Id, Secret Access Key, Role Arn, and region with permissions to access the AWS S3 bucket.

### AWS S3

To use the AWS S3 integration, you will need an AWS Access Key ID, Secret Access Key, and Role ARN when running locally or on a non-EKS (AWS) instance. If running on an AWS EKS instance, you can utilize a Role ARN to access the required AWS services. Ensure the necessary permissions are granted to access AWS S3.

## Permissions to be given for accessing AWS S3 bucket

The AWS Role ARN must have an IAM identity with the following policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3List",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "*"
    },
    {
      "Sid": "S3",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::<BucketName>"
      ]
    }
  ]
}
```

### Google Cloud Storage (GCS)

To use the GCS integration, you will need a service account JSON key with the necessary permissions to access the GCS bucket. Ensure the service account has the required IAM roles to read objects from the bucket.

## Permissions to be given for accessing Google Cloud Storage (GCS)

The service account must have the following IAM roles:

`roles/storage.objectViewer` - To read objects from the bucket.

## Configuration

## AWS S3 Configuration

Store the following in your `app-config.yaml`:

```yaml
selenium:
    awsS3Bucket:
        accessKeyId: ${SELENIUM_S3_ACCESS_KEY} # Optional
        secretAccessKey: ${SELENIUM_S3_SECRET_KEY} # Optional
        roleArn: ${SELENIUM_S3_ROLE_ARN} # Optional
        region: ${SELENIUM_S3_REGION} # Required
        bucketName: ${SELENIUM_S3_BUCKET_NAME} # Required
    azureStorage:
        azureStorageAccountName: ${SELENIUM_AZURE_STORAGE_ACCOUNT_NAME}
        azureContainerName: ${SELENIUM_AZURE_CONTAINER_NAME}
        azure_client_id: ${SELENIUM_AZURE_CLIENT_ID}
        azure_tenant_id: ${SELENIUM_AZURE_TENANT_ID}
        azure_secret_key: ${SELENIUM_AZURE_SECRET_KEY}
 ```
# Ensure the Selenium test result JSON file is uploaded to the specified S3 bucket after the test run.

**Note** - Alternatively, when running on an AWS EKS instance, you do not need to provide `accessKeyId` and `secretAccessKey`. The plugin utilizes the `roleArn` provided to access necessary AWS services.

## Google Cloud Storage (GCS) Configuration

Store the following in your `app-config.yaml`:

```yaml
selenium:
  gcsBucket:
    type: ${PLAYWRIGHT_GCS_TYPE} # Required
    project_id: ${PLAYWRIGHT_GCS_PROJECT_ID} # Required
    private_key_id: ${PLAYWRIGHT_GCS_PRIVATE_KEY_ID} # Required
    private_key: ${PLAYWRIGHT_GCS_PRIVATE_KEY} # Required
    client_email: ${PLAYWRIGHT_GCS_CLIENT_EMAIL} # Required
    client_id: ${PLAYWRIGHT_GCS_CLIENT_ID} # Required
    auth_uri: ${PLAYWRIGHT_GCS_AUTH_URI} # Required - "https://accounts.google.com/o/oauth2/auth"
    token_uri: ${PLAYWRIGHT_GCS_TOKEN_URI} # Required - "https://oauth2.googleapis.com/token"
    auth_provider_x509_cert_url: ${PLAYWRIGHT_GCS_AUTH_PROVIDER_CERT_URL} # Required - "https://www.googleapis.com/oauth2/v1/certs"
    client_x509_cert_url: ${PLAYWRIGHT_GCS_CLIENT_CERT_URL} # Required
    universe_domain: ${PLAYWRIGHT_GCS_UNIVERSE_DOMAIN} # Required - "googleapis.com"
    bucketName: ${PLAYWRIGHT_GCS_BUCKET_NAME} # Required
```
```yaml
selenium:
  gcsBucket:
    project_id: ${SELENIUM_GCS_PROJECT_ID} # Required
    bucketName: ${SELENIUM_GCS_BUCKET_NAME} # Required
    # Uncomment the following lines to use Service Account credentials
    # private_key: ${SELENIUM_GCS_PRIVATE_KEY} # Optional
    # client_email: ${SELENIUM_GCS_CLIENT_EMAIL} # Optional
    # ...other service account fields as needed
```
*If private_key and client_email are present, the plugin uses Service Account credentials for authentication.*
*If they are not present, the plugin automatically uses Google Workload Identity or Application Default Credentials (ADC) for authentication.*

## Ensure the Selenium test result JSON file is uploaded to the specified S3 bucket after the test run

## Source Code Changes

Add the below code in `packages/backend/src/index.ts`:

```typescript
backend.add(import('@flowsource/plugin-flowsource-selenium-backend'));
```

Add the below in `packages/backend/package.json`

```json
"@flowsource/plugin-flowsource-selenium-backend": PLUGIN_VERSION
```

## Getting Started

Run `yarn start` in the root directory and navigate to `/flowsource-selenium`. For faster development, run `yarn start` in the plugin directory.

## Backstage Version Compatibility

This plugin is compatible with Backstage version 1.36.0.

## Release Notes
### Version 1.0.3

- Added support for both GCP IAM Service Account credentials and Google Workload Identity / Application Default Credentials (ADC) for GCS authentication. The plugin will automatically use Workload Identity/ADC if service account credentials are not provided in the config.

### Version 1.0.2

- Added new plugin
- Made `accessKeyId`, `secretAccessKey` and `role arn` as optional.
- Enabled the use of EKS service accounts for accessing AWS services, provided the IRSA setup is configured for the EKS pod and the associated RoleARN has the necessary permissions.
- Added support for Google Cloud Storage (GCS) integration.
- Added support for Azure integration.
