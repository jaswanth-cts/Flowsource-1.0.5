# Outputs
output "collection_endpoint" {
  description = "Collection-specific endpoint used to submit index, search, and data upload requests to an OpenSearch Serverless collection"
  value       = aws_opensearchserverless_collection.pdlc-kb-vectordb-collection.collection_endpoint 
}