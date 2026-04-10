terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.38.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "5.38.0"
    }
  }
  required_version = "~> 1.3"
}

provider "google" {
  project = var.project_id
  region  = var.region
}