variable "collection_name" {
  description = "Collection-specific endpoint used to submit index, search, and data upload requests to an OpenSearch Serverless collection."
  type = string
}

variable "vpc_endpoint_id" {
  description = "The VPC endpoint id  to allow a private connection between your VPC and OpenSearch Serverless"
  type = list(string)
}

variable "knowledge_base_service_role" {
  type = string
  description = "The ARN of the knowledge base service account"
}