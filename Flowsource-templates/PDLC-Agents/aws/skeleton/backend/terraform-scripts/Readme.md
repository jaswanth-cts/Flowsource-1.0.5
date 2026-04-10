# PDLC Infrastructure Setup for backend
## Overview
The repository contains the Terraform scripts required to setup the backend services (DynamoDB & Lambda Functions)

> It creates the following resources:
> - Dynamo DB Tables
> - Lambda Function
 
## Usage
1. Ensure you have Terraform installed and configured with your AWS credentials. The AWS credentials used for executing the Terraform script should have the required permissions
2. Create `terraform.tfvars` file with the required configuration values.
3. Run `terraform init` to initialize the Terraform project.
4. Run `terraform plan` to review the changes that will be made.
5. Run `terraform apply` to apply the changes to your AWS account.

## Managing State
By default when executing the Terraform scripts, the terraform state will be stored locally. It is recommended to manage state at a shared location in cloud storage.
The configuration can be found in [backend.tf](backend.tf). Update the required details as per your execution environment

## Pre-requisites
Ensure we have created the below resources as pre-requisites for the terraform to run
1. VPC
2. Subnets
3. Security groups
4. IAM roles - Refer [lambda_policies.json](lambda_policies.json) for the permissions that need to be attached to the role.
5. Execute the [create_lambda_package](../backend-code/create_lambda_package.sh) and copy the `pdlc_assistant_deployment.zip` to `terraform-scripts` folder.
6. Create a cloudwatch log group using lambda function name.

## Terraform Configuration
Update the terraform.tfvars with the required configuration information

[Example tfvars](terraform.tfvars) can be used as a reference.

### Configuration Overview
- `region` - (Optional) The region in which to create the resources. Defaults to **us-east-1**

#### Dynamo DB Tables
    > For each Dynamodb table to be created  specify the configurations. The name of DynamoDB table to which the configuration block applies is specified as the key. The DynamoDB tables are created with serversideencryption enabled using the default KMS-managed DynamoDB key.

- `name` - (Required) Unique within a region name of the table.    
- `hash_key` - (Required, Forces new resource) Attribute to use as the hash (partition) key. Must also be defined as an `column`
- `range_key` - (Optional, Forces new resource) Attribute to use as the range (sort) key. Must also be defined as an `column`
- `billing_mode` - (Optional) Controls how you are billed for read/write throughput and how you manage capacity. The valid values are **PROVISIONED** and **PAY_PER_REQUEST**. Defaults to `PAY_PER_REQUEST`
- `read_capacity` - (Optional) The number of read units for this table. If the billing_mode is **PROVISIONED**, this field should be greater than 0, else it's not required
- `write_capacity` - (Optional) The number of write units for this table. If the billing_mode is **PROVISIONED**, this field should be greater than 0, else it's not required
- `columns` - (Required) Set of attribute definitions. Each attribute is specified as key value pair wherein the key is the name of the attribute and the type is the value. The attribute type must be a scalar type: , N, or B for (S)tring, (N)umber or (B)inary data.  Only specify hash_key and range_key attributes for table and indexes.
- `global_secondary_indexes` - (Optional) List of  GSIs for the table; subject to the normal limits on the number of GSIs. For each GSI the following configurations can be provided:
    - `hash_key` - (Required) Name of the hash key in the index; must be defined as an attribute in the resource
    - `name` - (Required) Name of the index
    - `projection_type` - (Required) One of **ALL**, **INCLUDE** or **KEYS_ONLY** where ALL projects every attribute into the index, KEYS_ONLY projects into the index only the table and index hash_key and sort_key attributes , INCLUDE projects into the index all of the attributes that are defined in `non_key_attributes` in addition to the attributes that KEYS_ONLY project.
    - `non_key_attributes` - (Optional) Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not have to be defined as attributes on the table
    - `range_key` - (Optional) Name of the range key; must be defined
    - `read_capacity` - (Optional) Number of read units for this index. Must be set if billing_mode is set to **PROVISIONED**.
    - `write_capacity` - (Optional) Number of write units for this index. Must be set if billing_mode is set to **PROVISIONED**

    #### Lambda Function Configurations
- `lambda_functionname` - (Required) Name of the Lambda Function for the backend service
- `lambda_function_file` - The path to an existing zip-file to use
- `lambda_iam_role` - IAM role ARN attached to the Lambda Function. This governs both who / what can invoke your Lambda Function, as well as what resources our Lambda Function has access.
- `lambda_handler` - Lambda Function entrypoint in your code
- `security_groups` - List of security group ids when Lambda Function should run in the VPC
- `subnets` - List of subnet ids when Lambda Function should run in the VPC. Usually private or intra subnets.
- `lambda_runtime` - Lambda Function runtime
- `lambda_function_memory` - (Optional) Amount of memory in MB Lambda Function can use at runtime. Defaults to `128 MB`
- `lambda_function_timeout` - (Optional) Amount of time Lambda Function has to run in seconds. Defaults to `30 seconds`
- `lambda_environment_variables` - (Optional) A map that defines environment variables for the Lambda Function