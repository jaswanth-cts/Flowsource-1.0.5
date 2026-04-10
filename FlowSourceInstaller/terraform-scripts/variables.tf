variable "region" {
  description = "Region in case of AWS or GCP Cluster"
  default = ""
  type = string
}

variable "project_id" {
  description = "Project Id in case of GCP Cluster"
  default = ""
  type = string
}

variable "subscription_id" {
  description = "Azure Kubernetes Service Cluster subscription id"
  sensitive = true
  default = ""
}
variable "tenant_id" {
  description = "Azure Kubernetes Service Cluster tenant id"
  sensitive = true
  default = ""
}

variable "client_id" {
  description = "Azure Kubernetes Service Cluster client id"
  sensitive = true
  default = ""
}

variable "client_secret" {
  description = "Azure Kubernetes Service Cluster client secret"
  sensitive = true
  default = ""
}

variable "rg_name" {
    description = "The resource group name"
    type = string
    default = ""
}

variable "rg_location" {
    description = "The location to be used"
    type = string
    default = ""
}

variable "cluster_name" {
  description = "Cluster Name"
  type        = string
}

variable "chart" {
    description = "Location of the helm chart"
    type = string
}

variable "chartversion" {
    description = "Version of the chart to deploy. If not specified latest version will be used"
    type = string
    default = ""
}

variable "chartrepository" {
    description = "The repository for the chart"
    type = string
    default = ""
}

variable "values-files" {
    description = "List of Fully qualified values files"
    type = list
}

variable "namespace" {
    description = "Namespace for installation"
    type = string
    default = "flowsource"
}

variable "deploymentname" {
    description = "Name of the deployment"
    type = string
}

variable "clustertype" {
  description = "Type of the Kubernetes cluster"
  type = string
  default = ""

  validation {
    condition = contains (["eks","aks", "gke"], var.clustertype)
    error_message = "Valid values for clustertype are gke, eks and aks"
  }
}

variable "create_namespace" {
    type = bool
    default = false
    description = "Create namespace if it does not exist. By default the value is false"
}

variable "timeout" {
    type = number
    default = 120
    description = "The timeout for the helm install"
}