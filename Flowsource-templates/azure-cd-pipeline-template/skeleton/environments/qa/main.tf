provider "azurerm" {
  features {}
  subscription_id     = var.subscription_id != "" ? var.subscription_id : null
  client_id           = var.client_id != "" ? var.client_id : null
  tenant_id           = var.tenant_id != "" ? var.tenant_id : null
  client_secret       = var.client_secret != "" ? var.client_secret : null
}

provider "helm" {
  kubernetes {
    host                   = data.azurerm_kubernetes_cluster.aks-cluster.kube_config[0].host
	  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.aks-cluster.kube_config[0].client_certificate)
    client_key             = base64decode(data.azurerm_kubernetes_cluster.aks-cluster.kube_config[0].client_key)
    cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.aks-cluster.kube_config[0].cluster_ca_certificate)
  }
}

provider "kubernetes" {
}

data "azurerm_kubernetes_cluster" "aks-cluster" {
    name                =  "${var.cluster_name}"
    resource_group_name =  "${var.rg_name}"
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


