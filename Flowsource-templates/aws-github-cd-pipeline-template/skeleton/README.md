# AWS Github CD Template

## Description

This repository contains Continuous Deployment (CD) scripts using CodeBuild and CodePipeline, organized by environment: `dev`, `qa`, and `prod`. Each folder includes environment-specific configuration values. The infrastructure is provisioned using Terraform, and Helm charts manage application deployment based on the specified environment.

## Contents / Final Output

- Continuous Deployment (CD) scripts utilize buildspec files, with separate YAML files for each of the environment for AWS CloudBuild
    - Dev environemnt YAML file `buildspec-deploy-dev.yaml` 
    - PROD environemnt YAML file`buildspec-deploy-prod.yaml`, 
    - QA environemnt YAML file `buildspec-deploy-qa.yaml`
- Terraform scripts for setting up infrastructure and Helm charts for Kubernetes deployments.
- Helm charts can deploy the application to specific environments: `dev`, `qa`, and `prod` and managing Kubernetes cluster.

## EKS cluster Input parameters
EKS cluster can be created by either specifying the release version or ami id.
- When using the `ami_release_version`, make sure to set the `ami_id` to empty string.
- when using the `ami_id`, set `use_custom_launch_template` and `create_launch_template` to true. If you have custom template, then use the `template_id` and set `create_launch_template` to false 
    
## Prerequisites

Before using this repository, make sure you have the following:

- Service Role: Under the service role, select New service role or Existing service role option. Below are few permissions needed to create a service role or add to an existing role. 

- Service Role necessary permissions for CodeBuild.

        - code:GetThirdPartyJobDetails
        - codebuild:BatchGetProjects
        - codebuild:CreateProject
        - codepipeline:CreatePipeline
        - codepipeline:DeletePipeline
        - codepipeline:GetActionType
        - codepipeline:GetJobDetails
        - codepipeline:GetPipeline
        - codepipeline:GetPipelineExecution
        - codepipeline:GetPipelineState
        - codepipeline:ListActionExecutions
        - codepipeline:ListActionTypes
        - codepipeline:ListPipelineExecutions
        - codepipeline:ListPipelines
        - codepipeline:ListRuleExecutions
        - codepipeline:ListRuleTypes
        - codepipeline:ListTagsForResource
        - codepipeline:ListWebhooks
        - codepipeline:UpdatePipeline
        - codestar-connections:GetConnection
        - codestar-connections:GetConnectionToken
        - codestar-connections:PassConnection
        - codestar-connections:UseConnection
        - dynamodb:DeleteItem
        - dynamodb:DescribeTable
        - dynamodb:GetItem
        - dynamodb:PutItem
        - ec2:CreateNetworkInterface
        - ec2:CreateNetworkInterfacePermission
        - ec2:DeleteNetworkInterface
        - ec2:DescribeDhcpOptions
        - ec2:DescribeInstances
        - ec2:DescribeNetworkInterfaces
        - ec2:DescribeSecurityGroups
        - ec2:DescribeSubnets
        - ec2:DescribeVpcs
        - ecr:BatchCheckLayerAvailability
        - ecr:BatchGetImage
        - ecr:BatchGetRepositoryScanningConfiguration
        - ecr:CreateRepository
        - ecr:CreateRepositoryCreationTemplate
        - ecr:DeleteRepository
        - ecr:DescribeImageReplicationStatus
        - ecr:DescribeImages
        - ecr:DescribePullThroughCacheRules
        - ecr:DescribeRegistry
        - ecr:DescribeRepositories
        - ecr:GetAccountSetting
        - ecr:GetAuthorizationToken
        - ecr:GetDownloadUrlForLayer
        - ecr:GetLifecyclePolicy
        - ecr:GetLifecyclePolicyPreview
        - ecr:GetRegistryPolicy
        - ecr:GetRegistryScanningConfiguration
        - ecr:GetRepositoryPolicy
        - ecr:InitiateLayerUpload
        - ecr:ListImages
        - ecr:ListTagsForResource
        - ecr:PutImage
        - ecr:TagResource
        - ecr:UploadLayerPart
        - ecr:ValidatePullThroughCacheRule
        - eks:DescribeCluster
        - eks:DescribeNodegroup
        - eks:ListClusters
        - eks:ListNodegroups
        - iam:PassRole
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
        - s3:GetBucketAcl
        - s3:GetBucketLocation
        - s3:GetObject
        - s3:GetObjectVersion
        - s3:ListBucket
        - s3:PutObject
        - secretsmanager:DescribeSecret
        - secretsmanager:GetSecretValue
        - secretsmanager:ListSecrets
        - sts:AssumeRole

