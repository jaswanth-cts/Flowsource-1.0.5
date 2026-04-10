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
}

variable "cluster_name" {
  description = "AKS Cluster Name"
  type        = string
}

variable "create_namespace" {
  type        = bool
  default     = true
  description = "Create namespace if it does not exist. By default the value is false"
}

variable "helm_deployments" {
    type = map(object({
      chart             = string
      chartversion      = optional(string)
      chartrepository   = optional(string)
      namespace         = string
      values-files      = list(string)
    }))

    description = <<EOT
      Details of the Helm deployments
      The confgiguration for each Helm deployment is provided as a map where the Ket of the map is the deployment name
      key: {
        chart           : Location of the helm chart
        chartversion    : (Optional) Version of the chart to deploy. If not specified latest version will be used
        chartrepository : The repository for the chart
        namespace       : Namespace for installation
        values-files    : List of Fully qualified values files
      }
    EOT
    default = {}
}