# Azure Repos CD Template

## Description

This repository contains Continuous Deployment (CD) scripts using Azure Pipelines, organized by environment: `dev`, `qa`, and `prod`. Each folder includes environment-specific configuration values. The infrastructure is provisioned using Terraform, and Helm charts manage application deployment based on the specified environment.

## Contents / Final Output

- Continuous Deployment (CD) scripts utilize YAML files for Azure Pipelines, with separate YAML files for each environment.
    - DEV environment YAML file `azure-pipelines-dev.yaml`
    - PROD environment YAML file `azure-pipelines-prod.yaml`
    - QA environment YAML file `azure-pipelines-qa.yaml`
- Terraform scripts for setting up infrastructure and Helm charts for Kubernetes deployments.
- Helm charts can deploy the application to specific environments: `dev`, `qa`, and `prod` and manage the Kubernetes cluster.

## Prerequisites

Before using this repository, make sure you have the following:

- **Permissions Required For Azure Resources**:
    - Access to Azure DevOps Organization: Ensure you have the necessary permissions to view and manage the organization in Azure DevOps.
    - Access to Azure DevOps Project: You must have access to the specific project where the pipelines will be created and managed.
    - Access to Azure DevOps Pipeline: Permissions to create, edit, and run pipelines within the Azure DevOps project.
    - Access to Variable Group: Ensure you have access to the variable group used in the pipeline for managing environment-specific configurations.
    - **Azure Role Assignments**:
        - **Reader**: Provides read-only access to Azure resources.
        - **Reader and Data Access**: Grants read access to Azure resources and data within those resources.
        - **Azure Kubernetes Service Cluster Admin Role**: Required for managing Kubernetes clusters.
        - **Azure Kubernetes Service Contributor Role**: Grants permissions to manage Azure Kubernetes Service (AKS) resources.
        - **Network Contributor**: Allows management of network-related resources such as virtual networks and subnets.
        - **Managed Identity Operator**: Enables management of managed identities for Azure resources.
        - **SQL DB Contributor**: Grants permissions to manage SQL databases.
        - **Custom Role (Flowsource-TF-Customrole)**: A custom role specific to your organization for managing Terraform deployments or other custom requirements.

    - **Build Permissions**:
        - Create build pipeline
        - Edit build pipeline
        - Manage build qualities
        - Manage build queue
        - Queue builds
        - Stop builds
        - Delete build pipeline
        - Delete builds
        - View build pipeline
        - View builds

## Getting Started

#### Azure Pipelines Project Configuration

##### Creating a Pipeline Configuration

1. Go to the Azure DevOps portal.
2. Click 'Pipelines' and then 'Create Pipeline'.
3. Select 'Azure Repos Git' as the source and choose your repository and branch.
    - For DEV Environment choose `azure-pipelines-deploy-dev.yaml` file.
    - For PROD Environment choose `azure-pipelines-deploy-prod.yaml` file.
    - For QA Environment choose `azure-pipelines-deploy-qa.yaml` file.
4. Configure the pipeline settings as needed.
5. Click 'Run' to create and run the pipeline.

#### Triggering the Pipeline

- Commit and push changes to your Azure Repos repository to start the pipeline.

## Notes

- Ensure the `azure-pipelines.yaml` file is committed to your repository.
- Verify the above-mentioned necessary permissions for Azure Pipelines are provided.
