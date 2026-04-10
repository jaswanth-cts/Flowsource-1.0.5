variable "region" {
  default = "us-east-1"
}

variable "cluster-name" {
  description = "Name of the EKS Cluster"
  type    = string
}

variable "csi-drivers-values-file" {
  description = "Values file for csi-driver"
  type = string
  default = "csi-driver-values.yaml"
}

variable "alb-controller-values-file" {
  description = "Values file for AWS ALB controller"
  type = string
  default = "alb-controller-values.yaml"
}

variable "cloudability_metrics_agent_apiKey" {
  description = "Cloudability API Key"
  sensitive = true
  default = ""
}

variable "datadog_api_key" {
  description = "API Key for integration with datadog"
  sensitive = true
  default = ""
}

variable "datadog_app_key" {
  description = "App Key for integration with datadog"
  sensitive = true
  default = ""
}

variable "datadog_site" {
  description = "The Datadog site parameter"
  type = string
  default = "us3.datadoghq.com"
}

