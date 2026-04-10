variable "region" {
  description = "AWS Region"
  type        = string
}

variable "vpc_id" {
  description = "The id of the VPC in which to create cluster"
  type        = string
}

variable "eks_subnet_ids" {
  description = "The subnet ids for the node group"
  type        = list(string)
}

# If not specified the EKS Control Plane will use the same subnets as the Node Groups
variable "cp_subnet_ids" {
  description = "The subnet ids for the control plane"
  type        = list(string)
  default     = []
}

variable "cluster-name" {
  description = "Name of the EKS Cluster"
  type        = string
}

variable "cluster-version" {
  type    = string
  default = 1.29
}

variable "instance-types" {
  description = "EC2 instance type for Node groups"
  type        = list(string)
  default     = ["t3.medium"]
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
  type        = string
  default     = "flowsource-dev-eks-cluster"
}

variable "create_iam_role" {
  description = "Flag to determine if IAM role is to be created"
  type        = bool
  default     = true
}

variable "node_iam_role" {
  description = "The name of the Node IAM role"
  type        = string
  default     = "flowsource-dev-eks-cluster-node"
}

variable "ami_id" {
  description = "AMI to use for cluster (Optional)"
  type        = string
  default     = ""
}

variable "cluster_endpoint_public_access" {
  description = "Flag to determine if the cluster endpoint should have public access"
  type        = bool
  default     = false
}

variable "cluster_endpoint_private_access" {
  description = "Flag to determine if the cluster endpoint should have private access. One of either public or private should be true at least"
  type        = bool
  default     = true
}

variable "bastion-cidr" {
  description = "The CIDR block for the bastion"
  type        = string
}

variable "bastion-sg-id" {
  description = "The Security Group Id of Bastion host"
  type        = string
}

variable "namespaces" {
  description = "The namespaces to create within Kubernetes"
  type        = set(string)
  default     = []
}

variable "chart" {
  description = "Location of the helm chart"
  type        = string
}

variable "chartversion" {
  description = "Version of the chart to deploy. If not specified latest version will be used"
  type        = string
  default     = ""
}

variable "chartrepository" {
  description = "The repository for the chart"
  type        = string
  default     = ""
}

variable "values-files" {
  description = "List of Fully qualified values files"
  type        = list(any)
}

variable "namespace" {
  description = "Namespace for installation"
  type        = string
  default     = "flowsource-dev"
}

variable "deploymentname" {
  description = "Name of the deployment"
  type        = string
}

variable "clustertype" {
  description = "Type of the Kubernetes cluster"
  type        = string
  default     = "eks"
}

variable "create_namespace" {
  type        = bool
  default     = true
  description = "Create namespace if it does not exist. By default the value is false"
}

variable "create_cluster_security_group" {
  default     = false
  type        = bool
  description = "Determines if a security group is created for the cluster."
}

variable "create_cluster_primary_sg_tags" {
  default     = false
  type        = bool
  description = "Indicates whether or not to tag the cluster's primary security group. This security group is created by the EKS service, not the module, and therefore tagging is handled after cluster creation"
}

variable "create_kms_key" {
  default     = false
  type        = bool
  description = "Controls if a KMS key for cluster encryption should be created"
}

variable "cluster_encryption_config" {
  default     = {}
  type        = map(string)
  description = "Configuration block with encryption configuration for the cluster"
}

variable "create_node_security_group" {
  default     = false
  type        = bool
  description = "Determines whether to create a security group for the node groups or use the existing"
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