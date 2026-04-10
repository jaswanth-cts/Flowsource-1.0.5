variable "resource_group_name" {
    type        = string
    description = "Specifies the name of the resource group the Storage Account is located in."
}

variable "rg_location" {
    type        = string
    description = "Specifies the supported Azure location where the resource exists"
}

variable "managed_identity" {
    description = "The name of the User Assigned Identity."
    type = string
}

variable "cosmosdb_cluster_name" {
  type        = string
  description = "The name which should be used for this Azure Cosmos DB for PostgreSQL Cluster"
}

variable "vnet_name" {
  type        = string
  description = "Specifies the name of the Virtual Networ"
}

variable "subnet_name"{
    type = string
    description = "Specifies the name of the Subnet."
}

variable "pwd" {
    description = "The password of the administrator login"
    type = string
}

variable "subscription_id" {
  type = string
}

variable "sql_version" {
  type = string
  description = "The major PostgreSQL version on the Azure Cosmos DB for PostgreSQL cluster. Possible values are 11, 12, 13, 14, 15 and 16"
  default = "16"
}

variable "citus_version" {
  type = string
  description = "The citus extension version on the Azure Cosmos DB for PostgreSQL Cluster. Possible values are 8.3, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 10.0, 10.1, 10.2, 11.0, 11.1, 11.2, 11.3 and 12.1"
  default = "12.1"
}
