terraform {
  backend "gcs" {
    # bucket should be the same as var.backend_bucket_name
    bucket = "skg-gke-terraform-state"
    prefix = "terraform/state/dev/alloydb"
  }
}