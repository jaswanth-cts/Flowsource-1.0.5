terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.67.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.10"
    }
  }
}
data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name
  depends_on = [module.eks.cluster_name]
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name
  depends_on = [module.eks.cluster_name]
}
provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.11.1"

  cluster_name                    = var.cluster-name
  cluster_version                 = var.cluster-version
  subnet_ids                      = var.eks_subnet_ids
  vpc_id                          = var.vpc_id
  control_plane_subnet_ids        = var.cp_subnet_ids
  enable_irsa                     = false
  create_cloudwatch_log_group     = false
  create_cluster_security_group	  = var.create_cluster_security_group
  create_cluster_primary_security_group_tags = var.create_cluster_primary_sg_tags
  create_kms_key				          = var.create_kms_key
  cluster_encryption_config       = var.cluster_encryption_config
  create_node_security_group	    = var.create_node_security_group
  cluster_endpoint_public_access  = var.cluster_endpoint_public_access
  cluster_endpoint_private_access = var.cluster_endpoint_private_access

  # Cluster access entry
  # To add the current caller identity as an Administrator  
  enable_cluster_creator_admin_permissions = true

  # Add to maintain v17.x settings to avoid control plane replacement
  prefix_separator = ""
  iam_role_name    = var.create_iam_role ? var.cluster_iam_role : null
  create_iam_role  = var.create_iam_role
  iam_role_arn     = var.create_iam_role ? null : var.cluster_iam_role

  cluster_security_group_id          = var.cluster_security_group_id
  cluster_security_group_description = "EKS cluster security group."

  # Additional Security Group Rules for cluster to allow bastion access
  cluster_security_group_additional_rules = {
    ingress_nodes_bastion_tcp = {
      description              = "From Bastion"
      protocol                 = "tcp"
      from_port                = 443
      to_port                  = 443
      type                     = "ingress"
      cidr_blocks              = var.bastion-sg-id == "" ? [var.bastion-cidr] : null
      source_security_group_id = var.bastion-sg-id != "" ? var.bastion-sg-id : null
    }
  }

  # Extend cluster security group rules
  node_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                   = "To cluster 1025-65535"
      protocol                      = "tcp"
      from_port                     = 1025
      to_port                       = 65535
      type                          = "ingress"
      source_cluster_security_group = true
    }
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
  }

  cluster_enabled_log_types = ["api", "audit", "authenticator"]
  tags = {
    Terraform = "true"
  }

  eks_managed_node_groups = {
    fsmgdng = {
      name = "mg-node-group-1"

      instance_types                  = var.instance-types
      use_latest_ami_release_version  = var.use_latest_ami_release_version
      ami_release_version             = var.ami_release_version
      ami_type                        = var.ami_type

      min_size     = var.eks-min-instances
      max_size     = var.eks-max-instances
      desired_size = var.eks-min-instances

      ami_id                     = var.ami_id
      create_iam_role            = var.create_iam_role
      iam_role_arn               = var.create_iam_role ? null : var.node_iam_role
      create_launch_template     = var.create_launch_template
      use_custom_launch_template = var.use_custom_launch_template
      enable_bootstrap_user_data = var.ami_id != "" ? true : false
      launch_template_id         = var.template_id

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            delete_on_termination = true
            encrypted             = false
            volume_size           = 100
            volume_type           = "gp3"
          }

        }
      }
    }
  }
}

resource "kubernetes_namespace" "namespaces" {
  for_each = var.namespaces
  metadata {
    name = each.value
  }
}
