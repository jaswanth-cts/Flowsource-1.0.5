variable "agent_name" {
  description = "The bedrock agent name"
  type = string
}

variable "agent_description" {
  description = "The description of the bedrock agent "
  type = string
}

variable "agent_instruction" {
  description = "Instructions that tell the agent what it should do and how it should interact with users. The valid range is 40 - 8000 characters"
  type = string
}

variable "alias_description" {
  description = "Description of the alias."
  type = string
}

variable "agent_role_arn" {
  description = "ARN of the IAM role with permissions to invoke API operations on the agent."
  type = string
}

variable "foundation_model" {
  description = "Foundation model used for orchestration by the agent"
  type = string
}

variable "knowledge_base" {
  description = "The knowledge base details"
  type = object({
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
}

variable "collection" {
  default = {}
  type = map(object({
    collection_name        = string
    vector_index_name      = string
    vector_field_name      = string
    text_field_name        = string
    metadata_field_name    = string
    knowledge_base_service_role = string
  }))
}