# SpringBoot Template with AWS CI Pipeline

This template provides a basic SpringBoot application. The code is hosted in AWS CodeCommit and includes a CI configuration for automated builds. The built image is then pushed to Amazon Elastic Container Registry (ECR).

## Prerequisites

Before using this template, make sure you have the following:

- AWS account with CodeCommit and ECR access.

## Getting Started

To get started with this template, follow these steps:

1. Clone the repository from AWS CodeCommit to your local machine.
2. Open the project in your preferred IDE or text editor.
3. Modify the "Hello World" code according to your requirements.
4. Commit and push the changes to the CodeCommit repository.

## CI Configuration

The CI configuration is defined in the `buildspec-build.yml` file. It includes the following steps:

1. Checkout the source code from CodeCommit.
2. Runs the security scans inorder to get the vulnerabilities.
3. Build the Docker image using the provided Dockerfile.
4. Push the built image to ECR.

## Building Image

To build and deploy the application, follow these steps:

1. Commit and push your changes to the CodeCommit repository.
2. The CI pipeline will automatically trigger a build and push the image to ECR.

## Sonar Analysis

The Maven project is compiled and tested, and Sonar analysis is performed using the specified Sonar project key and URL.

## Checkmarx Scan

The Java project is scanned using Checkmarx, and the scan results are saved in a PDF report.

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

### Deploying Unleash Server on Kubernetes

Ensure you have the following tools installed:

- `kubectl`
- `helm`
- Access to a Kubernetes cluster (e.g., `minikube` or a cloud provider)

Follow the below installation steps:

1. Start Minikube (Optional)

    ```bash
    minikube start
    ```

2. Add Helm Repository

    ```bash
    helm repo add unleash https://docs.getunleash.io/helm-charts
    helm repo update
    ```

3. Create a Namespace (Optional)

    ```bash
    kubectl create namespace unleash
    ```

4. Install Unleash via Helm

    ```bash
    helm install unleash-server unleash/unleash \
      --namespace unleash \
      --set unleash.database.host=postgres \
      --set unleash.database.name=unleash \
      --set unleash.database.username=unleash_user \
      --set unleash.database.password=your_secure_password
    ```

    *Note: You need a PostgreSQL database for Unleash. You can either deploy PostgreSQL separately or configure the Helm chart to deploy it as a subchart.*

5. Verify Deployment

    ```bash
    kubectl get pods -n unleash
    ```

