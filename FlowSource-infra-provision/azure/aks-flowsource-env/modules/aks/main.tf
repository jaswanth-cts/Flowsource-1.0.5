terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.23.0"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.36.0"
    }
  }
}

provider "kubernetes" {
  host = azurerm_kubernetes_cluster.aks-cluster.kube_config[0].host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.aks-cluster.kube_config[0].client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.aks-cluster.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks-cluster.kube_config[0].cluster_ca_certificate)
}


data "azurerm_kubernetes_service_versions" "aks_version" {
  location        = var.rg_location
  version_prefix  = var.cluster_version
  include_preview = false
}

resource "azurerm_kubernetes_cluster" "aks-cluster" {
  name                = var.cluster_name
  location            = var.rg_location
  resource_group_name = var.rg_name
  dns_prefix          = var.cluster_name
  kubernetes_version  = data.azurerm_kubernetes_service_versions.aks_version.latest_version
  private_cluster_enabled = var.private_cluster_enabled

  default_node_pool {
    name       = "default"
    vm_size    = var.node_vm_size
	os_sku               = var.node_vm_type
    auto_scaling_enabled = true
    min_count           = var.min_count
    max_count           = var.max_count
    os_disk_size_gb     = 32
    vnet_subnet_id      = var.aks-subnet-id
	orchestrator_version= data.azurerm_kubernetes_service_versions.aks_version.latest_version
  }

  network_profile {
    network_plugin     = "azure"
    network_policy     = "azure"
    dns_service_ip     = "172.16.0.10"
#    docker_bridge_cidr = "172.18.0.1/16"
    service_cidr       = "172.16.0.0/16"
    load_balancer_sku  = "standard"
#    outbound_type      = "userAssignedNATGateway"
#    nat_gateway_profile {
#      idle_timeout_in_minutes = 4
#    }
  }
  
  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }
  
  identity {
    type          = var.user_managed_identity_cp != "" ? "UserAssigned" : "SystemAssigned"
    identity_ids  = var.user_managed_identity_cp != "" ? [var.user_managed_identity_cp] : null
  }
  
  kubelet_identity {
    client_id   =  var.user_managed_identity_kubelet != null ? var.user_managed_identity_kubelet.client_id : null
    object_id   = var.user_managed_identity_kubelet != null ? var.user_managed_identity_kubelet.principal_id : null
    user_assigned_identity_id   = var.user_managed_identity_kubelet != null ? var.user_managed_identity_kubelet.id : null
  }

  dynamic "ingress_application_gateway" {
    for_each = var.agic_enable_flag ? [var.agic_appgw_id] : []
    content {
      gateway_id = ingress_application_gateway.value
    }
  }
}
