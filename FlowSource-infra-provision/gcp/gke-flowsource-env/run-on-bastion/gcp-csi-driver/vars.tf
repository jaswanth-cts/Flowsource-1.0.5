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

variable "csi_chart" {
  description = "Location of the helm chart"
  type        = string
}

variable "csi_chartversion" {
  description = "Version of the chart to deploy. If not specified latest version will be used"
  type        = string
  default     = ""
}

variable "csi_chartrepository" {
  description = "The repository for the chart"
  type        = string
  default     = ""
}

variable "csi-drivers-values-file" {
  description = "Values file for csi-driver"
  type        = string
  default     = "csi-driver-values.yaml"
}

variable "namespace" {
  description = "Namespace for installation"
  type        = string
}

variable "csi_deploymentname" {
  description = "Name of the deployment"
  type        = string
}

variable "create_namespace" {
  type        = bool
  default     = false
  description = "Create namespace if it does not exist. By default the value is false"
}

variable "gcp_csi_chart" {
  description = "Location of the helm chart"
  type        = string
}

variable "gcp_csi_chartversion" {
  description = "Version of the chart to deploy. If not specified latest version will be used"
  type        = string
  default     = ""
}

variable "gcp_csi_chartrepository" {
  description = "The repository for the chart"
  type        = string
  default     = ""
}

variable "gcp-csi-drivers-values-file" {
  description = "Values file for csi-driver"
  type        = string
  default     = ""
}

variable "gcp_csi_deploymentname" {
  description = "Name of the deployment"
  type        = string
}
