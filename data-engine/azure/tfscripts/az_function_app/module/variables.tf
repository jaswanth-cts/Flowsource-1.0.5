

variable "location"{
  type =string

  
}

variable "resource_group_name" {
  type  = string
 
}

variable "service_plan_name" {
  type =string
 
}

variable "storage_acct_name" {

   type =string
 
}

variable "az_fun_name"{
  type = string

}

variable "az_phy_file_zip" {
   type =string
  
}

variable "managed_identity"{
  type = string
}

variable "environment_var" {
  type = map(string)
}

variable "service_plan_name_os_type" {
  type = string
}

variable "subnet_name"{
  type = string
}

variable "vnet_name"{
  type = string
}

variable "app_insight"{
  type = string
}

variable "subnet_fun_name"{
   type = string
}