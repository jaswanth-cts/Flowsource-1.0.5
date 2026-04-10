# VPC and Network related Variables
#=====================================

### ===== Variables added for our env ======
# Required if pre-created VPC is to be used for setting up EKS
variable "vpc_id" {
  description = "The id of the VPC in which to create cluster"
  type    = string
  default = ""
}

# Required if pre-created Subnet Ids is to be used for setting up EKS
variable "eks_subnet_ids" {
  description = "The subnet ids for the node group"
  type = list(string)
  default = []
}

# If not specified the EKS Control Plane will use the same subnets as the Node Groups
variable "cp_subnet_ids" {
  description = "The subnet ids for the control plane"
  type = list(string)
  default = []
}

# Required if pre-created Subnet Ids is to be used for setting up DB
variable "db_subnet_ids" {
  description = "The subnet ids for the Postgresql database"
  type = list(string)
  default = []
}

## =======================================

# EKS Cluster Variables
#=====================================
variable "cluster-name" {
  description = "Name of the EKS Cluster"
  type    = string
}
variable "cluster-version" {
  type    = string
  default = 1.31
}

variable "instance-types" {
  description = "EC2 instance type for Node groups"
  type = list(string)
  default = ["t3.medium"]
}

variable "eks-min-instances" {
  default     = 1
  type        = number
  description = "Min number of instances in a worker group"
}
variable "eks-max-instances" {
  default     = 3
  type        = number
  description = "Max number of instances in a worker group"
}

# If pre-created IAM Role is to be used for setting up EKS  and create_iam_role is false, then the ARN of existing IAM role to use, else this will be the prefix for the new role to be created
variable "cluster_iam_role" {
  description = "The name of the cluster IAM role"
  type = string
}

variable "node_iam_role" {
  description = "The name of the Node IAM role"
  type = string
  default = ""
}

variable "create_iam_role" {
  description = "Flag to determine if IAM role is to be created"
  type = bool
  default = true
}

variable "ami_id" {
  description = "AMI to use for cluster (Optional)"
  type = string
  default = ""
}

variable "cluster_endpoint_public_access" {
  description = "Flag to determine if the cluster endpoint should have public access"
  type = bool
  default = false
}

variable "cluster_endpoint_private_access" {
  description = "Flag to determine if the cluster endpoint should have private access. One of either public or private should be true at least"
  type = bool
  default = true
}

variable "create_kms_key" {
  default     = false
  type        = bool
  description = "Controls if a KMS key for cluster encryption should be created"
}

variable "create_cluster_security_group" {
  default     = false
  type        = bool
  description = "Determines if a security group is created for the cluster."
}

variable "create_node_security_group" {
  default     = false
  type        = bool
  description = "Determines whether to create a security group for the node groups or use the existing"
}

variable "cluster_encryption_config" {
  default     = {}
  type        = map(string)
  description = "Configuration block with encryption configuration for the cluster"
}

variable "create_cluster_primary_sg_tags" {
  default     = false
  type        = bool
  description = "Indicates whether or not to tag the cluster's primary security group. This security group is created by the EKS service, not the module, and therefore tagging is handled after cluster creation"
}

variable "cluster_security_group_id" {
  default     = ""
  type        = string
  description = "Existing security group ID to be attached to the cluster"
}

variable "ami_type" {
  description = "Type of Amazon Machine Image (AMI) associated with the EKS Node Group. See the [AWS documentation](https://docs.aws.amazon.com/eks/latest/APIReference/API_Nodegroup.html#AmazonEKS-Type-Nodegroup-amiType) for valid values"
  type        = string
  default     = null
}

variable "ami_release_version" {
  description = "The AMI version. Defaults to latest AMI release version for the given Kubernetes version and AMI type"
  type        = string
  default     = null
}

variable "use_latest_ami_release_version" {
  description = "Determines whether to use the latest AMI release version for the given `ami_type` (except for `CUSTOM`). Note: `ami_type` and `cluster_version` must be supplied in order to enable this feature"
  type        = bool
  default     = false
}

variable "create_launch_template" {
  description = "Determines whether to create a launch template or not. If set to `false`, EKS will use its own default launch template"
  type        = bool
  default     = true
}

variable "use_custom_launch_template" {
  description = "Determines whether to use a custom launch template or not. If set to `false`, EKS will use its own default launch template"
  type        = bool
  default     = true
}

variable "template_id" {
  description = "The ID of an existing launch template to use. Required when `create_launch_template` = `false` and `use_custom_launch_template` = `true`"
  type        = string
  default     = ""
}
#=====================================

# DB Related Variables
#=====================================
variable "postgres-db-name" {
  type = string
  description = "Name of the postgres database"
}

variable "postgres-db-identifier-name" {
  type = string
  description = "Postgres Database Server Identifier which is the RDS instance name"
}

variable "postgres-db-user" {
  description = "RDS root user"
  type        = string
}

variable "postgres-db-password" {
  description = "RDS root user password"
  type        = string
  sensitive   = true
  default     = "ChangeMe"
}

variable "postgres-db-instance-class" {
  description = "Instance class for the database"
  type = string
  default = "db.m5.large"
}

variable "postgres-db-backup-retention-period" {
  description = "The database backups retention period.  If 0 automated backup is disabled"
  type = number
  default = 1
}
variable "postgres-skip-final-snapshot" {
  description = "Flag indiciating if final snapshot should be skipped before delete"
  type = bool
  default = false
}

variable "postgres-db-multi-az" {
  description = "Whether multi-az DB to be created"
  type = bool
  default = false
} 

variable "postgres-maintenance-window" {
  description = "The window to perform maintenance in. Syntax: ddd:hh24:mi-ddd:hh24:mi. Eg: Mon:00:00-Mon:03:00."
  type = string
  default = ""
} 

variable "postgres-backup-window" {
  description = "The daily time range (in UTC) during which automated backups are created if they are enabled. Example: 09:46-10:16. Must not overlap with maintenance_window"
  type = string
  default = ""
}

variable "db_security_group_ids" {
  description = "Security group ids to associate with database"
  type = list(string)
  default = []
}

#=====================================

variable "region" {
  default = "us-east-1"
}

variable "vpc-cidr" {
  default = "172.31.0.0/16"
  type    = string
}

variable "bastion-cidr" {
  description = "The CIDR block for the bastion"
  type    = string
}

variable "bastion-sg-id" {
  description = "The Security Group Id of Bastion host (Optional)"
  type    = string
  default = ""
}

variable "ebs_volume_size" {
  default     = 100
  type        = number
  description = "Disk size in GiB for worker nodes. Defaults to 100"
}

variable "enable_read_replica" {
  description = "Whether read replica to be created"
  type = bool
  default = true
} 

variable "replica_db_security_group_ids" {
  description = "Security group ids to associate with read replica database"
  type = list(string)
  default = []
}

variable "replica_db_subnet_ids" {
  description = "The subnet ids for the read replica Postgresql database"
  type = list(string)
  default = []
}

variable "replica_region" {
  default = "us-east-1"
}

variable "postgres-db-replica-multi-az" {
  description = "Whether multi-az DB to be created for replica"
  type = bool
  default = false
}

variable "replica_kms_key_arn" {
  description = "The kms key arn key to encrypt/decrpyt the replica, the key must exist in the replica region"
  type    = string
  default = ""
}
