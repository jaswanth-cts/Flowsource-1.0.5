variable "region" {
  description = "AWS Region"
  type        = string
}

variable "cluster-name" {
  description = "Name of the EKS Cluster"
  type        = string
}

variable "namespaces" {
  description = "The namespaces to create within Kubernetes"
  type        = set(string)
  default     = []
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
}

variable "namespace" {
  description = "Namespace for installation"
  type        = string
  default     = "flowsource-qa"
}

variable "deploymentname" {
  description = "Name of the deployment"
  type        = string
}

variable "clustertype" {
  description = "Type of the Kubernetes cluster"
  type        = string
  default     = "eks"
}

variable "create_namespace" {
  type        = bool
  default     = true
  description = "Create namespace if it does not exist. By default the value is false"
}
