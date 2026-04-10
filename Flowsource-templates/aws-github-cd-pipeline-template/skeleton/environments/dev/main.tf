provider "aws" {
  region = var.region
}

data "aws_eks_cluster" "${{values.clusterName}}" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]
}

data "aws_eks_cluster_auth" "${{values.clusterName}}" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]
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

# Use existing Subnet within existing VPC
data "aws_vpc" "vpc" {
  id = var.vpc_id
}

data "aws_subnet" "eks_subnet_ids" {
  for_each = toset(var.eks_subnet_ids)
  id       = each.value
}

module "eks" {
  source            = "../../modules/eks"
  vpc_id            = var.vpc_id
  eks_subnet_ids    = var.eks_subnet_ids
  cp_subnet_ids     = var.cp_subnet_ids
  cluster-name      = var.cluster-name
  cluster-version   = var.cluster-version
  instance-types    = var.instance-types
  eks-min-instances = var.eks-min-instances
  eks-max-instances = var.eks-max-instances
  cluster_iam_role = var.cluster_iam_role
  create_iam_role  = var.create_iam_role
  node_iam_role                   = var.node_iam_role
  ami_id                          = var.ami_id
  cluster_endpoint_public_access  = var.cluster_endpoint_public_access
  cluster_endpoint_private_access = var.cluster_endpoint_private_access
  bastion-cidr                    = var.bastion-cidr
  bastion-sg-id                   = var.bastion-sg-id

  create_cluster_security_group	  = var.create_cluster_security_group
  create_cluster_primary_sg_tags  = var.create_cluster_primary_sg_tags
  create_kms_key				          = var.create_kms_key
  cluster_encryption_config       = var.cluster_encryption_config
  create_node_security_group	    = var.create_node_security_group
  cluster_security_group_id       = var.cluster_security_group_id

  ami_release_version             = var.ami_release_version
  use_latest_ami_release_version  = var.use_latest_ami_release_version
  ami_type                        = var.ami_type
  create_launch_template          = var.create_launch_template
  use_custom_launch_template      = var.use_custom_launch_template
  template_id                     = var.template_id
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
