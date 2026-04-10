terraform {
  required_version = "~> 1.3"
}

data "google_container_cluster" "gke_cluster" {
  name     = "${var.gke_cluster_name}"
  location = var.region
  project  = var.project_id
}

data "google_client_config" "current" {
}

locals {
  kubeconfig = {
    cluster_ca_certificate = data.google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate
    host                   = "https://${data.google_container_cluster.gke_cluster.endpoint}"
    token                  = data.google_client_config.current.access_token
  }
}

provider "google" {
  region  = var.region
  project = var.project_id
}

provider "kubernetes" {
}

module "helm-secrets-store-csi-driver" {
  source = "./modules/helm-install"

  project_id       = var.project_id
  gke_cluster_name = var.gke_cluster_name
  chart            = var.csi_chart
  chartversion     = var.csi_chartversion
  deploymentname   = var.csi_deploymentname
  chartrepository  = var.csi_chartrepository
  namespace        = var.namespace
  values-file      = [var.csi-drivers-values-file]

  kubeconfig = local.kubeconfig
}

module "secrets-store-csi-driver-provider-gcp" {
  source = "./modules/helm-install"

  project_id       = var.project_id
  gke_cluster_name = var.gke_cluster_name
  chart            = var.gcp_csi_chart
  chartversion     = var.gcp_csi_chartversion
  deploymentname   = var.gcp_csi_deploymentname
  chartrepository  = var.gcp_csi_chartrepository
  values-file      = [var.gcp-csi-drivers-values-file]
  namespace        = var.namespace

  kubeconfig = local.kubeconfig
}

output "csi_status" {
  value = module.helm-secrets-store-csi-driver.status
}

output "csi_chart_details" {
  value = module.helm-secrets-store-csi-driver.chart_details
}

output "gcp_csi_status" {
  value = module.secrets-store-csi-driver-provider-gcp.status
}

output "gcp_csi_chart_details" {
  value = module.secrets-store-csi-driver-provider-gcp.chart_details
}