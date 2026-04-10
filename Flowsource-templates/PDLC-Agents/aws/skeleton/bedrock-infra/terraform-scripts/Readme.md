# PDLC Infrastructure Setup
## Overview
The repository contains the Terraform scripts required to setup the bedrock-infra (Opensearch collections, index, bedrock agent, knowledbase & datasources) 

> It creates the following resources:
> - Opensearch collections
> - Opensearch index for a collection
> - Bedrock agent and alias
> - Bedrock knowledge base
> - Datasource for Bedrock knowledge base
 
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
1. IAM role - Refer [bedrock_policies.json](bedrock_policies.json) for the permissions that need to be attached to the role.
2. S3 bucket for knowledge base
3. Private endponits

## Terraform Configuration
Update the terraform.tfvars with the required configuration information

[Example tfvars](terraform.tfvars) can be used as a reference.

### Configuration Overview
- `region` - (Optional) The region in which to create the resources. Defaults to **us-east-1**

    #### Bedrock infra Configurations
- `collection_name` - (Required) Name of the collection.
- `vpc_endpoint_id` - (Required) VPC endpoint id for the opensearch collection
- `vector_index_name` - (Required) Name of the index to create
- `vector_field_name` - (Required) Name of the vector field
- `text_field_name` - (Required) Mapping field name of the metadata
- `metadata_field_name` - (Required) Mapping field name of the metadata
- `knowledge_base_service_role` - (Required) ARN of the IAM role with permissions to access collections
- `agent_name` - (Required) Name of the agent.
- `agent_description` - (Optional) Description of the agent.
- `agent_instruction` - Instructions that tell the agent what it should do and how it should interact with users. The valid range is 40 - 8000 characters.
- `alias_description` - (Optional) Description of the alias.
- `agent_role_arn` -  (Required) ARN of the IAM role with permissions to invoke API operations on the agent.
- `foundation_model` - Foundation model used for orchestration by the agent
- `knowledge_base_name` - (Required) Name of the knowledge base
- `knowledge_base_service_role` - ARN of the IAM role with permissions to invoke API operations on the knowledge base.
- `embedding_model_arn` - (Required) ARN of the model used to create vector embeddings for the knowledge base.
- `collection_name` - (Required) Name of the OpenSearch Service vector store
- `datasource_name` - (Required) Name of the data source.
- `datasource_s3_bucket_arn` - (Required) ARN of the bucket that contains the data source.
- `inclusion_prefixes` - (Optional) List of S3 prefixes that define the object containing the data sources.