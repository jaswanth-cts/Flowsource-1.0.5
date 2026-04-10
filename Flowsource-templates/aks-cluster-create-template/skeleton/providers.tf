terraform {
  required_version = "~> 1.3"
}

provider "azurerm" {
  features {}
  subscription_id     = var.subscription_id != "" ? var.subscription_id : null
  client_id           = var.client_id != "" ? var.client_id : null
  tenant_id           = var.tenant_id != "" ? var.tenant_id : null
  client_secret       = var.client_secret != "" ? var.client_secret : null
}
