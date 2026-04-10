terraform {
  required_version = "~> 1.3"
}

provider "helm" {
  kubernetes {
    host                   = var.kubeconfig.host
    cluster_ca_certificate = base64decode(var.kubeconfig.cluster_ca_certificate)
    token                  = var.kubeconfig.token
  }
}