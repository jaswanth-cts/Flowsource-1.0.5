# VPC
# In our environment VPC is pre-created. In other cases we might want to pre-create VPC. Since accordingly the source of id changes, create a local variable to refer elsewhere

# EKS Cluster IAM Role.
# In our case its already created upfront and has to be used. Hence get the id/ARN for the same
data "aws_iam_role" "cluster_iam_role" {
  count = var.create_iam_role ? 0 : 1
  name = var.cluster_iam_role
}

data "aws_iam_role" "node_iam_role" {
  count = var.create_iam_role ? 0 : 1
  name = var.node_iam_role
}

resource "aws_security_group" "db-sg" {
  name        = "db-sg-${var.postgres-db-name}"
  description = "Allow access to Database"
  vpc_id      = local.vpc_id

  ingress {

    description     = "Allow access EKS Nodes"
    from_port       = 5432
    protocol        = "tcp"
    security_groups = [module.eks-cluster.cluster_security_group_id, module.eks-cluster.cluster_primary_security_group_id, module.eks-cluster.node_security_group_id]
    self            = false
    to_port         = 5432
  }

  ingress {

    description     = "Allow Access from Bastion"
    from_port       = 5432
    protocol        = "tcp"
    cidr_blocks     = var.bastion-sg-id == "" ? [var.bastion-cidr] : null
    security_groups = var.bastion-sg-id != "" ? [var.bastion-sg-id] : null
    self            = false
    to_port         = 5432
  }

  egress {

    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }  
}

module "eks-cluster" {
  source                = "./modules/eks-cluster"
  vpc_id                = local.vpc_id
  eks_subnet_ids        = local.eks_subnet_ids
  cp_subnet_ids         = local.cp_subnet_ids
  cluster-name          = var.cluster-name
  cluster-version       = var.cluster-version
  instance-types        = var.instance-types
  eks-min-instances     = var.eks-min-instances
  eks-max-instances     = var.eks-max-instances
  cluster_iam_role      = var.create_iam_role ? null : data.aws_iam_role.cluster_iam_role[0].arn
  create_iam_role       = var.create_iam_role
  node_iam_role         = var.create_iam_role ? null : data.aws_iam_role.node_iam_role[0].arn
  ami_id                = var.ami_id != "" ? var.ami_id : null
  cluster_endpoint_public_access = var.cluster_endpoint_public_access
  cluster_endpoint_private_access = var.cluster_endpoint_private_access
  bastion-cidr          = var.bastion-cidr
  bastion-sg-id         = var.bastion-sg-id
  
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
  ebs_volume_size                 = var.ebs_volume_size
}



module "postgresql" {
  providers               = {
    aws.replica    = aws.replica 
  }

  source                  = "./modules/postgresql"
  db_subnet_ids           = var.db_subnet_ids
  db-name                 = var.postgres-db-name
  db-identifier-name      = var.postgres-db-identifier-name
  db-user                 = var.postgres-db-user
  db-password             = var.postgres-db-password
  db-instance-class       = var.postgres-db-instance-class
  security_group_ids      = [aws_security_group.db-sg.id]
  backup_retention_period = var.postgres-db-backup-retention-period
  skip_final_snapshot     = var.postgres-skip-final-snapshot
  multi_az                = var.postgres-db-multi-az
  maintenance_window      = var.postgres-maintenance-window
  backup_window           = var.postgres-backup-window

  enable_read_replica             = var.enable_read_replica
  replica_db_subnet_ids           = var.replica_db_subnet_ids
  replica_security_group_ids      = var.replica_db_security_group_ids
  replica_kms_key_arn             = var.replica_kms_key_arn
}

