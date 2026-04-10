variable "rg_name" {
    description = "The resource group name"
    type = string
}

variable "rg_location" {
    description = "The location to be used"
    type = string
}

variable "vnet-id" {
  description = "The VNET id for the database server"
  type = string
}

variable "db-subnet-id" {
  description = "The subnet id for the Postgres Database"
  type = string
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

variable "database_zone" {
  description = "The availability zone in which the database server should be located. If not specified Azure will automatically assign one"
  type = string
  default = null
}