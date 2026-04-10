# FastAPI Template with GCP CI Pipeline

This template provides a basic FastAPI application written in Python. The code is hosted on GitHub and includes a CI configuration using Google Cloud Build. The built image is then pushed to Google Container Registry (GCR).

## Description

This FastAPI template provides a starting point for building applications on GCP. With the included CI configuration, you can automate the build process, making it easier to manage your application's lifecycle.

#### Key Components of the FastAPI Application

- Custom exception handling for business-specific errors.
- Service class with business logic methods.
- Implements resilience patterns using custom middleware and decorators.
- Provides fallback methods for handling exceptions.
- REST endpoints to interact with the service.
- CI configuration defined in `cloudbuild.yaml` for automated builds.
- Dockerfile for containerizing the application, including setup and custom start script.
- This setup ensures that the application is resilient, traceable, and ready for continuous integration on GCP, with automated security and quality checks.

## Contents / Final Output

- A GitHub repo with FastAPI Application.
- GCP Cloud Build CI configuration for automated builds.
- CI Pipeline.
- Docker image pushed to Google Container Registry (GCR).
- Security scans using Checkmarx and SonarQube.

## Pre-requisites

Before using this template, make sure you have the following:

- GitHub Connection to the GCP Account.
- Cloud Build in GCP.
- Setup master pipeline (Use GCP master pipeline template)
- Configure Master pipeline in Flowsource (Refer the scaffolder backend module gcp ci pipeline trigger plugin)

## Getting Started

To get started with this template, follow these steps:

1. Clone the repository from GitHub to your local machine.
2. Open the project in your preferred IDE or text editor.
3. Modify the "Hello World" code according to your requirements.
    - **GET /hello**: This endpoint calls the `hello_service()` method in the `sample_service` module and returns a simple "Hello, World!" message.
    - **GET /failure**: This endpoint calls the `failure()` method in the `sample_service` module, simulates a failure scenario, and returns a fallback response.
    - **GET /ignore**: This endpoint calls the `ignore_exception()` method in the `sample_service` module, throws a `BusinessException` which is ignored by the circuit breaker, and returns a fallback response.
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

- GCP Master Pipeline using Github
