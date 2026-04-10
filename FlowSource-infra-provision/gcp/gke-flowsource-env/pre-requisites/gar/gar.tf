resource "google_artifact_registry_repository" "gar_repo" {
  location      = var.region
  project       = var.project_id
  repository_id = var.gar_repo
  description   = "Docker repository for Flowsource"
  format        = "DOCKER"
}