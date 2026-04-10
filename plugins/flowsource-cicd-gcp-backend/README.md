# flowsource-cicd-gcp

Welcome to the flowsource-cicd-gcp backend plugin!

## About

This plugin integrates with Google Cloud Platform (GCP) to fetch build details from Cloud Build triggers. It uses the `AuthService` to authenticate and retrieve necessary credentials and project information. The plugin also supports GitHub integration to fetch source details.

## Type of access token

To access the GCP Codebuild Pipeline API, you need to acquire

- Service Account: A GCP service account with the necessary permissions.
- Token: An OAuth 2.0 token for accessing GCP APIs.

## Permissions to be Given

The service account or token must have the following permissions:

- "cloudbuild.builds.list"

## Configuration

To access the GCP service account, you must provide these configuration object's values. These are typically stored in the `app-config.yaml` file as shown below:

```yaml
intergrations:
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
      gitToken: ${GIT_TOKEN}
      source: ${SOURCE_CODE_PROVIDER}
      github: ${GITHUB_ENABLED}
integrations:
  google:
    - project_id: ${GOOGLE_PROJECT_ID}
      # Uncomment the following lines to use Service Account credentials
      # private_key: ${GOOGLE_PRIVATE_KEY}
      # client_email: ${GOOGLE_CLIENT_EMAIL}
      # ...other fields as needed
```
*If private_key and client_email are present, Service Account authentication is used.*
*If they are not present, Workload Identity or ADC is used.*

### Description of Each Attribute

- `type`: Type of the integration, e.g., service_account.
- `project_id`: GCP project ID.
- `private_key_id`: Private key ID of the service account.
- `private_key`: Private key of the service account.
- `client_email`: Client email of the service account.
- `client_id`: Client ID of the service account.
- `auth_uri`: URI for OAuth 2.0 authentication.
- `token_uri`: URI for OAuth 2.0 token.
- `auth_provider_x509_cert_url`: URL for the provider's X.509 certificate.
- `client_x509_cert_url`: URL for the client's X.509 certificate.
- `universe_domain`: Domain of the universe.
- `gitToken`: GitHub token for accessing repositories.
- `source`: Source code provider of the repository.
- `github`: Boolean indicating if GitHub integration is enabled.


## Changes to be made to the source code to include the plugin

1. Ensure the AuthService and GcpService classes are imported and instantiated correctly.
2. Use the GcpService methods to fetch build details and handle the responses.
3. Import the backend plugin to packages/backend/src/index.ts

```typescript
backend.add(import('@flowsource/plugin-flowsource-cicd-gcp-backend'));
```

Add the below in `packages/backend/package.json`

```json
"@flowsource/plugin-flowsource-cicd-gcp-backend": PLUGIN_VERSION
```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsourceCicdGcpPlugin/health](http://localhost:7007/api/flowsourceCicdGcpPlugin/health).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Release Notes
### Release version : 1.0.3
Added support for both GCP IAM Service Account credentials and Google Workload Identity / Application Default Credentials (ADC) for authentication. The plugin will automatically use Workload Identity/ADC if service account credentials are not provided in the config.

### Release version : 1.0.1
  - Fetching failure reasons for failed builds.