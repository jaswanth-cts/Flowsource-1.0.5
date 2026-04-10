variable "cluster_name" {
  description = "AKS Cluster Name"
  type        = string
}

variable "api_key" {
  description = "API Key for integration with datadog"
  sensitive = true
  default = ""
}

variable "app_key" {
  description = "App Key for integration with datadog"
  sensitive = true
  default = ""
}

variable "datadog_site" {
  description = "The Datadog site parameter"
  type = string
  default = "us3.datadoghq.com"
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