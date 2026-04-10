locals {
    kubeconfig = {
    host: module.aks.kube_config_block[0].host
    client_certificate: module.aks.kube_config_block[0].client_certificate
    client_key: module.aks.kube_config_block[0].client_key
    cluster_ca_certificate: module.aks.kube_config_block[0].cluster_ca_certificate
  }
}

data "azurerm_user_assigned_identity" "managedidentity-cp" {
  count = var.user_managed_identity_cp != "" ?  1 : 0
  resource_group_name = var.rg_name
  name = var.user_managed_identity_cp
}

data "azurerm_user_assigned_identity" "managedidentity-kubelet" {
  count = var.user_managed_identity_kubelet != "" ?  1 : 0
  resource_group_name = var.rg_name
  name = var.user_managed_identity_kubelet
}

#Use existingSubnet within existing VNET
data "azurerm_virtual_network" "vnet" {
  name = var.vnet
  resource_group_name  = var.rg_name
}

data "azurerm_subnet" "aks-subnet" {
  name                 = var.aks-subnet
  virtual_network_name = var.vnet
  resource_group_name  = var.rg_name
}

data "azurerm_subnet" "db-subnet" {
  name                 = var.db-subnet
  virtual_network_name = var.vnet
  resource_group_name  = var.rg_name
}

module "aks" {
  source                        = "./modules/aks"
  rg_name                       = var.rg_name
  rg_location                   = var.rg_location
  cluster_name                  = var.cluster_name
  cluster_version               = var.cluster_version
  node_vm_size                  = var.node_vm_size
  node_vm_type                  = var.node_vm_type
  private_cluster_enabled       = var.private_cluster_enabled
  min_count                     = var.min_count
  max_count                     = var.max_count
  aks-subnet-id                 = data.azurerm_subnet.aks-subnet.id
  agic_enable_flag              = var.agic_enable_flag
  agic_appgw_id                 = var.agic_enable_flag ? var.agic_appgw_id : null
  user_managed_identity_cp      = var.user_managed_identity_cp != "" ? data.azurerm_user_assigned_identity.managedidentity-cp[0].id : null
  user_managed_identity_kubelet = var.user_managed_identity_kubelet != "" ?  {
    client_id: data.azurerm_user_assigned_identity.managedidentity-kubelet[0].client_id
    principal_id: data.azurerm_user_assigned_identity.managedidentity-kubelet[0].principal_id
    id: data.azurerm_user_assigned_identity.managedidentity-kubelet[0].id
  } : null
}

module "datadog" {
  source          = "./modules/datadog"
  cluster_name    = var.cluster_name
  api_key         = var.datadog_api_key
  app_key = var.datadog_app_key
  datadog_site    = var.datadog_site

  kubeconfig      = local.kubeconfig
}

#Uncomment to integrate cloudability
#module "cloudability" {
#  source                = "./modules/cloudability"
#  cluster_name          = var.cluster_name
#  metrics_agent_apiKey  = var.cloudability_metrics_agent_apiKey

#   kubeconfig           = local.kubeconfig
#}

module "azure-postgresql" {
  source                                = "./modules/azure-postgresql"
  count                                 = var.database_enable ? 1 : 0
  rg_name                               = var.rg_name
  rg_location                           = var.rg_location
  vnet-id                               = data.azurerm_virtual_network.vnet.id
  db-subnet-id                          = data.azurerm_subnet.db-subnet.id
  database_server_name                  = var.database_server_name
  database_name                         = var.database_name
  database_sku                          = var.database_sku
  database_storage_mb                   = var.database_storage_mb
  database_version                      = var.database_version
  database_user                         = var.database_user
  database_password                     = var.database_password
  database_backup_retention_days        = var.database_backup_retention_days
  database_geo_redundant_backup_enabled = var. database_geo_redundant_backup_enabled
  database_maintenance_window           = var.database_maintenance_window
  database_ha_option                    = var.database_ha_option
  database_zone                         = var.database_zone
}