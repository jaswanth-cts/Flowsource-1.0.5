module "azfunction" {

      source ="./module"
      service_plan_name   = var.service_plan_name
      resource_group_name = var.resource_group_name
      location            = var.location
      service_plan_name_os_type = var.service_plan_name_os_type
      vnet_name           = var.vnet_name
      subnet_name         = var.subnet_name
      subnet_fun_name     = var.subnet_fun_name
      
  for_each = var.az_func_asset
      storage_acct_name   = var.storage_acct_name
      az_fun_name         = each.value.az_fun_name
      az_phy_file_zip     = each.value.az_phy_file_zip
      app_insight         = each.value.app_insight  
      managed_identity    = var.managed_identity
      environment_var     = each.value.environment_var 


}

