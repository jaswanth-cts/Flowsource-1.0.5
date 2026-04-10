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
    default = []
}

variable "namespace" {
    description = "Namespace for installation"
    type = string
}

variable "deploymentname" {
    description = "Name of the deployment"
    type = string
}

variable "create_namespace" {
  type        = bool
  default     = true
  description = "Create namespace if it does not exist. By default the value is false"
}