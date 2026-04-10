terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
      version = "2.16.1"
    }
  }
}

provider "helm" {
  kubernetes {
    host = var.kubeconfig.host

    client_certificate     = var.clustertype == "aks" ? base64decode(var.kubeconfig.client_certificate) : null
    client_key             = var.clustertype == "aks" ? base64decode(var.kubeconfig.client_key) : null
    cluster_ca_certificate = base64decode(var.kubeconfig.cluster_ca_certificate)
    token                  = var.clustertype != "aks" ? var.kubeconfig.token : null
  }
}
