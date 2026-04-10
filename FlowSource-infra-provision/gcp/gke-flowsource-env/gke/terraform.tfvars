## General 
gke_cluster_name        = "flowsource-gke-cluster"
project_id              = "cog01hy0xaqm3kfh4mr4t3em9ex2m"
region                  = "us-east1"
network_name            = "flowsource-vpc"
gcp_private_subnet_name = "flowsource-private-subnet-1"

## GKE
cluster_zones     = ["us-east1-b", "us-east1-c", "us-east1-d"]
ip_range_pods     = ""
ip_range_services = ""
master_cidr       = "192.168.130.0/28"
master_authorized_networks = [
  {
    cidr_block   = "10.0.0.0/16",
    display_name = "flowsource-public-subnet-1"
  },
  {
    cidr_block   = "10.10.0.0/16",
    display_name = "flowsource-private-subnet-1"
  },
  {
    cidr_block   = "10.30.0.0/16",
    display_name = "flowsource-private-subnet-2"
}]
gke_cluster_version     = "1.32"
enable_private_endpoint = true
enable_private_nodes    = true
service_account         = "flowsource-gke@cog01hy0xaqm3kfh4mr4t3em9ex2m.iam.gserviceaccount.com"
cluster_resource_labels = { "environment" = "dev", "project" = "flowsource", "terraform" = "true" }
node_pools = {
  name                      = "flowsource-gke-node-pool"
  machine_type              = "n1-standard-4"
  node_locations            = ["us-east1-b,us-east1-c"]
  default_max_pods_per_node = 110
  max_node_count            = 10
  min_node_count            = 1
  autoscaling               = true
  local_ssd_count           = 0
  disk_size_gb              = 100
  disk_type                 = "pd-standard"
  image_type                = "COS_CONTAINERD"
  enable_gcfs               = false
  enable_gvnic              = false
  logging_variant           = "DEFAULT"
  auto_repair               = true
  preemptible               = false
  initial_node_count        = 1
  label                     = { "environment" = "dev", "project" = "flowsource", "terraform" = "true", "enable-oslogin" = "true" }
}
gar_repo = "dev-flowsource"
release_channel = "REGULAR"