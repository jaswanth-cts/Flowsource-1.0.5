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

variable "node_vm_size" {
  description = "The type of VM for the Node Pool"
  type = string
  default = "Standard_D2_v2"
}

variable "min_count" {
  description = "The minimum number of nodes for the Node Pool"
  type = number
  default = 1
}

variable "max_count" {
  description = "The maximum number of nodes for the Node Pool"
  type = number
  default = 5
}

variable "agic_enable_flag" {
  description = "Set to false if agic ingress controller should not be setup"
  type = bool
  default = true
}

variable "agic_appgw_id" {
  description = "The id of the application gateway that agic has to be associated with. This field is mandatory if agic_enabled_flag is true"
  type = string
  default = ""
}

 variable "user_managed_identity_cp" {
  description = "The name for the user managed identity for control plane. If not specified SystemAssigned Identity will be used"
  type = string
  default = ""
 }

  variable "user_managed_identity_kubelet" {
  description = "The name for the user managed identity for kubelet. If not specified a new user managed identity will be created"
  type = string
  default = ""
 }

variable "vnet" {
  description = "The VNET for the Cluster"
  type = string
}

variable "aks-subnet" {
  description = "The subnet for the Cluster"
  type = string
}

variable "rg_location" {
    description = "The location to be used"
    type = string
}

variable "cluster_version" {
  description = "The location to be used"
  type    = string
  default = 1.29
}

variable "node_vm_type" {
  description = "(Optional) Specifies the OS SKU used by the agent pool. Possible values are AzureLinux, Ubuntu, Windows2019 and Windows2022. If not specified, the default is Ubuntu"
  type = string
  default = "Ubuntu"
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