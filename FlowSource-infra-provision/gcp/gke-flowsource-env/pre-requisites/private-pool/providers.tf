terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.38.0"
    }
  }
}

provider "google" {
  # credentials = file("gcp-project.json")
  project = var.project_id
  region  = var.region
}