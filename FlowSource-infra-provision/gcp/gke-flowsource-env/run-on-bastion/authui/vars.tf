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

# Helm variables
variable "namespace" {
  description = "Namespace for installation"
  type        = string
}

variable "create_namespace" {
  type        = bool
  default     = false
  description = "Create namespace if it does not exist. By default the value is false"
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

variable "deploymentname" {
  description = "Name of the deployment"
  type        = string
}
