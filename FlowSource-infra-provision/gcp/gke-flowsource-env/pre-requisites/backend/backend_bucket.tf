resource "google_storage_bucket" "terraform_state" {
  name     = var.backend_bucket_name
  location = var.region
  project  = var.project_id

  lifecycle {
    //    prevent_destroy = true
    prevent_destroy = false
  }

  force_destroy = true
}