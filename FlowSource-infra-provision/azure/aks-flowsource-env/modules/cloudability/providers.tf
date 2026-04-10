terraform {
}

provider "kubernetes" {
    host = var.kubeconfig.host

    client_certificate     = base64decode(var.kubeconfig.client_certificate)
    client_key             = base64decode(var.kubeconfig.client_key)
    cluster_ca_certificate = base64decode(var.kubeconfig.cluster_ca_certificate)
}


provider "helm" {
  kubernetes {
    host = var.kubeconfig.host

    client_certificate     = base64decode(var.kubeconfig.client_certificate)
    client_key             = base64decode(var.kubeconfig.client_key)
    cluster_ca_certificate = base64decode(var.kubeconfig.cluster_ca_certificate)
  }
}