terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.23.0"
    }
  }
}

resource "azurerm_private_dns_zone" "postgres-db-dns" {
  name = "${var.database_server_name}.private.postgres.database.azure.com"
  resource_group_name = var.rg_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres-db-privatelink" {
  name = "${var.database_server_name}-pdzvnetlink.com"
  private_dns_zone_name = azurerm_private_dns_zone.postgres-db-dns.name
  virtual_network_id = var.vnet-id
  resource_group_name = var.rg_name
}

resource "azurerm_postgresql_flexible_server" "postgres-db" {
  name = "${var.database_server_name}"
  resource_group_name = var.rg_name
  location = var.rg_location
  version = "${var.database_version}"
  administrator_login = "${var.database_user}"
  administrator_password = "${var.database_password}"
  sku_name = "${var.database_sku}"
  storage_mb = var.database_storage_mb
  delegated_subnet_id = var.db-subnet-id
  private_dns_zone_id = azurerm_private_dns_zone.postgres-db-dns.id
  public_network_access_enabled = false
  backup_retention_days = var.database_backup_retention_days
  geo_redundant_backup_enabled = var.database_geo_redundant_backup_enabled
  zone = var.database_zone

  dynamic "maintenance_window" {
      for_each = var.database_maintenance_window != null ? [var.database_maintenance_window] : []
      content {
        day_of_week = maintenance_window.value.day_of_week
        start_hour = maintenance_window.value.start_hour
        start_minute = maintenance_window.value.start_minute
      }
  }

  dynamic "high_availability" {
    for_each = var.database_ha_option != null ? [var.database_ha_option] : []
    content {
      mode = high_availability.value.mode
      standby_availability_zone = high_availability.value.standby_availability_zone
    }
  }

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres-db-privatelink]
  
  lifecycle {
    # prevent the possibility of accidental data loss
    prevent_destroy = true
    ignore_changes = [zone, high_availability[0].standby_availability_zone]    
  }
}

resource "azurerm_postgresql_flexible_server_database" "postgres-db" {
  name      = "${var.database_name}"
  server_id = azurerm_postgresql_flexible_server.postgres-db.id
  collation = "en_US.utf8"
  charset   = "utf8"

  # prevent the possibility of accidental data loss
  lifecycle {
    prevent_destroy = true
  }
}