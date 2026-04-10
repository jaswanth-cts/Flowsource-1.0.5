# @flowsource/plugin-scaffolder-backend-module-gcp-ci-pipeline-trigger

The `gcp-ci-pipeline-trigger` module is a plugin for [@flowsource/backstage-plugin-scaffolder-backend].

## About

This plugin integrates with Google Cloud Platform (GCP) to trigger Cloud Build pipelines based on GitHub repository events. It allows you to automate CI workflows by creating GCP Cloud Build triggers that respond to changes in your GitHub repositories.

## Type of access token

To use this plugin, you need a GCP service account with the appropriate permissions. To run this plugin we need to provide these keys:

- **type**
- **project_id**
- **private_key_id**
- **private_key**
- **client_email**
- **client_id**
- **auth_uri**
- **token_uri**
- **auth_provider_x509_cert_url**
- **client_x509_cert_url**
- **universe_domain**
- **triggerId**

## Permissions to be given

The CodePipeline service account or role must have the following permissions:

**Permission of the Role ARN**:

The service account must have the following permissions:

- cloudbuild.builds.create
- cloudbuild.builds.get
- cloudbuild.builds.list
- cloudbuild.builds.update
- cloudbuild.triggers.create
- cloudbuild.triggers.get
- cloudbuild.triggers.list
- cloudbuild.triggers.update

## Configuration

Add the following configuration to your `app-config.yaml`:

```yaml
integrations:
  google:
    - type: ${GOOGLE_TYPE}
      project_id: ${GOOGLE_PROJECT_ID}
      private_key_id: ${GOOGLE_PRIVATE_KEY_ID}
      private_key: ${GOOGLE_PRIVATE_KEY}
      client_email: ${GOOGLE_CLIENT_EMAIL}
      client_id: ${GOOGLE_CLIENT_ID}
      auth_uri: ${GOOGLE_AUTH_URI}
      token_uri: ${GOOGLE_TOKEN_URI}
      auth_provider_x509_cert_url: ${GOOGLE_AUTH_PROVIDER_X509_CERT_URL}
      client_x509_cert_url: ${GOOGLE_CLIENT_X509_CERT_URL}
      universe_domain: ${GOOGLE_UNIVERSE_DOMAIN}
      triggerId: ${GIT_TRIGGER_ID}
```

### Description of Attributes

- **type**: The type of the GCP integration, should be service_account.
- **project_id**: The ID of your GCP project.
- **private_key_id**: The ID of the private key.
- **private_key**: The private key associated with the service account.
- **client_email**: The email address of the service account.
- **client_id**: The client ID of the service account.
- **auth_uri**: The URI for authentication.
- **token_uri**: The URI for token generation.
- **auth_provider_x509_cert_url**: The URL for the auth provider's x509 certificate.
- **client_x509_cert_url**: The URL for the client's x509 certificate.
- **universe_domain**: The domain for the GCP APIs.
- **triggerId**: The ID of the Cloud Build trigger.

## Changes to be made to the source code to include the plugin

Add the below in `packages/backend/package.json`.

```json
"@flowsource/plugin-scaffolder-backend-module-gcp-ci-pipeline-trigger" : PLUGIN_VERSION
```

Add the below in `packages/backend/src/plugins/scaffolder.ts`.

```typescript
import { scaffolderGcpCiTriggerPipeline } from '../../../plugins/scaffolder-backend-module-gcp-ci-pipeline-trigger/src/actions/triggerGcpCiPipelineAction/module';

backend.add(scaffolderGcpCiTriggerPipeline);
```
