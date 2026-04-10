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
    random = {
      source  = "hashicorp/random"
      version = "3.6.2"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.31.0"
    }
  }
  provider_meta "google" {
    module_name = "blueprints/terraform/terraform-google-bastion-host/v6.0.0"
  }
}

provider "google" {
  # credentials = file("gcp-project.json")
  project = var.project_id
  region  = var.region
}