terraform {
    required_version = "~> 1.3"
    backend "azurerm" {
      resource_group_name  = "${{values.resourceGroupName}}"
      storage_account_name = "${{values.storageAccountName}}"
      container_name       = "${{values.prodContainerName}}"
      key                  = "${{values.appName}}.tfstate"
  }
}