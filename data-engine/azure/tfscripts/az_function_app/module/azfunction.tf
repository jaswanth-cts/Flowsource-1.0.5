data  "azurerm_subnet" "subnet" {
  name                 = var.subnet_fun_name
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
}

data "azurerm_virtual_network" "vnet"{
    name                 = var.vnet_name
    resource_group_name  = var.resource_group_name
}

data "azurerm_service_plan" "service_plan" {
  name                = var.service_plan_name
  resource_group_name = var.resource_group_name
 
}

data "azurerm_user_assigned_identity" "managed_identity" {
  name                = var.managed_identity
  resource_group_name = var.resource_group_name
} 


data "azurerm_storage_account" "storeage_acct" {
  name                = var.storage_acct_name
  resource_group_name = var.resource_group_name
  
}

data  "azurerm_application_insights" "app_insights" {
  name                = var.app_insight
  resource_group_name = var.resource_group_name

}

resource "null_resource" "map_merge" {
   triggers = merge(var.environment_var, {
   APPLICATIONINSIGHTS_CONNECTION_STRING = data.azurerm_application_insights.app_insights.connection_string 
   FUNCTIONS_WORKER_RUNTIME              = "python"
   SCM_DO_BUILD_DURING_DEPLOYMENT        = "true"
  })
}

resource "terraform_data" "function_app_package_md5" {
  input = filesha256(var.az_phy_file_zip)
}

resource "azurerm_linux_function_app" "linux_func" {
  depends_on = [null_resource.map_merge]

  count = var.service_plan_name_os_type == "Linux" ? 1:0
    name                = var.az_fun_name
    location            = var.location
    resource_group_name = var.resource_group_name
    service_plan_id     = data.azurerm_service_plan.service_plan.id
    virtual_network_subnet_id  = data.azurerm_subnet.subnet.id
    storage_account_name       = data.azurerm_storage_account.storeage_acct.name
    storage_account_access_key = data.azurerm_storage_account.storeage_acct.primary_access_key
    
   
    app_settings = null_resource.map_merge.triggers
    

        site_config {
          always_on = true
          application_stack {
            python_version = "3.10"
          
          }
        }
          identity {
          type         = "UserAssigned"
          identity_ids = [data.azurerm_user_assigned_identity.managed_identity.id]
        }
    zip_deploy_file = var.az_phy_file_zip
    public_network_access_enabled = true

     timeouts {
      create  = "2h"
      update  = "2h"
      delete  = "2h"
    }

    lifecycle {
      replace_triggered_by = [terraform_data.function_app_package_md5]
    }
}


resource "azurerm_windows_function_app" "Windows_func" {
  count = var.service_plan_name_os_type == "Windows" ? 1:0
    name                = var.az_fun_name
   location            = var.location
    resource_group_name = var.resource_group_name
    service_plan_id     = data.azurerm_service_plan.service_plan.id

    storage_account_name       = data.azurerm_storage_account.storeage_acct.name
    storage_account_access_key = data.azurerm_storage_account.storeage_acct.primary_access_key

    app_settings = null_resource.map_merge.triggers

        site_config {
          
        }
        identity {
          type         = "UserAssigned"
          identity_ids = [data.azurerm_user_assigned_identity.managed_identity.id]
        }

    zip_deploy_file = var.az_phy_file_zip
}
