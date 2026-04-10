variable "rg_name" {
    description = "The resource group name"
    type = string
}

variable "rg_location" {
    description = "The location to be used"
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

variable "aks-subnet-id" {
  description = "The subnet-id for the Cluster"
  type = string
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
  description = "The id for the user managed identity for control plane. If not specified SystemAssigned Identity will be used"
  type = string
  default = ""
}

variable "user_managed_identity_kubelet" {
  description = "The client id, principal id and id for the user managed identity for kubelet. If not specified a new user managed identity will be created"
  type = object({
    client_id  = string # required attribute
    principal_id = string # required attribute
    id = string # required attribute
  })
}

variable "cluster_version" {
  type    = string
  default = "1.31"
}

variable "node_vm_type" {
  description = "(Optional) Specifies the OS SKU used by the agent pool. Possible values are AzureLinux, Ubuntu, Windows2019 and Windows2022. If not specified, the default is Ubuntu"
  type = string
  default = "Ubuntu"
}