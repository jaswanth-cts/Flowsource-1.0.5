terraform {
  required_version = "~> 1.3"

  required_providers {
    azuredevops = {
      source = "microsoft/azuredevops"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "azuredevops" {
  org_service_url     = var.org_service_url
}