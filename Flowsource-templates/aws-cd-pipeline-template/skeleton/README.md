# Continuous Deployment for Spring Boot Application

This repository contains Continuous Deployment (CD) scripts and Helm charts for a sample Spring Boot application, organized by environment: `dev`, `qa`, and `prod`. Each folder contains environment-specific configuration values.

## AWS CodeBuild Project Configuration

### Creating a Build Project

1. Go to the AWS CodeBuild console.
2. Click 'Create build project'.
3. Enter a project name.
4. For 'Source', select 'AWS CodeCommit' and choose your repository and branch.
5. Configure the environment settings as needed.
6. Enter the service role name.
7. In 'Additional Configuration', set up the VPC, subnets, and security groups.
8. Enter the buildspec file name.
9. Click 'Create build project'.

## AWS CodePipeline Configuration

### Creating a Pipeline

1. Go to the AWS CodePipeline console.
2. Click 'Create pipeline'.
3. Enter a pipeline name.
4. Connect to AWS CodeCommit and select your repository and branch.
5. Enter the service role name.
6. In the build stage, select the CodeBuild project created previously.
7. Skip the deploy stage; EKS does not support CodeDeploy.
8. Review and create the pipeline.

### Triggering the Pipeline

- Commit and push changes to your CodeCommit repository to start the pipeline.

## Notes

- Ensure the `buildspec-deploy.yml` file is committed to your repository.
- Verify that necessary permissions for AWS CodeBuild and CodePipeline are provided.
