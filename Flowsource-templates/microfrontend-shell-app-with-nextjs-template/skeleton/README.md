# Microfrontend Shell App with Next.js Template and AWS CI Pipeline

This template provides a basic microfrontend shell application using Next.js. The code is hosted in GitHub and includes a CI configuration for automated builds. The built image is then pushed to Amazon Elastic Container Registry (ECR).

## Description

This Next.js template provides a starting point for building and deploying microfrontend shell applications on Amazon Web Services (AWS). With the included CI configuration, you can automate the build and deployment process, making it easier to manage your application's lifecycle.

## Contents / Final Output

- A basic microfrontend shell application using Next.js.
- CI configuration for automated builds.
- CI Pipeline
- Docker image pushed to Amazon Elastic Container Registry (ECR).
- Security scans using Checkmarx and SonarQube.

## Prerequisites

Before using this template, make sure you have the following:

- GitHub account and AWS account.
- Master Pipeline

## Getting Started

To get started with this template, follow these steps:

1. Clone the repository from GitHub to your local machine.
2. Open the project in your preferred IDE or text editor.
3. Modify the code according to your requirements.
4. Commit and push the changes to the GitHub repository.

### Installation

1. Install the dependencies using below command:

   ```shell
   yarn install
   ```

### Development

To run the development server, you need to set the REMOTE_URL environment variable. This variable specifies the URL where the Microfrontend remote app is running.

1. On macOS/Linux:

   Start the development server using below command:

   ```shell
   export REMOTE_URL=http://localhost:3001
   ```

   ```shell
   yarn dev
   ```

2. On Windows:

   Start the development server using below command:

   ```shell
   set REMOTE_URL=http://localhost:3001
   ```

   ```shell
   yarn winDev
   ```

## CI Configuration

The CI configuration is defined in the `aws-pipeline.yaml` file. It includes the following steps:

1. Checkout the source code from GitHub.
2. Run security scans to identify vulnerabilities.
3. Build the Docker image using the provided Dockerfile.
4. Push the built image to ECR.

## Building Image

To build and deploy the application, follow these steps:

1. Commit and push your changes to the GitHub repository.
2. The CI pipeline will automatically trigger a build and push the image to ECR.

## Sonar Analysis

The project is compiled and tested, and Sonar analysis is performed using the specified Sonar project key and URL.

## Checkmarx Scan

The project is scanned using Checkmarx, and the scan results are saved in a PDF report.

## Flowsource Sections Enabled

- CodeQuality
- CICD

## Related Templates

- scaffolder-backend-module-aws-ci-pipeline-trigger

## Feature Toggle Management

This project leverages **Unleash**, an open-source library for feature management. It includes examples of common feature flag use cases such as gradual rollouts, A/B testing, and kill switches.

### Running Unleash Server Locally

#### Option 1: Using Docker Compose

1. Clone the Unleash repository and start the server:

    ```shell
    git clone https://github.com/Unleash/unleash.git
    cd unleash
    docker compose up -d
    ```

    This pulls the `unleashorg/unleash-server` Docker image and uses Docker Compose to configure the Unleash server and its database.

#### Option 2: Using Docker

1. Pull the Unleash server image:

   ```shell
   docker pull unleashorg/unleash-server
   ```

2. Create a Docker network for communication between containers:

   ```shell
   docker network create unleash
   ```

3. Start a PostgreSQL database container:

   ```shell
   docker run -d \
     -e POSTGRES_PASSWORD=your_secure_password \
     -e POSTGRES_USER=unleash_user \
     -e POSTGRES_DB=unleash \
     --network unleash \
     --name postgres \
     postgres:15
   ```

4. Start the Unleash server container:

   ```shell
   docker run -d -p 4242:4242 \
     -e DATABASE_HOST=postgres \
     -e DATABASE_NAME=unleash \
     -e DATABASE_USERNAME=unleash_user \
     -e DATABASE_PASSWORD=your_secure_password \
     -e DATABASE_SSL=false \
     --network unleash \
     --name unleash \
     --pull=always \
     unleashorg/unleash-server
   ```

### Accessing the Unleash Admin UI

1. Open your browser and navigate to <http://localhost:4242>.
2. Log in using the default credentials:

- **Username**: `admin`
- **Password**: `unleash4all`

### Importing Feature Flags

