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
