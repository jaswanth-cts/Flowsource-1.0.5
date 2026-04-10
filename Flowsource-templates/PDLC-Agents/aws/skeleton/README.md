# Flowsource-PDLC-Bot
Repository for PDLC Frontend and Backend and corresponding terraform scripts.# PDLC Infrastructure Setup
## Overview
The repository contains the Terraform scripts required to setup the services for frontend (API Gateway & Apprunner), backend (DynamoDB & Lambda Functions) and bedrock-infra (Opensearch collections, index, bedrock agent, knowledbase & datasources)

> It creates the following resources:
> - API Gateway
> - Required Lambda Resource Policy to allow API gateway to invoke Lambda function
> - Apprunner service
> - Dynamo DB Tables
> - Lambda Function
> - Opensearch collections
> - Opensearch index for a collection
> - Bedrock agent and alias
> - Bedrock knowledge base
> - Datasource for Bedrock knowledge base

### Permissions Required
In order for the Terraform script to create the various resoutrces, the user executing the Terraform needs to have the relevant permissions for creation of above resources. Some of the permissions that might be needed are provided below. Please note that there might be additional permissions/policies needed as well depending on the environment.
- aoss:APIAccessAll
- aoss:BatchGetCollection
- aoss:CreateAccessPolicy
- aoss:CreateCollection
- aoss:CreateSecurityPolicy
- aoss:DeleteAccessPolicy
- aoss:DeleteCollection
- aoss:DeleteSecurityPolicy
- aoss:GetAccessPolicy
- aoss:GetSecurityPolicy
- aoss:ListTagsForResource
- aoss:TagResource
- aoss:UntagResource
- apigateway:*
- apprunner:CreateService
- apprunner:CreateVpcConnector
- apprunner:CreateVpcIngressConnection
- apprunner:DeleteService
- apprunner:DeleteVpcConnector
- apprunner:DeleteVpcIngressConnection
- apprunner:DescribeCustomDomains
- apprunner:DescribeService
- apprunner:DescribeVpcConnector
- apprunner:DescribeVpcIngressConnection
- apprunner:ListConnections
- apprunner:ListServices
- apprunner:ListTagsForResource
- apprunner:ListVpcConnectors
- apprunner:ListVpcIngressConnections
- apprunner:TagResource
- apprunner:UntagResource
- apprunner:UpdateVpcIngressConnection
- bedrock:ApplyGuardrail
- bedrock:AssociateAgentCollaborator
- bedrock:AssociateAgentKnowledgeBase
- bedrock:CreateAgent
- bedrock:CreateAgentAlias
- bedrock:CreateDataSource
- bedrock:CreateKnowledgeBase
- bedrock:DeleteAgent
- bedrock:DeleteAgentAlias
- bedrock:DeleteDataSource
- bedrock:DeleteKnowledgeBase
- bedrock:DisassociateAgentCollaborator
- bedrock:DisassociateAgentKnowledgeBase
- bedrock:GetAgent
- bedrock:GetAgentAlias
- bedrock:GetAgentKnowledgeBase
- bedrock:GetDataSource
- bedrock:GetInferenceProfile
- bedrock:GetKnowledgeBase
- bedrock:GetKnowledgeBaseDocuments
- bedrock:InvokeModel
- bedrock:InvokeModelWithResponseStream
- bedrock:InvokeModelWithResponseStream
- bedrock:ListAgentAliases
- bedrock:ListAgentCollaborators
- bedrock:ListAgentKnowledgeBases
- bedrock:ListAgents
- bedrock:ListKnowledgeBaseDocuments
- bedrock:ListKnowledgeBases
- bedrock:ListTagsForResource
- bedrock:PrepareAgent
- bedrock:Retrieve
- bedrock:RetrieveAndGenerate
- bedrock:UpdateAgent
- bedrock:UpdateAgentAlias
- bedrock:UpdateAgentCollaborator
- bedrock:UpdateAgentKnowledgeBase
- bedrock:UpdateDataSource
- bedrock:UpdateKnowledgeBase
- dynamodb:CreateTable
- dynamodb:DeleteTable
- dynamodb:DescribeContinuousBackups
- dynamodb:DescribeTable
- dynamodb:DescribeTimeToLive
- dynamodb:GetItem
- dynamodb:ListBackups
- dynamodb:ListTables
- dynamodb:ListTagsOfResource
- dynamodb:Query
- dynamodb:TagResource
- dynamodb:UntagResource
- dynamodb:UpdateTable
- ec2:DescribeVpcEndpoints
- iam:PassRole
- kms:Decrypt
- lambda:AddPermission
- lambda:CreateFunction
- lambda:DeleteFunction
- lambda:DeleteFunctionCodeSigningConfig
- lambda:GetFunction
- lambda:GetFunctionCodeSigningConfig
- lambda:GetPolicy
- lambda:InvokeFunction
- lambda:ListFunctions
- lambda:ListLayers
- lambda:ListTags
- lambda:ListVersionsByFunction
- lambda:PublishLayerVersion
- lambda:RemovePermission
- lambda:TagResource
- lambda:UntagResource
- lambda:UpdateFunctionCodeSigningConfig
- logs:DescribeLogGroups
- logs:ListTagsForResource
- s3:GetObject
- s3:GetObjectAttributes
- s3:GetObjectVersion
- s3:GetObjectVersionAttributes
- s3:ListBucket
- s3:PutObject

## Build the Lambda Package
execute the `create_lambda_package.(sh/bat)` from `PDLC-Backend/backend/backend-code` to build the deployment package for the lambda function.
 
## Usage
1. Ensure you have Terraform installed and configured with your AWS credentials. The AWS credentials used for executing the Terraform script should have the required permissions
2. Create `terraform.tfvars` file with the required configuration values.
3. Run `terraform init` to initialize the Terraform project.
4. Run `terraform plan` to review the changes that will be made.
5. Run `terraform apply` to apply the changes to your AWS account.
6. *Make sure that backend scripts are run prior to frontend scipts, as during API Gateway creation the TF will try to provide execution role to Lambda function. Bedrock-infra can be run in prior or after.*

## Managing State
By default when executing the Terraform scripts, the terraform state will be stored locally. It is recommended to manage state at a shared location in cloud storage.
The configuration can be found in [backend.tf](backend.tf). Update the required details as per your execution environment

## Pre-requisites
Ensure we have created the below resources as pre-requisites for the terraform to run
1. VPC
2. Subnets
3. Security groups
4. IAM roles 
6. Private endponits
7. VPC link in API Gateway
8. Network Load Balancer.

## Branch Strategy
1. Create branch from `flowsource-dev`
2. Raise PR to `flowsource-dev`
3. Merge `flowsource-dev` to `flowsource-demo2`
4. Merge `flowsource-demo2` to `main`
