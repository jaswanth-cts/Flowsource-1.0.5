subscription_id		  = "${{values.subscriptionId}}"

resource_group_name   = "${{values.resourceGroupName}}"
rg_location           = "${{values.resourceGroupLocation}}"
cosmosdb_cluster_name = "${{values.cosmosdbClusterName}}"
vnet_name             = "${{values.vnetName}}"
subnet_name           = "${{values.subnetName}}"
managed_identity      = "${{values.managedIdentity}}"
pwd                   = "${{values.pwd}}"