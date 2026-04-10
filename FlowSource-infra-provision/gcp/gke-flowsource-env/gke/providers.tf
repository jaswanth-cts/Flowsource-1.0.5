terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.15.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "6.15.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.2"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.36.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.14.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "1.14.0"
    }
  }
}

provider "google" {
  # credentials = file("gcp-project.json")
  project = var.project_id
  region  = var.region
}