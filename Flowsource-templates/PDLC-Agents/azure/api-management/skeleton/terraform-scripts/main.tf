data "azurerm_container_app" "pdlc_container_app" {
    name                = var.container_app_name
    resource_group_name = var.resource_group_name
}

data "azurerm_subnet" "pdlc_subnet" {
    name                 = var.subnet
    virtual_network_name = var.vnet
    resource_group_name  = var.resource_group_name
}

resource "azurerm_api_management" "apim" {
    name                = var.apim_name
    location            = var.rg_location
    resource_group_name = var.resource_group_name
    publisher_name      = var.publisher_name
    publisher_email     = var.publisher_email
    sku_name            = var.sku_name
    virtual_network_type = "External"

    virtual_network_configuration {
        subnet_id = data.azurerm_subnet.pdlc_subnet.id
    }
}

resource "azurerm_api_management_api" "pdlc_api" {
    name                = var.api_name
    resource_group_name = var.resource_group_name
    api_management_name = azurerm_api_management.apim.name
    revision            = "1"
    display_name        = var.api_name
    protocols           = ["https"]
    service_url         = "https://${data.azurerm_container_app.pdlc_container_app.ingress[0].fqdn}"
	subscription_required = false
}

resource "azurerm_api_management_api_operation" "pdlc_api_post_operation" {
    operation_id        = "${var.api_name}-POST"
    api_name            = azurerm_api_management_api.pdlc_api.name
    api_management_name = azurerm_api_management.apim.name
    resource_group_name = var.resource_group_name
    display_name        = "${var.api_name}-POST"
    method              = "POST"
    url_template        = "/*"
    description         = "This is POST operation"

    depends_on = [azurerm_api_management_api.pdlc_api]
}

resource "azurerm_api_management_api_operation" "pdlc_api_options_operation" {
    operation_id        = "${var.api_name}-OPTIONS"
    api_name            = azurerm_api_management_api.pdlc_api.name
    api_management_name = azurerm_api_management.apim.name
    resource_group_name = var.resource_group_name
    display_name        = "${var.api_name}-OPTIONS"
    method              = "OPTIONS"
    url_template        = "/*"
    description         = "This is OPTIONS operation"

    depends_on = [azurerm_api_management_api.pdlc_api]
}