- Service Role necessary permissions for CodePipeline.

        - codebuild:Batch*
        - codebuild:ListBuildBatches
        - codebuild:ListBuildBatchesForProject
        - codebuild:ListBuilds
        - codebuild:ListBuildsForProject
        - codebuild:ListConnectedOAuthAccounts
        - codebuild:ListCuratedEnvironmentImages
        - codebuild:ListFleets
        - codebuild:ListProjects
        - codebuild:ListReportGroups
        - codebuild:ListReports
        - codebuild:ListReportsForReportGroup
        - codebuild:ListRepositories
        - codebuild:ListSharedProjects
        - codebuild:ListSharedReportGroups
        - codebuild:ListSourceCredentials
        - codebuild:List*
        - codepipeline:GetPipeline
        - codepipeline:GetPipelineExecution
        - codepipeline:GetPipelineState
        - codepipeline:ListPipelineExecutions
        - codepipeline:ListPipelines
        - codepipeline:RetryStageExecution
        - codepipeline:StartPipelineExecution
        - codepipeline:StopPipelineExecution

- Necessary permissions for EKS.

        - ecr:BatchCheckLayerAvailability
        - ecr:BatchGetImage
        - ecr:BatchGetRepositoryScanningConfiguration
        - ecr:DeleteRepository
        - ecr:DescribeImageReplicationStatus
        - ecr:DescribeImages
        - ecr:DescribeRepositories
        - ecr:GetLifecyclePolicy
        - ecr:GetRepositoryPolicy
        - ecr:ListImages
        - ecr:ListTagsForResource
        - ecr:PutImage
        - ecr:TagResource
        - s3:GetBucketAcl
        - s3:GetBucketLocation
        - s3:ListBucket
        - s3:PutObject

- GitHub Connection with AWS for pipelines to work.


## Getting Started

- Before proceeding with CodeBuild configuration, ensure all configuration on AWS, including CodeBuild and CodePipeline setup should be done manually. Please follow the steps below.

#### AWS CodeBuild Project Configuration

##### Creating a Build Project

1. Go to the AWS CodeBuild console.
2. Click 'Create build project'.
3. Enter a project name.
4. For 'Source', select 'GitHub' and choose your repository and branch.
    - For DEV Environment choose `buildspec-deploy-dev.yaml` file.
    - For PROD Environment choose `buildspec-deploy-prod.yaml` file
    - For QA Environment choose `buildspec-deploy-qa.yaml` file
5. Configure the environment settings as needed.
6. Enter the service role name.
7. In 'Additional Configuration', set up the VPC, subnets, and security groups.
8. Enter the buildspec file name.
9. Click 'Create build project'.

#### AWS CodePipeline Configuration

##### Creating a Pipeline

1. Go to the AWS CodePipeline console.
2. Click 'Create pipeline'.
3. Enter a pipeline name.
4. Connect to GitHub and select your repository and branch.
5. Enter the service role name.
6. In the build stage, select the CodeBuild project created previously.
7. Skip the deploy stage; EKS does not support CodeDeploy.
8. Review and create the pipeline.

#### Triggering the Pipeline

- Commit and push changes to your GitHub repository to start the pipeline.

## Notes

- Ensure the `buildspec-deploy.yml` file is committed to your repository.
- Verify the above mentioned necessary permissions for AWS CodeBuild and CodePipeline are provided.
