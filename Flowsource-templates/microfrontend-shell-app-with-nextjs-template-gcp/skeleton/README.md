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
    
   yarn install
### Development
To run the development server, you need to set the REMOTE_URL environment variable. This variable specifies the URL where the Microfrontend remote app is running.


2. On macOS/Linux:
   Start the development server using below command:


   export REMOTE_URL=http://localhost:3001
   
   yarn dev
4. On Windows: 
   Start the development server using below command:


   set REMOTE_URL=http://localhost:3001
   
   yarn winDev

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
