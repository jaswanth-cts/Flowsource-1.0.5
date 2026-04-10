module "gke" {
  source                     = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  version                    = "36.1.0"
  project_id                 = var.project_id
  name                       = var.gke_cluster_name
  regional                   = true
  region                     = var.region
  zones                      = var.cluster_zones
  network                    = var.network_name
  subnetwork                 = var.gcp_private_subnet_name
  ip_range_pods              = var.ip_range_pods
  ip_range_services          = var.ip_range_services
  http_load_balancing        = true
  remove_default_node_pool   = true
  horizontal_pod_autoscaling = true
  network_policy             = false
  filestore_csi_driver       = false
  enable_private_endpoint    = var.enable_private_endpoint
  enable_private_nodes       = var.enable_private_nodes
  master_ipv4_cidr_block     = var.master_cidr
  master_authorized_networks = var.master_authorized_networks
  deletion_protection        = false
  create_service_account     = false
  service_account            = var.service_account
  cluster_resource_labels    = var.cluster_resource_labels
  enable_l4_ilb_subsetting   = true
  grant_registry_access      = true
  kubernetes_version         = var.gke_cluster_version
  release_channel            = var.release_channel

  node_pools = [
    {
      name                      = lookup(var.node_pools, "name")
      machine_type              = lookup(var.node_pools, "machine_type")
      default_max_pods_per_node = lookup(var.node_pools, "default_max_pods_per_node")
      max_node_count            = lookup(var.node_pools, "max_node_count")
      min_node_count            = lookup(var.node_pools, "min_node_count")
      autoscaling               = lookup(var.node_pools, "autoscaling")
      local_ssd_count           = lookup(var.node_pools, "local_ssd_count")
      disk_size_gb              = lookup(var.node_pools, "disk_size_gb")
      disk_type                 = lookup(var.node_pools, "disk_type")
      image_type                = lookup(var.node_pools, "image_type")
      enable_gcfs               = lookup(var.node_pools, "enable_gcfs")
      enable_gvnic              = lookup(var.node_pools, "enable_gvnic")
      logging_variant           = lookup(var.node_pools, "logging_variant")
      auto_repair               = lookup(var.node_pools, "auto_repair")
      auto_upgrade              = var.release_channel == "UNSPECIFIED" ? false : true
      preemptible               = lookup(var.node_pools, "preemptible")
      initial_node_count        = lookup(var.node_pools, "initial_node_count")
      version                   = var.gke_cluster_version
    },
  ]

  node_pools_oauth_scopes = {
    all = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  node_pools_metadata = var.node_pools_metadata
  node_pools_labels   = var.node_pools_labels
}

module "gke_auth" {
  source  = "terraform-google-modules/kubernetes-engine/google//modules/auth"
  version = "36.1.0"

  project_id   = var.project_id
  location     = module.gke.location
  cluster_name = module.gke.name
}

/*
module "kubernetes-engine_workload-identity" {
  source              = "terraform-google-modules/kubernetes-engine/google//modules/workload-identity"
  version             = "30.3.0"
  gke_cluster_name        = module.gke.name
  name                = "flowsource-workload-identity-manager"
  location            = var.region
  use_existing_k8s_sa = true
  annotate_k8s_sa     = false
  namespace           = "flowsource"
  project_id          = var.project_id
}
*/