variable "region" {
  description = "The region where the resources will be created"
  type = string
  default = "us-east-1"
}

variable "opensearch_collections" {
  default = {}
  type = map(object({
    collection_name        = string
    vpc_endpoint_id        = list(string)
    vector_index_name      = string
    vector_field_name      = string
    text_field_name        = string
    metadata_field_name    = string
    knowledge_base_service_role = string
  }))
}

variable "flowsource_bedrock_agents" {
  default = {}
  type = map(object({
    agent_name                  = string
    agent_description           = string
    agent_instruction           = string
    alias_description           = string
    agent_role_arn              = string
    foundation_model            = string
    knowledge_base        = object({
      knowledge_base_name         = string
      knowledge_base_service_role = string
      embedding_model_arn         = string
      collection_name             = string
      datasources = map(object({
        datasource_name           = string
        datasource_s3_bucket_arn  = string
        inclusion_prefixes        = list(string)
      }))
    })
  }))
}