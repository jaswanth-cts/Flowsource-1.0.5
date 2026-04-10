module "alloy-db" {

  source  = "GoogleCloudPlatform/alloy-db/google"
  version = "~> 3.0"

  project_id       = var.project_id
  cluster_id       = var.adb_cluster_name
  cluster_location = var.region
  cluster_labels   = var.cluster_labels
  cluster_initial_user = {
    user     = lookup(var.cluster_initial_user, "user")
    password = lookup(var.cluster_initial_user, "password")
  }
  network_self_link = "projects/${var.project_id}/global/networks/${var.network_name}"

  automated_backup_policy = null

  primary_instance = {
    instance_id       = "${var.adb_cluster_name}-primary-adb-1"
    display_name      = "${var.adb_cluster_name}-alloydb-primary-instance"
    instance_type     = "PRIMARY"
    node_count        = var.primary_db_node_count
    machine_cpu_count = var.primary_machine_cpu_count
    database_flags    = {}
    db_gce_zone       = var.primary_db_cluster_zones

    labels = var.cluster_labels
  }

  read_pool_instance = [
    {
      instance_id       = "${var.adb_cluster_name}-read-pool-1"
      display_name      = "${var.adb_cluster_name}-read-instance-1"
      instance_type     = "READ_POOL"
      node_count        = var.read_pool_node_count
      machine_cpu_count = var.read_pool_machine_cpu_count
      database_flags    = {}
      availability_type = var.read_pool_availability_type
      db_gce_zone       = var.read_pool_cluster_zones

      labels = var.cluster_labels
    }
  ]

  # depends_on = [google_compute_global_address.private_ip_alloc, google_service_networking_connection.private_service_access]
}

resource "google_compute_firewall" "allow_gke_to_alloydb" {
  name    = "${var.adb_cluster_name}-allow-gke-to-alloydb"
  network = var.network_name

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_tags = ["${var.gke_cluster_name}"]
  target_tags = ["${var.adb_cluster_name}-alloydb"]
}