provider "aws" {
  region = var.region
}

data "aws_eks_cluster" "${{values.clusterName}}" {
  name = var.cluster-name
}

data "aws_eks_cluster_auth" "${{values.clusterName}}" {
  name = var.cluster-name
}

locals {
  kubeconfig = {
    host : data.aws_eks_cluster.${{values.clusterName}}.endpoint
    cluster_ca_certificate : data.aws_eks_cluster.${{values.clusterName}}.certificate_authority.0.data
    token : data.aws_eks_cluster_auth.${{values.clusterName}}.token
  }
}

provider "kubernetes" {
}

locals {
  credential_path = "${path.cwd}/credentials"
}

module "helm" {
  source           = "../../modules/helm-install"
  chart            = var.chart
  deploymentname   = var.deploymentname
  chartversion     = var.chartversion
  chartrepository  = var.chartrepository
  values-files     = var.values-files
  namespace        = var.namespace
  kubeconfig       = local.kubeconfig
  create_namespace = var.create_namespace
}

output "status" {
  value = module.helm.status
}

output "chart_details" {
  value = module.helm.chart_details
}
