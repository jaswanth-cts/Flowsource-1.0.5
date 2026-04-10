terraform {
  required_version = "~> 1.3"
}

provider "helm" {
  kubernetes {
    host = var.kubeconfig.host

    client_certificate     = var.kubeconfig.client_certificate != null ? base64decode(var.kubeconfig.client_certificate) : null
    client_key             = var.kubeconfig.client_key != null ? base64decode(var.kubeconfig.client_key) : null
    cluster_ca_certificate = base64decode(var.kubeconfig.cluster_ca_certificate)
    token                  = var.clustertype == "eks" ? var.kubeconfig.token : null
  }
}
