# General Account Information
variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
}

variable "region" {
  description = "The region in which to create the resources"
  default     = "us-east1"
}

variable "gke_cluster_name" {
  description = "The name of the cluster"
  type        = string
}

variable "use_private_endpoint" {
  description = "Connect on the private GKE cluster endpoint"
  type        = bool
  default     = true
}

# Helm variables

variable "kubeconfig" {
  description = "The Kubernetes configuration containing the host and certificate details"
  sensitive   = true
  type = object({
    host                   = string
    cluster_ca_certificate = string
    token                  = optional(string)
  })
}

variable "chart" {
  description = "Location of the helm chart"
  type        = string
}

variable "chartversion" {
  description = "Version of the chart to deploy. If not specified latest version will be used"
  type        = string
  default     = ""
}

variable "chartrepository" {
  description = "The repository for the chart"
  type        = string
  default     = ""
}

variable "values-files" {
  description = "List of Fully qualified values files"
  type        = list(any)
  default     = []
}

variable "namespace" {
  description = "Namespace for installation"
  type        = string
}

variable "deploymentname" {
  description = "Name of the deployment"
  type        = string
}

variable "create_namespace" {
  type        = bool
  default     = false
  description = "Create namespace if it does not exist. By default the value is false"
}