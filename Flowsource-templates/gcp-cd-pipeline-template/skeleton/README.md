# GCP GitHub CD Template

## Description

This repository contains Continuous Deployment (CD) scripts using Google Cloud Build, organized by environment: `dev`, `qa`, and `prod`. Each folder includes environment-specific configuration values. The infrastructure is provisioned using Terraform, and Helm charts manage application deployment based on the specified environment.

## Contents / Final Output

- Continuous Deployment (CD) scripts utilize Cloud Build configuration files, with separate YAML files for each of the environment for Google Cloud Build
    - DEV environment YAML file `gcp-deploy-dev.yaml`
    - PROD environment YAML file `gcp-deploy-prod.yaml`
    - QA environment YAML file `gcp-deploy-qa.yaml`
- Terraform scripts for setting up infrastructure and Helm charts for Kubernetes deployments.
- Helm charts can deploy the application to specific environments: `dev`, `qa`, and `prod` and managing Kubernetes cluster.

## Prerequisites

Before using this repository, make sure you have the following:

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

- GitHub Connection with GCP for pipelines to work.

## Getting Started

- Before proceeding with Cloud Build configuration, ensure all configuration on GCP, including Cloud Build setup should be done manually. Please follow the steps below.

#### Google Cloud Build Project Configuration

##### Setting Up Cloud Build Trigger

1. Go to the Google Cloud Console.
2. Navigate to Cloud Build and select 'Triggers'.
3. Click 'Create trigger'.
4. Enter a name for the trigger.
5. For 'Event', select 'Push to a branch' and choose your repository and branch.
6. For 'Build Configuration', select 'Cloud Build configuration file (yaml or json)' and specify the `cloudbuild.yaml` file.
7. Click 'Create' to set up the trigger.

#### Triggering the Pipeline

- Commit and push changes to your GitHub repository to start the pipeline.

## Notes

- Ensure the `cloudbuild-deploy.yaml` file is committed to your repository.
- Verify the above mentioned necessary permissions for GCP Cloud Build are provided.
