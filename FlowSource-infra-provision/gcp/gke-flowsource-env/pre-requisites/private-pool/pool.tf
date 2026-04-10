resource "google_cloudbuild_worker_pool" "private_pool" {
  name     = var.private_pool_name
  location = var.region
  project  = var.project_id
  network_config {
    peered_network = data.google_compute_network.flowsource-private-pool-peering-vpc.id
  }

  worker_config {
    disk_size_gb   = 100
    machine_type   = "e2-standard-4"
    no_external_ip = false
  }
  depends_on = [
    data.google_compute_network.flowsource-private-pool-peering-vpc
  ]
}