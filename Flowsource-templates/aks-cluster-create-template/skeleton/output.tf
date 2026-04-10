output "client_certificate" {
  value     = module.aks.client_certificate
  sensitive = true
}

output "kube_config" {
  value = module.aks.kube_config

  sensitive = true
}

output "kube_config_block" {
  value = module.aks.kube_config_block
}

output "kubelet_identity" {
  value = module.aks.kubelet_identity
}

output "identity" {
  value = module.aks.identity
}
