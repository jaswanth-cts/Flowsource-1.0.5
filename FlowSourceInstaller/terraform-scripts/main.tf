terraform {
    required_version = "~> 1.3"
}

provider "kubernetes" {
}

module "helm" {
  source = "./modules/helm-install"

  chart           = var.chart
  deploymentname  = var.deploymentname
  chartversion    = var.chartversion
  chartrepository = var.chartrepository
  values-files    = var.values-files
  namespace       = var.namespace

  kubeconfig      = local.kubeconfig

  clustertype = var.clustertype
  create_namespace = var.create_namespace
  timeout = var.timeout
}

output "status" {
  value     = module.helm.status
}

output "chart_details" {
  value     = module.helm.chart_details
}

