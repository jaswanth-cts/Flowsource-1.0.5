# ============================================================
# FlowSource - Infra EKS + RDS Terraform Variables
# Used by: cicd/infra-pipeline/buildspec-infra-eks-cluster.yaml
# ============================================================

# -------------------------------------------------------
# Feature Flags — set false to use existing infrastructure
# -------------------------------------------------------
create_eks_cluster = false   # Existing EKS cluster in use — skip creation
create_rds         = false   # Existing RDS in use — skip creation
create_irsa_role   = false   # Set true on first run to create flowsource-sa-role; false thereafter

# -------------------------------------------------------
# FlowSource IRSA Role (only needed when create_irsa_role = true)
# -------------------------------------------------------
flowsource_irsa_role_name  = "flowsource-sa-role"
flowsource_namespace       = "flowsource-dev"
flowsource_service_account = "flowsource-sa"

# -------------------------------------------------------
# EKS Cluster (only needed when create_eks_cluster = true)
# -------------------------------------------------------
cluster-name      = "fs-cluster-1"
create_iam_role   = false
cluster_iam_role  = ""   # Not needed — create_eks_cluster = false
node_iam_role     = ""   # Not needed — create_eks_cluster = false
instance-types    = ["m5a.large"]   # m5a.large — t3.medium too small; private endpoint required for nodes to join
eks-min-instances = 1
eks-max-instances = 3

# -------------------------------------------------------
# VPC / Network
# -------------------------------------------------------
region         = "ap-south-1"
vpc_id         = "vpc-07ce784950e1d1b96"
eks_subnet_ids = ["subnet-014652a06f09c9288", "subnet-0d42dfd82eef04a9e"]
cp_subnet_ids  = []
db_subnet_ids  = []

# -------------------------------------------------------
# RDS PostgreSQL (only needed when create_rds = true)
# -------------------------------------------------------
postgres-db-name            = ""   # Not needed — create_rds = false
postgres-db-identifier-name = ""   # Not needed — create_rds = false
postgres-db-user            = ""   # Not needed — create_rds = false
bastion-cidr                = ""   # Not needed — create_rds = false
bastion-sg-id               = ""
