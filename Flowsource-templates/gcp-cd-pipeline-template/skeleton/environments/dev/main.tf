terraform {
  required_version = "~> 1.3"
}

provider "google" {
  region  = var.region
  project = var.project_id
}

# Use existing Subnet within existing VPC
data "google_compute_network" "existing-vpc" {
  name    = var.network_name
  project = var.project_id
}

module "gke-cluster" {

  source                     = "../../modules/gke"
  project_id                 = var.project_id
  network_name               = data.google_compute_network.existing-vpc.name
  gcp_private_subnet_name    = var.gcp_private_subnet_name
  cluster_zones              = var.cluster_zones
  region                     = var.region
  gke_cluster_name           = var.gke_cluster_name
  gke_cluster_version        = var.gke_cluster_version
  ip_range_pods              = var.ip_range_pods
  ip_range_services          = var.ip_range_services
  master_cidr                = var.master_cidr
  master_authorized_networks = var.master_authorized_networks
  node_pools                 = var.node_pools
  enable_private_nodes       = var.enable_private_nodes
  enable_private_endpoint    = var.enable_private_endpoint
  cluster_resource_labels    = var.cluster_resource_labels
  service_account            = var.service_account
  node_pools_labels          = var.node_pools_labels
  node_pools_metadata        = var.node_pools_metadata
  gar_repo                   = var.gar_repo

}