6. Expose the service to access it locally

    ```bash
    kubectl port-forward svc/unleash-server 4242:4242 -n unleash
    ```

    Open your browser and navigate to <http://localhost:4242>

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
        "name": "betaAccess",
        "description": "Provide access to specific users",
        "type": "experiment",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "bg-color",
        "description": "Show different variants of background color",
        "type": "release",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "chat",
        "description": null,
        "type": "release",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "darkMode",
        "description": null,
        "type": "kill-switch",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "discount",
        "description": "Discount based on region",
        "type": "release",
        "project": "default",
        "stale": false,
        "impressionData": false,
        "archived": false
      },
      {
        "name": "show-cards",
        "description": "Enable cards for 50% of users",
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
        "id": "f675684a-10ac-47a1-9d8c-cab05f12a170",
        "featureName": "betaAccess",
        "title": null,
        "parameters": {
          "groupId": "betaAccess",
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
        "id": "ac41d3a5-940a-4ca8-9cca-22499f221e16",
        "featureName": "bg-color",
        "title": null,
        "parameters": {
          "groupId": "bg-color",
          "rollout": "100",
          "stickiness": "default"
        },
        "constraints": [],
        "variants": [
          {
            "name": "A",
            "weight": 500,
            "payload": { "type": "string", "value": "green" },
            "stickiness": "default",
            "weightType": "variable"
          },
          {
            "name": "B",
            "weight": 500,
            "payload": { "type": "string", "value": "red" },
            "stickiness": "default",
            "weightType": "variable"
          }
        ],
        "disabled": false,
        "segments": []
      },
      {
        "name": "flexibleRollout",
        "id": "2ac46cf9-e7a0-44f8-a196-ae7239469b50",
        "featureName": "chat",
        "title": null,
        "parameters": {
          "groupId": "chat",
          "rollout": "100",
          "stickiness": "default"
        },
        "constraints": [],
        "variants": [],
        "disabled": false,
        "segments": []
      },
      {
        "name": "flexibleRollout",
        "id": "0b57f820-1273-4e3f-b21c-929364c2cb82",
        "featureName": "darkMode",
        "title": null,
        "parameters": {
          "groupId": "darkMode",
          "rollout": "100",
          "stickiness": "default"
        },
        "constraints": [],
        "variants": [],
        "disabled": false,
        "segments": []
      },
      {
        "name": "flexibleRollout",
        "id": "975094de-93ab-4693-91be-d611fe8d9219",
        "featureName": "discount",
        "title": null,
        "parameters": {
          "groupId": "discount",
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
      },
      {
        "name": "flexibleRollout",
        "id": "a0307296-0562-4346-8cc9-589af2bda62c",
        "featureName": "show-cards",
        "title": null,
        "parameters": {
          "groupId": "show-cards",
          "rollout": "50",
          "stickiness": "default"
        },
        "constraints": [],
        "variants": [],
        "disabled": false,
        "segments": []
      }
    ],
    "featureEnvironments": [
      {
        "enabled": true,
        "featureName": "betaAccess",
        "environment": "development",
        "variants": [],
        "name": "betaAccess"
      },
      {
        "enabled": true,
        "featureName": "bg-color",
        "environment": "development",
        "variants": [],
        "name": "bg-color"
      },
      {
        "enabled": true,
        "featureName": "chat",
        "environment": "development",
        "variants": [],
        "name": "chat"
      },
      {
        "enabled": true,
        "featureName": "darkMode",
        "environment": "development",
        "variants": [],
        "name": "darkMode"
      },
      {
        "enabled": true,
        "featureName": "discount",
        "environment": "development",
        "variants": [],
        "name": "discount"
      },
      {
        "enabled": true,
        "featureName": "show-cards",
        "environment": "development",
        "variants": [],
        "name": "show-cards"
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

The project showcases two approaches to implementing feature toggles using Unleash:

- `unleash.isEnabled()`
- `@Toggle` Annotation

#### Using `unleash.isEnabled()`

This method is used to programmatically check whether a feature is enabled or disabled.

```java
unleash.isEnabled("<flag-name>", false);
```

#### Using `@Toggle` Annotation

The `@toggle` annotation defines the `feature toggle name` and specifies an `alternate bean` to use when the feature is enabled. The appropriate implementation is resolved automatically based on the toggle's state.

```java
@Toggle(name = "<flag-name>", alterBean = "<bean-name>")
```

#### Feature Variants with `@Toggle`

Unleash also supports feature variants, which can be implemented using `@Toggle` annotation along with the `@FeatureVariants` configuration. This allows you to define multiple variations of a feature toggle

```java
@Toggle(name = "<flag-name>", variants = @FeatureVariants(
  fallbackBean = "<fallback/default-bean-name>", 
  variants = {
    @FeatureVariant(name="<variant-name>", variantBean = "<variant-bean-name>"),
    //Additional variants can be added here
  }))
```

#### Unleash Context

The Unleash Context allows you to pass dynamic, request-specific attributes (e.g., user ID, session ID, environment) to the Unleash server for advanced feature toggle evaluations.

In this project, the `CustomAttributes` class implements the `UnleashContextProvider` interface to build and provide the context by extracting attributes (e.g., team, region) from the `RequestContext`.

To add additional context attributes, update the `CustomAttributes` class to include the attributes in the `UnleashContext.Builder` using the `addProperty` method.

```java
contextBuilder.addProperty("<key>", <value>)
```

## Conclusion

This SpringBoot template provides a starting point for building and deploying applications on AWS. With the included CI configuration, you can automate the build and deployment process, making it easier to manage your application's lifecycle.
