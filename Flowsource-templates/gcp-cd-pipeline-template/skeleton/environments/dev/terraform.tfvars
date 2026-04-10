## General 
backend_bucket_name     = "${{values.bucketName}}"
gke_cluster_name        = "${{values.clusterName}}"
project_id              = "${{values.projectId}}"
region                  = "${{values.regionName}}"
network_name            = "${{values.vpc}}"
gcp_private_subnet_name = "${{values.gke_private_subnet_1}}"
nat_name                = "${{values.natNname}}"
router_name             = "${{values.routerName}}"

## GKE
cluster_zones     = ["${{values.regionName}}-b", "${{values.regionName}}-c", "${{values.regionName}}-d"]
ip_range_pods     = ""
ip_range_services = ""
master_cidr       = "${{values.master_cidr}}"
master_authorized_networks = [
  {
    cidr_block   = "10.10.0.0/16",
    display_name = "${{values.gke_private_subnet_1}}"
  },
  {
    cidr_block   = "10.30.0.0/16",
    display_name = "${{values.gke_private_subnet_2}}"
  },
  {
    cidr_block   = "10.0.0.0/16",
    display_name = "${{values.gke_public_subnet}}"
  },
  {
    cidr_block   = "192.168.0.0/20",
    display_name = "cloudbuild-cidr"
  },
]
gke_cluster_version     = "1.29"
enable_private_endpoint = true
enable_private_nodes    = true
service_account         = "${{values.clusterServiceAccount}}"
cluster_resource_labels = { "environment" = "dev", "project" = "${{values.appName}}", "terraform" = "true" }
node_pools = {
  name                      = "${{values.nodePoolName}}"
  machine_type              = "n1-standard-4"
  node_locations            = ["${{values.regionName}}-b,${{values.regionName}}-c"]
  default_max_pods_per_node = 110
  max_node_count            = ${{values.max_count}}
  min_node_count            = ${{values.min_count}}
  autoscaling               = true
  local_ssd_count           = 0
  disk_size_gb              = 100
  disk_type                 = "pd-standard"
  image_type                = "COS_CONTAINERD"
  enable_gcfs               = false
  enable_gvnic              = false
  logging_variant           = "DEFAULT"
  auto_repair               = true
  auto_upgrade              = true
  preemptible               = false
  initial_node_count        = 1
  label                     = { "environment" = "dev", "project" = "${{values.appName}}", "terraform" = "true", "enable-oslogin" = "true" }
}
gar_repo = "cd-registry"
/*
### sample_app-helm
chart          = "../../Charts"
values-files   = ["values-dev.yaml"]
namespace      = "${{values.namespaceName}}-dev"
deploymentname = "${{values.appName}}-dev"
clustertype    = "gke"

### Extra variable
namespaces = ["${{values.namespaceName}}-qa", "${{values.namespaceName}}-prod", "${{values.namespaceName}}-dev"]
*/
