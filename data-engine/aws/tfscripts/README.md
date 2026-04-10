# Data Pipeline for Flowsource setup on AWS
## Overview
The repository contains the Terraform scripts required to setup the required Lambda Functions, triggers, Athena and Redshift tables for the Data pipeline for Flowsource. 


## Usage
1. Ensure you have Terraform installed and configured with your AWS credentials. The AWS credentials used for executing teh Terraform script should have the required permissions to Create, Modify and Delete Lambda Functions, Layers, Event triggers and other resources
2. Create `terraform.tfvars` file with the required configuration values.
3. Run `terraform init` to initialize the Terraform project.
4. Run `terraform plan` to review the changes that will be made.
5. Run `terraform apply` to apply the changes to your AWS account.

## Managing State
By default when executing the Terraform scripts, the terraform state will be stored locally. It is recommended to manage state at a shared location in cloud storage.
The configuration can be found in [backend.tf](backend.tf). Update the required details as per your execution environment


## Terraform Configuration
Update the terraform.tfvars with the required configuration information such as the Subnets, Lambda Functions to be created, details for triggers, Source code for the functions, etc. 

[Example tfvars](terraform.tfvars.example) can be used as a reference.
### Configuration Overview

- **Lambda Functions**: Defines multiple Lambda functions for platform engine and data engines such as  (Jira, Jenkins) with specific runtime, handler, timeout settings, and associated IAM roles for execution.
- **IAM Roles**: Specifies the ARN of the IAM role to be assumed by Lambda functions for execution. The Terraform script does not create the IAM role but requires it to be already created with the required permissions
- **Lambda Layers**: Manages new and existing Lambda layers for additional code or data that Lambda functions can leverage. 
- **CloudWatch Event Triggers**: Sets up CloudWatch events to trigger Lambda functions on a scheduled basis.
- **S3 Bucket Notification Trigger**: Configures an S3 bucket to trigger a Lambda function upon new object creation events.
- **Athena Tables**: Creates the Athena external tables with the required columns and configurations in the specified database. The database needs to be pre-created and is not created through the Terraform. This is because Terraform currently does not allow us to specify Workgroup when creating the database and only creates database in Primary Workgroup. In many cases Primary workgroup is disabled.
- **Redshift Serverless**: Configuration information for provisioning Redshift Serverless. Need to provide details such as Subnets, Security Groups, Limits

### Key Components
---

#### Lambda Layers
Each layer (whether to be newly created or existing one) should be uniquely identified by a key. This key will be used to identify the layer to associate with the corresponding Lambda Functions in the lambda function related configuration 
- **New Lambda Layers**: Provide details of the Layers that would be created by the Terraform script.
    - Filename: Name of the zip file that contains the code for the Layer
    - Runtimes: Optional value providing list of compatible runtimes for the Layer
    - Name: Name for the Lambda Layer
- **Existing Lambda Layers**: Utilizes an existing layer such as for AWS parameters and secrets management.
For an existing Lambda Layer provide
    ARN: ARN for the Lambda Layer


#### Lambda Functions

- **Platform Engine Function**: 
  - Name: Name for the Platform Engine Lambda Function eg. `flowsource-test-platform-engine`
  - Runtime: The runtime for the Lambda function such as Python, Node etc. eg.`python3.12`
  - Handler: The name of the handler file eg. `lambda_function.py`
  - Timeout: Timeout configuration in seconds for the Platform Engine Lambda Function eg. `900`
  - Filename: Zip file name and path which contains the required function code
  - IAM Role: The IAM role to be assumed for execution of the Platform Engine Lambda Function. The ARN for the IAM Role needs to be specified
  - Subnet Ids: The Subnet Ids to be used for the Lambda Function. These are not created by the Terraform script and need to be pre-created
  - Security Group Ids: The Security group ids to associate with Lambda Function. These are not created by the Terraform script and need to be pre-created
  - Layers: List of keys of the layers to associate with the Lambda functions. Refer [Lambda Layers](#lambda-layers)
  - Environment Variables: Key value pairs of environment variables to pass to function

- **Data Engine Functions**: Provide details of the Lambda function for each of the data agents such as Jenkins, JIRA, SNOW, etc. The 
For each agent (identified with a key) provide the following details
  - Name: Name for the Lambda Function eg. `flowsource-test-data-engine`
  - Runtime: The runtime for the Lambda function such as Python, Node etc. eg.`python3.12`
  - Handler: The name of the handler file eg. `lambda_function.py`
  - Timeout: Timeout configuration in seconds for the Lambda Function eg. `900`
  - Filename: Zip file name and path which contains the required function code
  - IAM Role: The IAM role to be assumed for execution of the Lambda Function. The ARN for the IAM Role needs to be specified
  - Subnet Ids: The Subnet Ids to be used for the Lambda Function. These are not created by the Terraform script and need to be pre-created
  - Security Group Ids: The Security group ids to associate with Lambda Function. These are not created by the Terraform script and need to be pre-created
  - Layers: List of keys of the layers to associate with the Lambda functions. Refer [Lambda Layers](#lambda-layers)
  - Environment Variables: Key value pairs of environment variables to pass to function  

#### CloudWatch Event Triggers

- **Scheduled Triggers**: Configures events to trigger Lambda functions

#### S3 Bucket Notification Trigger

- **Bucket Configuration**: Sets up a notification for a specified S3 bucket to trigger Platform Engin Lambda function


#### Athena Tables
Provide details of the Athena external tables to be created. The tables created use JSON data (from data engine) from S3 bucket as input. The configuration is provided as a Map with key identifying the table and the corresponding configuration for the table as value.
The following details need to be provided for each table:
  - Name: Name of the Athena table
  - Database Name:  Name of the metadata database where the table metadata resides
  - Description: Optional field providing description of the table
  - S3 Location: Physical location of the table. This is the S3 bucket where the JSON data resides
  - Columns: Key value pair for each column where the key is the name of the column and value is the data type of the column

