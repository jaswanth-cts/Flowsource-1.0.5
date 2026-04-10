output "client_certificate" {
  value     = azurerm_kubernetes_cluster.aks-cluster.kube_config[0].client_certificate
  sensitive = true
}

output "kube_config" {
  value = azurerm_kubernetes_cluster.aks-cluster.kube_config_raw

  sensitive = true
}

output "kube_config_block" {
  value = nonsensitive(azurerm_kubernetes_cluster.aks-cluster.kube_config)
}

output "kubelet_identity" {
  value = azurerm_kubernetes_cluster.aks-cluster.kubelet_identity
}

output "identity" {
  value = azurerm_kubernetes_cluster.aks-cluster.identity
}