output "cluster_endpoint" {
  description = "Endpoint for EKS control plane."
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Cluster Name"
  value       = module.eks.cluster_name
}

output "cluster_id" {
  description = "Cluster Id"
  value       = module.eks.cluster_id
}

output "node_security_group_id" {
  description = "Id of the Node Shared Security Group"
  value       = module.eks.node_security_group_id
}

output "cluster_security_group_id" {
  description = "Id of the Cluster Security Group"
  value       = module.eks.cluster_security_group_id
}

output "cluster_primary_security_group_id" {
  description = "Cluster security group that was created by Amazon EKS for the cluster"
  value       = module.eks.cluster_primary_security_group_id
}

output "certificate_authority" {
  description = "Certificate authority for the cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}
