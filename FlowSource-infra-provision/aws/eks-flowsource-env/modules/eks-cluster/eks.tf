module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  #version         = "18.31.2"
  version         = "20.11.1"

  cluster_name    = var.cluster-name
  cluster_version = var.cluster-version
  subnet_ids      = var.eks_subnet_ids
  vpc_id          = var.vpc_id
  control_plane_subnet_ids = var.cp_subnet_ids
  enable_irsa     = false
  create_cloudwatch_log_group = false
  create_cluster_security_group	  = var.create_cluster_security_group
  create_cluster_primary_security_group_tags  = var.create_cluster_primary_sg_tags
  create_kms_key				          = var.create_kms_key
  cluster_encryption_config       = var.cluster_encryption_config
  create_node_security_group	    = var.create_node_security_group
  cluster_endpoint_public_access = var.cluster_endpoint_public_access
  cluster_endpoint_private_access = var.cluster_endpoint_private_access
  
  # Cluster access entry
  # To add the current caller identity as an administrator  
  enable_cluster_creator_admin_permissions = true
  
  # Add to maintain v17.x settings to avoid control plane replacement
  prefix_separator                   = ""
  iam_role_name                      = var.create_iam_role ? var.cluster_iam_role : null
  create_iam_role                    = var.create_iam_role
  iam_role_arn                       = var.create_iam_role ? null : var.cluster_iam_role

  cluster_security_group_id          = var.cluster_security_group_id
  cluster_security_group_description = "EKS cluster security group."

  # Additional Security Group Rules for cluster to allow bastion access
  cluster_security_group_additional_rules = {
    ingress_nodes_bastion_tcp = {
      description                   = "From Bastion"
      protocol                      = "tcp"
      from_port                     = 443
      to_port                       = 443
      type                          = "ingress"
      cidr_blocks                   = var.bastion-sg-id == "" ? [var.bastion-cidr] : null
      source_security_group_id      = var.bastion-sg-id != "" ? var.bastion-sg-id : null
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

      ami_id       = var.ami_id
      create_iam_role = var.create_iam_role
      iam_role_arn    = var.create_iam_role ? null : var.node_iam_role
      create_launch_template     = var.create_launch_template
      use_custom_launch_template = var.use_custom_launch_template
      enable_bootstrap_user_data = var.ami_id != "" ? true : false
      launch_template_id         = var.template_id
      disk_size                  = var.ebs_volume_size

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            delete_on_termination = true
            encrypted             = false
            volume_size           = var.ebs_volume_size
            volume_type           = "gp3"
          }

        }
      }
   }
  }

  #self_managed_node_group_defaults = {
  #  create_security_group                  = false
  #  update_launch_template_default_version = true


    # enable discovery of autoscaling groups by cluster-autoscaler
  #  autoscaling_group_tags = {
  #    "k8s.io/cluster-autoscaler/enabled" : true,
  #    "k8s.io/cluster-autoscaler/${var.cluster-name}" : "owned",
  #    "kubernetes.io/cluster-autoscaler/enabled"    = "true",
  #    "kubernetes.io/cluster/${var.cluster-name}" = "owned",
  #    propagate_at_launch                           = true
  #  }

  #  block_device_mappings = {
  #    xvda = {
  #      device_name = "/dev/xvda"
  #      ebs = {
  #        delete_on_termination = true
  #        encrypted             = false
  #        volume_size           = 100
  #        volume_type           = "gp3"
  #      }

  #    }
  #  }
  #}

  #self_managed_node_groups = {
  #  fsng = {
  #    name                          = "node-group-1"
  #    instance_types                = var.instance-types[0]
  #    min_size                      = var.eks-min-instances
  #    max_size                      = var.eks-max-instances
  #    #subnet_ids                   = module.vpc.private_subnets
  #    ami_id                        = var.ami_id != "" ? var.ami_id : null
  #    iam_role_arn                  = var.create_iam_role ? null : var.node_iam_role
  #    create_iam_instance_profile   = true
  #    iam_instance_profile_arn      = var.create_iam_role ? null : "arn:aws:iam::916849114231:instance-profile/eks-30c7e151-ec52-1e9d-8c1d-a4100cd261d3"
  #  }
  #}
}