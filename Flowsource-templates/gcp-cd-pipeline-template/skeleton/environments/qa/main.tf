terraform {
  required_version = "~> 1.3"
}

data "google_container_cluster" "gke_cluster" {
  name     = var.gke_cluster_name
  location = var.region
  project  = var.project_id
}

data "google_client_config" "current" {
}

locals {
  kubeconfig = {
    cluster_ca_certificate = data.google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate
    host                   = "https://${data.google_container_cluster.gke_cluster.endpoint}"
    token                  = data.google_client_config.current.access_token
  }
}

provider "google" {
  region  = var.region
  project = var.project_id
}

provider "kubernetes" {
}

# Use existing Subnet within existing VPC
data "google_compute_network" "existing-vpc" {
  name    = var.network_name
  project = var.project_id
}

module "helm" {
  source = "../../modules/helm-install"

  project_id       = var.project_id
  gke_cluster_name = var.gke_cluster_name
  chart            = var.chart
  deploymentname   = var.deploymentname
  chartversion     = var.chartversion
  chartrepository  = var.chartrepository
  values-files     = var.values-files
  namespace        = var.namespace

  kubeconfig = local.kubeconfig

  clustertype      = var.clustertype
  create_namespace = var.create_namespace
}

output "status" {
  value = module.helm.status
}

output "chart_details" {
  value = module.helm.chart_details
}
