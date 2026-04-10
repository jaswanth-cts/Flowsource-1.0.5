variable "subscription_id" {
  type = string
}

variable "resource_group_name" {
  type        = string
  description = "Specifies the name of the resource group the Storage Account is located in."
}

variable "rg_location" {
  type        = string
  description = "Specifies the supported Azure location where the resource exists"
}

variable "vnet" {
  description = "Specifies the name of the Virtual Network  "
  type        = string
}

variable "subnet" {
  type        = string
  description = "Specifies the name of the Subnet."
}

variable "pvt_link_subnet" {
  type        = string
  description = "Specifies the name of the Subnet for private link."
}

variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "workload_profile_type" {
  description = "Workload profile type for the workloads to run on. Possible values include Consumption, D4, D8, D16, D32, E4, E8, E16 and E32"
  type        = string
}

variable "workload_profile_minimum_count" {
  description = "The minimum number of instances of workload profile that can be deployed in the Container App Environment"
  type        = number
}

variable "workload_profile_maximum_count" {
  description = "The maximum number of instances of workload profile that can be deployed in the Container App Environment"
  type        = number
}

variable "user_managed_identity"{
  description = "The name of the User Assigned Identity."
  type = string
}

variable "container_registry"{
  description = "The hostname for the Container Registry"
  type = string
}

variable "container_app"{
   type = map(object({
            container_app_name   = string
            container_image         = string
            container_cpu = string
            container_memory = string
            container_min_replicas = number
            container_max_replicas = number
            container_target_port = number
            environment_var   = list(object({
                                name  = string
                                value = string
                                }))
        }))
}
