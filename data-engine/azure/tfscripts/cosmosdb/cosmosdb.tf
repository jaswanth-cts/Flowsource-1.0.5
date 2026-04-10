data "azurerm_resource_group" "resource_group" {
  name     = var.resource_group_name
}

data  "azurerm_subnet" "subnet" {
  name                 = var.subnet_name
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
}

data "azurerm_virtual_network" "vnet"{
    name                 = var.vnet_name
    resource_group_name  = var.resource_group_name
}

resource "azurerm_cosmosdb_postgresql_cluster" "cosmosdb_cluster" {
    name                               = var.cosmosdb_cluster_name
    resource_group_name                = data.azurerm_resource_group.resource_group.name
    location                           = data.azurerm_resource_group.resource_group.location
    preferred_primary_zone             = null
    administrator_login_password       = var.pwd
    coordinator_public_ip_access_enabled = true
    coordinator_storage_quota_in_mb    = 131072
    coordinator_vcore_count            = 2
    node_count                         = 0
    sql_version                        = 16
    citus_version                      = 12.1
    shards_on_coordinator_enabled      = true
  }

resource "azurerm_cosmosdb_postgresql_coordinator_configuration" "coordinate_config" {
  name       =  "array_nulls"
  cluster_id = azurerm_cosmosdb_postgresql_cluster.cosmosdb_cluster.id
  value      = "on"
}