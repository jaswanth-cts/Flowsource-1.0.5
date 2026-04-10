provider "azurerm" {
  features {}
  subscription_id     = var.subscription_id != "" ? var.subscription_id : null
  client_id           = var.client_id != "" ? var.client_id : null
  tenant_id           = var.tenant_id != "" ? var.tenant_id : null
  client_secret       = var.client_secret != "" ? var.client_secret : null
}

provider "helm" {
  kubernetes {
    host                    = module.aks.kube_config_block[0].host
	client_certificate     = base64decode(module.aks.kube_config_block[0].client_certificate)
    client_key             = base64decode(module.aks.kube_config_block[0].client_key)
    cluster_ca_certificate = base64decode(module.aks.kube_config_block[0].cluster_ca_certificate)
  }
}

provider "kubernetes" {
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

data "azurerm_virtual_network" "vnet" {
  name = var.vnet
  resource_group_name  = var.rg_name
}

data "azurerm_subnet" "aks-subnet" {
  name                 = var.aks-subnet
  virtual_network_name = var.vnet
  resource_group_name  = var.rg_name
}

module "aks" {
  source                        = "../../modules/aks"
  rg_name                       = var.rg_name
  rg_location                   = var.rg_location
  cluster_name                  = var.cluster_name
  cluster_version               = var.cluster_version
  node_vm_size                  = var.node_vm_size
  node_vm_type                  = var.node_vm_type
  min_count                     = var.min_count
  max_count                     = var.max_count
  aks-subnet-id                 = data.azurerm_subnet.aks-subnet.id
  agic_enable_flag              = var.agic_enable_flag
  agic_appgw_id                 = var.agic_appgw_id != "" ? var.agic_appgw_id : null
  user_managed_identity_cp      = var.user_managed_identity_cp != "" ? data.azurerm_user_assigned_identity.managedidentity-cp[0].id : null
  user_managed_identity_kubelet = var.user_managed_identity_kubelet != "" ?  {
    client_id: data.azurerm_user_assigned_identity.managedidentity-kubelet[0].client_id
    principal_id: data.azurerm_user_assigned_identity.managedidentity-kubelet[0].principal_id
    id: data.azurerm_user_assigned_identity.managedidentity-kubelet[0].id
  } : null
}

module "helm" {
  source = "../../modules/helm-install"

  for_each         = var.helm_deployments
  deploymentname   = each.key
  chart            = each.value.chart
  chartversion     = each.value.chartversion
  chartrepository  = each.value.chartrepository
  values-files     = each.value.values-files
  namespace        = each.value.namespace
  create_namespace = var.create_namespace
}