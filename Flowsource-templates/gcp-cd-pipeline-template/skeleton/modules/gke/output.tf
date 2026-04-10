output "ca_certificate" {
  description = "The cluster ca certificate (base64 encoded)"
  value       = module.gke[*].ca_certificate
  sensitive   = true
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane."
  value       = module.gke[*].endpoint
  sensitive   = true
}

output "cluster_id" {
  value       = module.gke[*].cluster_id
  description = "Cluster ID"
}

output "gke_cluster_name" {
  description = "Cluster name"
  value       = module.gke[*].name
}

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region."
  value       = var.region
}

output "service_account" {
  description = "Service Account for GKE cluster."
  value       = module.gke[*].service_account
}

output "gke_auth_kubernetes_endpoint" {
  sensitive = true
  value     = module.gke_auth.host
}

output "gke_auth_client_token" {
  sensitive = true
  value     = module.gke_auth.token
}

output "gke_auth_ca_certificate" {
  value     = module.gke_auth.cluster_ca_certificate
  sensitive = true
}

output "gke_auth_kubeconfig_raw" {
  value     = module.gke_auth.kubeconfig_raw
  sensitive = true
}
