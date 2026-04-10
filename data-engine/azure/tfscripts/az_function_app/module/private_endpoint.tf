data  "azurerm_subnet" "subnet_pvt" {
  name                 = var.subnet_name
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
}


resource "azurerm_private_endpoint" "func_endpoint" {
  depends_on          = [azurerm_linux_function_app.linux_func]
  count               = length(azurerm_linux_function_app.linux_func)  
  name                = "${var.az_fun_name}-func_endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = data.azurerm_subnet.subnet_pvt.id

  private_service_connection {
    name                           = "${var.az_fun_name}-pvt_conn"
    private_connection_resource_id = azurerm_linux_function_app.linux_func[count.index].id
    is_manual_connection           = false
    subresource_names              = ["sites"]
  }
    private_dns_zone_group {
    name                 = "exam${var.az_fun_name}-dns-zone-group"
    private_dns_zone_ids = [azurerm_private_dns_zone.dns_zone.id]
  }

}

resource "azurerm_private_dns_zone" "dns_zone" {
  name                = "${var.az_fun_name}-pvt-link.azurewebsites.net"
  resource_group_name =  var.resource_group_name
}




resource "azurerm_private_dns_zone_virtual_network_link" "pvt_vnet_link" {
  name                  = "${var.az_fun_name}-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.dns_zone.name
  virtual_network_id    = data.azurerm_virtual_network.vnet.id
}
