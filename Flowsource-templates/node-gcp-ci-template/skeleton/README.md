# Node Template with GCP CI Pipeline using Next.js

This template provides a basic Next.js application. The code is hosted on GitHub and includes a CI configuration using Google Cloud Build. The built image is then pushed to Google Container Registry (GCR).

## Description

This Next.js template provides a starting point for building applications on GCP. With the included CI configuration, you can automate the build process, making it easier to manage your application's lifecycle.

#### Key Components of the Next.js Application

- Custom API routes for handling business-specific logic.
- Implements resilience patterns using Mollitia.
- Provides fallback methods for handling exceptions.
- CI configuration defined in `cloudbuild.yaml` for automated builds.
- Dockerfile for containerizing the application.
- This setup ensures that the application is resilient, and ready for continuous integration on GCP, with automated security and quality checks.

## Contents / Final Output

- A GitHub repo with Next.js Application.
- Google Cloud Build CI configuration for automated builds.
- CI Pipeline.
- Docker image pushed to Google Container Registry (GCR).
- Security scans using Checkmarx and SonarQube.

## Pre-requisites

Before using this template, make sure you have the following:

- GitHub Connection to the GCP Account.
- Google Cloud Build setup.
- Setup master pipeline (Use Google Cloud Build template)
- Configure Master pipeline in Flowsource (Refer the scaffolder backend module gcp ci pipeline trigger plugin)

## Getting Started

To get started with this template, follow these steps:

1. Clone the repository from GitHub to your local machine.
2. Open the project in your preferred IDE or text editor.
3. Modify the "Hello World" code according to your requirements.
    - **GET /api/hello**: This endpoint returns a simple "Hello, World!" message.
    - **GET /api/failure**: This endpoint simulates a failure scenario and returns a fallback response.
    - **GET /api/ignore**: This endpoint throws a custom exception which is ignored by the error handler and returns a fallback response.
4. Commit and push the changes to the GitHub repository.

## CI Configuration

The CI configuration is defined in the `cloudbuild.yaml` file. It includes the following steps:

1. Checkout the source code from GitHub.
2. Runs Checkmarx for security scanning.
3. Runs SonarQube for CodeQuality.
4. Build the Docker image using the provided Dockerfile.
5. Builds the Docker image.
6. Pushes the Docker image to Google Container Registry (GCR).

For every commit pushed to the main/master branch of the repository, this CI pipeline will automatically trigger, ensuring that the latest changes are built and scanned.

#### Building Image

To build the application, follow these steps:

1. Commit and push your changes to the GitHub repository.
2. The CI pipeline will automatically trigger a build and push the image to GCR.

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

- GCP Master Pipeline using GitHub
