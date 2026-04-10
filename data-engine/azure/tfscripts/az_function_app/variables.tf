variable "location"{
  type =string

  
}

variable "service_plan_name" {
  type=string

}

variable "service_plan_name_os_type" {
  type=string

}

variable "resource_group_name" {
  type  = string
  
}

variable "storage_acct_name" {

   type =string
  
}

 variable "az_func_asset"{
   type = map(object({
         
         az_fun_name       = string
         az_phy_file_zip   = string
         app_insight       = string
         environment_var   = map(string)
   
   })
   )
 }
   
 variable "managed_identity"{
  type = string

}

variable "subnet_name"{
  type = string
}

variable "vnet_name"{
  type = string
}

variable "subnet_fun_name" {
  type = string
}