1. Click the `Import` icon near the "New Feature Flag" button.
2. Select `Code editor`, paste the following configuration, and click `Validate` followed by `Import Configuration`.

   ```json
   {
    "features": [
      {
        "name": "enable-chat",
        "description": "Enable chat support feature for specific users",
        "type": "experiment",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "newUI",
        "description": "default strategy",
        "type": "experiment",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "show-cart",
        "description": "Show cart tab based on region",
        "type": "release",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      }
    ],
    "featureStrategies": [
      {
        "name": "flexibleRollout",
        "id": "9acbe053-ac03-43a9-a8f8-961bd5b9359d",
        "featureName": "enable-chat",
        "title": null,
        "parameters": {
          "groupId": "enable-chat",
          "rollout": "100",
          "stickiness": "default"
        },
        "constraints": [
          {
            "values": ["5", "10", "15"],
            "inverted": false,
            "operator": "IN",
            "contextName": "userId",
            "caseInsensitive": false
          }
        ],
        "variants": [],
        "disabled": false,
        "segments": []
      },
      {
        "name": "flexibleRollout",
        "id": "e367eef6-9275-49a5-a5ba-92c56afd3add",
        "featureName": "newUI",
        "title": null,
        "parameters": {
          "groupId": "newUI",
          "rollout": "100",
          "stickiness": "default"
        },
        "constraints": [],
        "variants": [
          {
            "name": "A",
            "weight": 500,
            "payload": { "type": "string", "value": "red" },
            "stickiness": "default",
            "weightType": "variable"
          },
          {
            "name": "B",
            "weight": 500,
            "payload": { "type": "string", "value": "green" },
            "stickiness": "default",
            "weightType": "variable"
          }
        ],
        "disabled": false,
        "segments": []
      },
      {
        "name": "flexibleRollout",
        "id": "e777c8eb-fd8a-4232-a2a7-07e4a92baeb0",
        "featureName": "show-cart",
        "title": null,
        "parameters": {
          "groupId": "show-cart",
          "rollout": "100",
          "stickiness": "default"
        },
        "constraints": [
          {
            "values": ["us-east"],
            "inverted": false,
            "operator": "IN",
            "contextName": "region",
            "caseInsensitive": false
          }
        ],
        "variants": [],
        "disabled": false,
        "segments": []
      }
    ],
    "featureEnvironments": [
      {
        "enabled": true,
        "featureName": "enable-chat",
        "environment": "development",
        "variants": [],
        "name": "enable-chat"
      },
      {
        "enabled": true,
        "featureName": "newUI",
        "environment": "development",
        "variants": [],
        "name": "newUI"
      },
      {
        "enabled": true,
        "featureName": "show-cart",
        "environment": "development",
        "variants": [],
        "name": "show-cart"
      }
    ],
    "contextFields": [
      {
        "name": "region",
        "description": "region",
        "stickiness": true,
        "sortOrder": 10,
        "legalValues": [
          { "value": "ap-south", "description": "" },
          { "value": "us-east", "description": "" }
        ]
      },
      {
        "name": "userId",
        "description": "Allows you to constrain on userId",
        "stickiness": false,
        "sortOrder": 1,
        "legalValues": []
      }
    ],
    "featureTags": [],
    "segments": [],
    "tagTypes": [],
    "dependencies": []
    }
   ```

### Generating an API Token

1. Navigate to `Settings` > `API Access`.
2. Click `New API Token` and select:

   - **Type**: `Server-side SDK`
   - **Environment**: `development`

3. Copy the generated token and add it to the `application.yaml` file under the Unleash configuration.

This setup enables you to manage feature flags effectively and integrate Unleash into your application.

### Implementation

By wrapping your application or specific components with the `<FlagProvider />`, you can initialize the Unleash SDK and gain access to feature flags.

Unleash provides several hooks to interact with the feature flags in the application

- `useFlag`:
  - Used to check the state of a specific feature flag.
  - Returns a boolean indicating whether the feature is enabled or disabled.

  ```javascript
  import { useFlag } from "@unleash/nextjs";
  
  const isFeatureEnabled = useFlag("featureName");
  
  if (isFeatureEnabled) {
    // Render feature specific content
  }
  ```

- `useVariant`:
  - Used to retrive the variant of a feature flag.
  - Variants allow you to implement A/B testing or serve different configurations for a feature.

  ```javascript
  import { useVariant } from "@unleash/nextjs";
  
  const variant = useVariant("featureName");

  if (variant.name === "variantA") {
    // Render content for variant A
  } else {
    // Render content for other variants
  }
  ```

#### Unleash Context

The Unleash Context allows you to pass dynamic, request-specific attributes (e.g., user ID, session ID, environment) to the Unleash server for advanced feature toggle evaluations.

```javascript
const unleashContext = {
  userId: "value", // Unique identifier for the user
  properties: { 
    key1: "value1", //Custom properties for evaluation
    key2: "value2" 
  }, 
};

<FlagProvider config={{context: unleashContext}}>
  <YourComponet/>
</FlagProvider>
```
