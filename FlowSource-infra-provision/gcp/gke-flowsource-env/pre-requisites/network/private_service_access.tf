# Create an IP addresses for AlloyDB & CloudBuild
resource "google_compute_global_address" "private_ip_alloc" {
  depends_on    = [module.vpc]
  name          = "${var.envprefix}-adb-nrp"
  address_type  = "INTERNAL"
  purpose       = "VPC_PEERING"
  prefix_length = 20
  network       = var.network_name
  address       = var.adb_peering_address
}

resource "google_compute_global_address" "private_ip_alloc_cb" {
  depends_on    = [module.vpc]
  name          = "${var.envprefix}-cbp"
  address_type  = "INTERNAL"
  purpose       = "VPC_PEERING"
  prefix_length = 20
  network       = var.peering_network_name
  address       = var.cb_peering_address
}

# Create a private connection for AlloyDB Source VPC network
resource "google_service_networking_connection" "private_service_access_adb" {
  depends_on              = [google_compute_global_address.private_ip_alloc]
  provider                = google
  network                 = var.network_name
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
}

# Create a private connection for CloudBuild with peering VPC network
resource "google_service_networking_connection" "private_service_access_cb" {
  depends_on              = [google_compute_global_address.private_ip_alloc_cb]
  provider                = google
  network                 = var.peering_network_name
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc_cb.name]
}

# (Optional) Import or export custom routes
resource "google_compute_network_peering_routes_config" "peering_routes" {
  depends_on = [google_service_networking_connection.private_service_access_cb]
  peering    = google_service_networking_connection.private_service_access_cb.peering
  network    = var.peering_network_name

  import_custom_routes = false
  export_custom_routes = true
}

resource "google_compute_network_peering_routes_config" "peering_routes_adb" {
  depends_on = [google_service_networking_connection.private_service_access_adb]
  peering    = google_service_networking_connection.private_service_access_adb.peering
  network    = var.network_name

  import_custom_routes = false
  export_custom_routes = true
}

# updating network peering for not exporting subnet routes with public ip
resource "null_resource" "update_network_peering" {
  depends_on = [google_service_networking_connection.private_service_access_cb]
  provisioner "local-exec" {
    #interpreter = ["bash", "-c"]
    command = <<-EOT
gcloud compute networks peerings update servicenetworking-googleapis-com \
    --network=flowsource-private-pool-peering-vpc \
    --export-custom-routes \
    --no-export-subnet-routes-with-public-ip
EOT

  }
}