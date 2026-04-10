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
    coordinator_public_ip_access_enabled = false
    coordinator_storage_quota_in_mb    = 131072
    coordinator_vcore_count            = 2
    node_count                         = 0
    sql_version                        = var.sql_version
    citus_version                      = var.citus_version
    shards_on_coordinator_enabled      = true
}

resource "azurerm_cosmosdb_postgresql_coordinator_configuration" "coordinate_config" {
	name       =  "array_nulls"
	cluster_id = azurerm_cosmosdb_postgresql_cluster.cosmosdb_cluster.id
	value      = "on"
}

resource "azurerm_private_dns_zone" "dns" {
	name                = "privatelink.postgres.cosmos.azure.com"
	resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "vnet-dnszone" {
	name                  = "${var.cosmosdb_cluster_name}-vnetlink"
	resource_group_name   = var.resource_group_name
	private_dns_zone_name = azurerm_private_dns_zone.dns.name
	virtual_network_id    = data.azurerm_virtual_network.vnet.id
}

resource "azurerm_private_endpoint" "endpoint" {
	name                = "${var.cosmosdb_cluster_name}-pvt-endpoint"
	location            = var.rg_location
	resource_group_name = var.resource_group_name
	subnet_id           = data.azurerm_subnet.subnet.id

	private_service_connection {
		name                           ="${var.cosmosdb_cluster_name}-pvt-connection"
		private_connection_resource_id = azurerm_cosmosdb_postgresql_cluster.cosmosdb_cluster.id
		subresource_names              = ["coordinator"]
		is_manual_connection           = false
	}
	
	private_dns_zone_group {
		name                = "default"
		private_dns_zone_ids = [azurerm_private_dns_zone.dns.id]
  }
}