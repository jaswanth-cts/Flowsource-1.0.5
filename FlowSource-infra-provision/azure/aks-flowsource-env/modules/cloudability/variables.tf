variable "metrics_agent_apiKey" {
  description = "Cloudability API Key"
  sensitive = true
}

variable "cluster_name" {
  description = "AKS Cluster Name"
  type        = string
}

variable "kubeconfig" {
    description = "The Kubernetes configuration containing the host and certificate details"
    sensitive = true
    type = object({
        host  = string
        client_certificate = string
        client_key = string
        cluster_ca_certificate = string
    })
}