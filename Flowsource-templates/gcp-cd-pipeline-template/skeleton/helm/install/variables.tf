# General Account Information

variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
  default     = ""
}

variable "region" {
  description = "The region in which to create the resources"
  default     = "us-east1"
}


variable "backend_bucket_name" {
  description = "Name of the bucket where terraform state file will be stored"
  type        = string
}

# VPC and Network related Variables
#=====================================

# Required if pre-created VPC is to be used for setting up GKE
variable "network_name" {
  description = "The name of the VPC in which to create cluster"
  type        = string
  default     = ""
}

## =======================================
# GKE Cluster Variables
#=====================================

variable "gke_cluster_name" {
  description = "The name of the cluster"
  type        = string
}

## =======================================
# Helm - Demo App - Variables
#=====================================

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

variable "clustertype" {
  description = "Type of the Kubernetes cluster"
  type        = string
  default     = ""

  validation {
    condition     = contains(["eks", "aks", "gke"], var.clustertype)
    error_message = "Valid values for cluster type are eks, aks or gke."
  }
}

variable "create_namespace" {
  type        = bool
  default     = true
  description = "Create namespace if it does not exist. By default the value is false"
}

### Extra variables
variable "namespaces" {
  description = "The namespaces to create within Kubernetes"
  type        = set(string)
  default     = []
}
