subscription_id		= "${{values.subscriptionId}}"

resource_group_name = "${{values.resourceGroupName}}"
rg_location         = "${{values.resourceGroupLocation}}"

apim_name           = "${{values.apimName}}"
publisher_name      = "${{values.publisherName}}"
publisher_email     = "${{values.publisherEmail}}"
sku_name            = "${{values.skuName}}"
api_name            = "${{values.apiName}}"
container_app_name  = "${{values.containerAppName}}"
vnet                = "Vnet-PDLC-Terraform"
subnet              = "subnet-apim-pdlc-terraform" 