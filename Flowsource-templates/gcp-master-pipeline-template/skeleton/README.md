# GCP Master Pipeline Template

## Description

This GCP Master CI Pipeline Template provides a comprehensive solution for setting up a master pipeline using Google Cloud Build and Google Cloud Deploy. With this template, you can automate the creation of CI pipelines for your applications, ensuring faster and more reliable software delivery.

By leveraging Google Cloud Build, you can set up a repository that can be used to create CI pipelines. These CI pipelines will then handle the build, test, and packaging phases for your application code. Google Cloud Deploy orchestrates the entire release process, allowing you to define the stages and actions required to deploy your application to various environments.

## Contents / Final output

The gcp-master-ci-pipeline generally creates a repository which can be used in a CodePipeline to set up the master pipeline for any application. This master pipeline can then be used to create CI pipelines for new repositories.

## Pre-requisites

Before you begin, ensure you have the following:

- Necessary permissions for Service account.

        - Artifact Registry Administrator
        - Cloud Build Connection Admin
        - Cloud Build Editor
        - Cloud Build Service Account
        - Cloud Build WorkerPool User
        - Compute Admin
        - Kubernetes Engine Admin
        - Kubernetes Engine Developer
        - Private Logs Viewer
        - Secret Manager Admin
        - Service Account User
        - Cloud Build Viewer
        - Kubernetes Engine Viewer
        - Logs Writer
        - Secret Manager Secret Accessor
        - Service Account Token Creator
        - Service Usage Consumer
        - Storage Object Creator
        - Storage Object Viewer

## Getting Started

#### GitHub Integration

1. **Configure GitHub Connection**: Establish a connection between Google Cloud Build and your GitHub account to enable automated builds from your repositories.
   - For instructions, visit: [Connecting GitHub with Google Cloud Build](https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github?generation=1st-gen).
   - **Note**: In version 2, repository linking is automated through the Master Pipeline's Trigger.

2. **Service Account Setup**: Create a service account in GCP to run the builds. You'll need to provide the service account email to Terraform for creating the Master Pipeline.

## Creating a Cloud Build Project

1. **Access Cloud Build Console**: Sign in to Google Cloud Console and navigate to the Cloud Build console.
2. **Create Build Trigger**:
   - **Project Name**: Choose a unique name.
   - **Region**: Specify the deployment region.
   - **Description**: Provide a brief description.
   - **Tags**: (Optional) Add relevant tags.
   - **Events**: Define trigger events.
   - **Source**: Select the source repository and branch.
   - **Configuration**: Point to the `cloudbuild.yaml` file and its location.

3. **Advanced Settings**:
   - **Substitution Variables**: Add any required variables (e.g., `_SERVICE_ACCOUNT_EMAIL`, `_GITHUB_REPO_NAME`).

        | Name                      | Value                                                                 |
        |---------------------------|-----------------------------------------------------------------------|
        | _BRANCH_NAME              | The name of the branch in the repository where the build will be triggered.|
        | _CLOUDBUILD_YAML_PATH     | The path to the CloudBuild YAML configuration file.                   |
        | _GITHUB_CONNECTION_NAME   | The name of the GitHub connection used for the build.                 |
        | _GITHUB_REPO_NAME         | The name of the GitHub repository.                                    |
        | _GITHUB_REPO_OWNER        | The owner of the GitHub repository.                                   |
        | _REGION                   | The region where the build is executed.                               |
        | _SERVICE_ACCOUNT_EMAIL    | The email of the service account used for the build.                  |
        | _TRIGGER_NAME             | The name of the trigger that initiates the build.                     |

   - **Approval and Logs**: Configure options for build approvals and logging.

4. **Service Account**: Select a service account with the necessary permissions.

5. **Create Trigger**: Finalize and create your build trigger.

### Permissions

Service Principle Account is required in-order to trigger master pipeline, with the required roles.

## Using the Pipeline

- **Triggering Builds**: Manually trigger the build or configure automatic triggers based on source code changes.
- **Monitoring**: Keep track of build progress, and access logs and artifacts for each build stage.

This guide simplifies the setup process for a GCP Master CI Pipeline, ensuring you have a robust CI/CD workflow in place.
