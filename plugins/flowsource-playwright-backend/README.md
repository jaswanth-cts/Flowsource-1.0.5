# flowsource-playwright

Welcome to the flowsource-playwright backend plugin! This plugin retrieves suite details from AWS S3, Azure and Google Cloud Storage (GCS).

## Features

- Fetches test suite details from AWS S3, Azure and GCS buckets.
- Supports multiple cloud providers: AWS, Azure and GCS.
- Provides APIs to retrieve test data, including suite titles, suite count, and statistics.

## Prerequisites

GCS or AWS S3 access required

## Access Token Requirements

To use this plugin, you need the following credentials:

### AWS S3

- **Access Key Id** (Optional when running within an AWS instance)
- **Secret Access Key** (Optional when running within an AWS instance)
- **Role Arn** (Required)
- **Region** (Required)
- **Bucket Name** (Required)

## Permissions to be given to access AWS S3

The AWS Role Arn must have an IAM identity with the following policies:

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
This plugin supports two authentication mechanisms for GCS:

- **1. GCP IAM Service Account Credentials**:
  - `type`
  - `project_id`
  - `private_key_id`
  - `private_key`
  - `client_email`
  - `client_id`
  - `auth_uri`
  - `token_uri`
  - `auth_provider_x509_cert_url`
  - `client_x509_cert_url`
  - `universe_domain`

- **2. Google Workload Identity / Application Default Credentials (ADC)**:
If you do not provide private_key and client_email in your config, the plugin will automatically use Workload Identity or ADC for authentication.
**Ex:**
playwright:
  gcp:
    projectId: <your-gcp-project-id>
    bucketName: <your-gcs-bucket-name>
    # Uncomment the following lines to use Service Account credentials
    # private_key: "-----BEGIN PRIVATE KEY-----\n..."
    # client_email: "your-service-account@your-project.iam.gserviceaccount.com"

*If private_key and client_email are present, Service Account authentication is used.*
*If they are not present, Workload Identity or ADC is used.*

## Permission to be given to access GCS

The GCS Service Account must have the following IAM roles:

- **Storage Object Viewer**: Grants permission to view objects and their metadata in the bucket.
- **Storage Object Admin**: Grants permission to create, delete, and update objects in the bucket.

## Configuration

Store the following in your `app-config.yaml`:

### AWS S3 Configuration

```yaml
playwright:
    awsS3Bucket:
        accessKeyId: ${PLAYWRIGHT_S3_ACCESS_KEY} # Optional
        secretAccessKey: ${PLAYWRIGHT_S3_SECRET_KEY} # Optional
        roleArn: ${PLAYWRIGHT_S3_ROLE_ARN} # Required
        region: ${PLAYWRIGHT_S3_REGION} # Required
        bucketName: ${PLAYWRIGHT_S3_BUCKET_NAME}
    azureStorage:
        azureStorageAccountName: ${PLAYWRIGHT_AZURE_STORAGE_ACCOUNT_NAME}
        azureContainerName: ${PLAYWRIGHT_AZURE_CONTAINER_NAME}
        azure_client_id: ${PLAYWRIGHT_AZURE_CLIENT_ID}
        azure_tenant_id: ${PLAYWRIGHT_AZURE_TENANT_ID}
        azure_secret_key: ${PLAYWRIGHT_AZURE_SECRET_KEY} 
 ```
 # Ensure the Playwright test result JSON file is uploaded to the specified S3 bucket after the test run
**Note** - When deploying the code outside of an AWS instance, it is compulsory to provide the `accessKeyId` and `secretAccessKey`. However, when deploying within an AWS instance, these fields are optional.

## Source Code Changes

Add the following code in `packages/backend/src/index.ts`:

```typescript
backend.add(import('@flowsource/plugin-flowsource-playwright-backend'));
```

Add the following in `packages/backend/package.json`:

```json
"@flowsource/plugin-flowsource-playwright-backend": "PLUGIN_VERSION"
```

## Getting Started

Run `yarn start` in the root directory and navigate to `/flowsource-playwright`. For faster development, run `yarn start` in the plugin directory.

## Release Notes
### Version 1.0.3
- Added support for both GCP IAM Service Account credentials and Google Workload Identity / Application Default Credentials (ADC) for GCS authentication. The plugin will automatically use Workload Identity/ADC if service account credentials are not provided in the config.

### Version 1.0.2
- Added support for Google Cloud Storage (GCS) & Azure.
- Enhanced error handling for both AWS S3 and GCS.
