
data "aws_eks_cluster" "flowsource-cluster" {
  name       = var.cluster-name
}

data "aws_eks_cluster_auth" "flowsource-cluster" {
  name       = var.cluster-name
}

locals {
    kubeconfig = {
    host: data.aws_eks_cluster.flowsource-cluster.endpoint
    cluster_ca_certificate: data.aws_eks_cluster.flowsource-cluster.certificate_authority.0.data
    token: data.aws_eks_cluster_auth.flowsource-cluster.token
  }
}

module "helm-secrets-store-csi-driver" {
  source = "./modules/helm-install"

  chart           = "secrets-store-csi-driver"
  chartversion    = "1.4.3"
  deploymentname  = "csi-secrets-store"
  chartrepository = "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts"
  namespace       = "kube-system"
  values-files    = [var.csi-drivers-values-file]
  kubeconfig      = local.kubeconfig
}

module "secrets-store-csi-driver-provider-aws" {
  source = "./modules/helm-install"

  chart           = "secrets-store-csi-driver-provider-aws"
  chartversion    = "0.3.8"
  deploymentname  = "secrets-provider-aws"
  chartrepository = "https://aws.github.io/secrets-store-csi-driver-provider-aws"
  values-files    = []
  namespace       = "kube-system"

  kubeconfig      = local.kubeconfig
}

module "aws_load_balancer_controller" {
  source = "./modules/helm-install"

  chart           = "aws-load-balancer-controller"
  deploymentname  = "aws-load-balancer-controller"
  chartrepository = "https://aws.github.io/eks-charts"
  values-files    = ["alb-controller-values.yaml"]
  namespace       = "alb-ingress"

  kubeconfig      = local.kubeconfig
  create_namespace = true 
}

#Uncomment to integrate cloudability
# module "cloudability" {
#   source                = "./modules/cloudability"
#   cluster_name          = var.cluster-name
#   metrics_agent_apiKey  = var.cloudability_metrics_agent_apiKey

#   kubeconfig           = local.kubeconfig
# }

#Uncomment to integrate datadog
# module "datadog" {
#   source          = "./modules/datadog"
#   cluster_name    = var.cluster-name
#   api_key         = var.datadog_api_key
#   app_key = var.datadog_app_key
#   datadog_site    = var.datadog_site

#   kubeconfig      = local.kubeconfig
# }
