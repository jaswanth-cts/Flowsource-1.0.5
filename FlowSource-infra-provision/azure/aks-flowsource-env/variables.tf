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

variable "private_cluster_enabled" {
description = "Flag to determine if the API server should be exposed to only internal IP addresses"
type = bool
default = false
}

variable "db-subnet" {
  description = "The subnet for the Postgres Database"
  type = string
}

variable "database_enable" {
  description = "Flag to enable external database"
  type = bool
  default = true
}

variable "database_server_name" {
  description = "Name of the postgres database server"
  type = string
  default = ""
}

variable "database_name" {
  description = "Name of the  database instance"
  type = string
  default = "exampledb"
}

variable "database_sku" {
  description = "The SKU for the postgres database"
  type = string
  default = "B_Standard_B1ms"
}

variable "database_storage_mb" {
  description = "The Amount of DB Storage in MB"
  type = number
  default = 32768
}

variable "database_user" {
  description = "Database admin user"
  type = string
}

variable "database_password" {
  description = "Database admin user password"
  type = string
  sensitive = true
}

variable "database_version" {
  description = "The Postgres Version"
  type = number
  default = 13
}

variable "database_backup_retention_days" {
  description = "The backup retention days for the PostgreSQL Flexible Server. Possible values are between 7 and 35 days"
  type = number
  default = 7
}

variable "database_geo_redundant_backup_enabled" {
  description = "The backup retention days for the PostgreSQL Flexible Server. Possible values are between 7 and 35 days"
  type = bool
  default = false
}

variable "database_zone" {
  description = "The availability zone in which the database server should be located. If not specified Azure will automatically assign one"
  type = string
  default = null
}

variable "database_maintenance_window" {
  default = {}
  type = object({
    day_of_week = optional(number)
    start_hour = optional(number)
    start_minute = optional(number)
  })
  description = <<EOT
    Maintenance window Configuration
    day_of_week: (Optional) The day of week for maintenance window, where the week starts on a Sunday, i.e. Sunday = 0, Monday = 1. Defaults to 0
    start_hour: (Optional) The start hour for maintenance window. Defaults to 0
    start_minute: (Optional) The start minute for maintenance window. Defaults to 0
  EOT
}

variable "database_ha_option" {
    default = null
    type = object({
      mode = string
      standby_availability_zone = optional(string)
    }) 
    description = <<EOT
      HA Configuration
      mode: (Required) The high availability mode for the PostgreSQL Flexible Server. Possible value are SameZone or ZoneRedundant
      standby_availability_zone: (Optional) Specifies the Availability Zone in which the standby Flexible Server should be located
    EOT
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

variable "cloudability_metrics_agent_apiKey" {
  description = "Cloudability API Key"
  sensitive = true
  default = ""
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

