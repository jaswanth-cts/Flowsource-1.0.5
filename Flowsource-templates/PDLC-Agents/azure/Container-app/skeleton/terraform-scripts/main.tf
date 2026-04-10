data "azurerm_virtual_network" "pdlc_vnet"{
    name                 = var.vnet
    resource_group_name  = var.resource_group_name
}

data "azurerm_subnet" "pdlc_subnet" {
  name                 = var.subnet
  virtual_network_name = var.vnet
  resource_group_name  = var.resource_group_name
}

data "azurerm_subnet" "pdlc_pvt_link_subnet" {
  name                 = var.pvt_link_subnet
  virtual_network_name = var.vnet
  resource_group_name  = var.resource_group_name
}


resource "azurerm_log_analytics_workspace" "pdlc_law" {
  name                = "${var.app_name}-law"
  resource_group_name = var.resource_group_name
  location            = var.rg_location
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "pdlc_env" {
  name                       = "${var.app_name}-env"
  resource_group_name        = var.resource_group_name
  location                   = var.rg_location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.pdlc_law.id
  infrastructure_subnet_id   = data.azurerm_subnet.pdlc_subnet.id
  internal_load_balancer_enabled = true
  
  workload_profile {
    name                  = var.app_name
    workload_profile_type = var.workload_profile_type
    maximum_count         = var.workload_profile_maximum_count
    minimum_count         = var.workload_profile_minimum_count 
  }
}

resource "azurerm_private_dns_zone" "dns" {
	name                = "privatelink.eastus.azurecontainerapps.io"
	resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "vnet-dnszone" {
	name                  = "${var.app_name}-env-vnetlink"
	resource_group_name   = var.resource_group_name
	private_dns_zone_name = azurerm_private_dns_zone.dns.name
	virtual_network_id    = data.azurerm_virtual_network.pdlc_vnet.id
}

resource "azurerm_private_endpoint" "endpoint" {
	name                = "${var.app_name}-env-pvt-endpoint"
	location            = var.rg_location
	resource_group_name = var.resource_group_name
	subnet_id           = data.azurerm_subnet.pdlc_pvt_link_subnet.id

	private_service_connection {
		name                           ="${var.app_name}-env-pvt-connection"
		private_connection_resource_id = azurerm_container_app_environment.pdlc_env.id
		subresource_names              = ["managedEnvironments"]
		is_manual_connection           = false
	}

	private_dns_zone_group {
		name                = "default"
		private_dns_zone_ids = [azurerm_private_dns_zone.dns.id]
	}
}

resource "time_sleep" "wait_10_seconds" {
	depends_on = [azurerm_private_endpoint.endpoint]

	create_duration = "10s"
}

module "container-app" {

    source ="./module"
    resource_group_name          = var.resource_group_name
    container_app_environment_id = azurerm_container_app_environment.pdlc_env.id
    workload_profile_name        = var.app_name
    user_managed_identity        = var.user_managed_identity
    container_registry           = var.container_registry

    for_each = var.container_app
        container_app_name = each.value.container_app_name
        container_image       = each.value.container_image
        container_cpu = each.value.container_cpu
        container_memory = each.value.container_memory
        container_min_replicas = each.value.container_min_replicas
        container_max_replicas = each.value.container_max_replicas
        container_target_port = each.value.container_target_port
        environment_var = each.value.environment_var
		
	depends_on = [time_sleep.wait_10_seconds]
}