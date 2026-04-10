# React Template with Azure CI Pipeline

This template provides a basic React application. The code is hosted on Azure Repos and includes a CI configuration using Azure Pipelines. The built image is then pushed to Azure Container Registry (ACR).

## Description

This React template provides a starting point for building applications on Azure. With the included CI configuration, you can automate the build process, making it easier to manage your application's lifecycle.

#### Key Components of the React Application

- Basic React application setup.
- CI configuration defined in `azure-pipelines.yml` for automated builds.
- Dockerfile for containerizing the application.
- This setup ensures that the application is ready for continuous integration on Azure, with automated security and quality checks.

## Contents / Final Output

- An Azure Repos repository with React Application.
- Azure Pipelines CI configuration for automated builds.
- CI Pipeline.
- Docker image pushed to Azure Container Registry (ACR).
- Security scans using Checkmarx and SonarQube.

## Pre-requisites

Before using this template, make sure you have the following:

- Azure DevOps account with access to Azure Repos and ACR.
- Azure Pipelines and Container Registry enabled in Azure.
- Setup master pipeline (Use Azure master pipeline template)
- Configure Master pipeline in Flowsource (Refer the scaffolder backend module azure ci pipeline trigger plugin)

## Getting Started

To get started with this template, follow these steps:

1. Clone the repository from Azure Repos to your local machine.
2. Open the project in your preferred IDE or text editor.
3. Modify the "Hello World" code according to your requirements.
4. Commit and push the changes to the Azure Repos repository.

## CI Configuration

The CI configuration is defined in the `azure-pipelines.yml` file. It includes the following steps:

1. Checkout the source code from Azure Repos.
2. Runs Checkmarx for security scanning.
3. Runs SonarQube for CodeQuality.
4. Build the Docker image using the provided Dockerfile.
5. Pushes the Docker image to Azure Container Registry (ACR).

For every commit pushed to the main/master branch of the repository, this CI pipeline will automatically trigger, ensuring that the latest changes are built and scanned.

#### Building Image

To build the application, follow these steps:

1. Commit and push your changes to the Azure Repos repository.
2. The CI pipeline will automatically trigger a build and push the image to ACR.

#### Sonar Analysis

The project is compiled and tested, and Sonar analysis is performed using the specified Sonar project key and URL.

#### Checkmarx Scan

The project is scanned using Checkmarx, and the scan results are saved in a PDF report.

## Flowsource Sections Enabled

- CodeQuality
- CICD
- CodeRepository
- Well Architected - Security - SAST

## Related Templates

- Azure Master Pipeline
