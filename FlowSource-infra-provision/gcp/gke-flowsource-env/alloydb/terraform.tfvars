## General 
gke_cluster_name = "flowsource-gke-cluster"
project_id       = "cog01hy0xaqm3kfh4mr4t3em9ex2m"
region           = "us-east1"
network_name     = "flowsource-vpc"

## AlloyDB
adb_cluster_name                   = "flowsource-adb-cluster"
cluster_labels                     = { "environment" = "dev", "project" = "flowsource", "terraform" = "true" }
primary_db_cluster_zones           = "us-east1-d"
primary_db_node_count              = 1
primary_machine_cpu_count          = 2
read_pool_node_count               = 1
read_pool_machine_cpu_count        = 2
read_pool_cluster_zones            = "us-east1-c"
read_pool_availability_type        = "ZONAL"
source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
cluster_initial_user = {
  user     = "alloydb"
  password = "alloydb"
}