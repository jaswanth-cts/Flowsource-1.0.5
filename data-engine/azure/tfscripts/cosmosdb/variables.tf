variable "resource_group_name" {
  type        = string
  
  description = "resource group."
}

variable "rg_location" {
  type        = string
  
  description = "resource slocation."
}

variable "managed_identity" {
  type = string
}

variable "cosmosdb_cluster_name" {
  type        = string
  
  description = "Cluster Name"
}

variable "vnet_name" {
  type        = string
  
  description = "vnet Name"
}

variable "subnet_name"{
    type = string
    description = "Subnet name"
}

variable "pwd" {
  type = string
}