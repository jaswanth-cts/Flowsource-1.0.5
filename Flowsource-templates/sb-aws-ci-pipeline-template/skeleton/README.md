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

## Conclusion

This SpringBoot template provides a starting point for building and deploying applications on AWS. With the included CI configuration, you can automate the build and deployment process, making it easier to manage your application's lifecycle.
