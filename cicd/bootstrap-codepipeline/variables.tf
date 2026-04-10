# ============================================================
# FlowSource AWS CI/CD - Bootstrap Variables
# ============================================================

variable "aws_region" {
  description = "AWS region to create all CI/CD resources in (e.g., us-east-1)"
  type        = string
}

variable "project_name" {
  description = "Short name for the project. Used as prefix for all resources (e.g., flowsource)"
  type        = string
  default     = "flowsource"
}

variable "eks_cluster_name" {
  description = "Name of the existing or to-be-created EKS cluster"
  type        = string
}

variable "ecr_repo_name" {
  description = "Name of the ECR repository that will hold FlowSource Docker images"
  type        = string
  default     = "flowsource"
}

variable "create_ecr_repo" {
  description = "Whether to create the ECR repository via Terraform (set false if already exists)"
  type        = bool
  default     = true
}

# -------------------------------------------------------
# Terraform Remote State (S3 + DynamoDB)
# -------------------------------------------------------
variable "tf_state_bucket" {
  description = "S3 bucket used for Terraform state and CI/CD pipeline artifacts"
  type        = string
}

variable "create_tf_state_bucket" {
  description = "Set to true to create the S3 bucket. Set false if the bucket already exists."
  type        = bool
  default     = true
}

variable "tf_state_region" {
  description = "Region of the S3 bucket (usually same as aws_region)"
  type        = string
  default     = ""
}

variable "tf_dynamodb_table" {
  description = "DynamoDB table name for Terraform state locking (unused — set to empty string)"
  type        = string
  default     = ""
}

# -------------------------------------------------------
# Source Control
# -------------------------------------------------------
variable "source_provider" {
  description = "Source control provider: 'GitHub' or 'CodeCommit'"
  type        = string
  default     = "GitHub"
  validation {
    condition     = contains(["GitHub", "CodeCommit"], var.source_provider)
    error_message = "source_provider must be 'GitHub' or 'CodeCommit'"
  }
}

variable "repository_name" {
  description = "Name of the source repository (GitHub repo name OR CodeCommit repo name)"
  type        = string
}

variable "branch_name" {
  description = "Branch that triggers the pipeline (e.g., main)"
  type        = string
  default     = "main"
}

variable "github_owner" {
  description = "GitHub organization or username (only used when source_provider = GitHub)"
  type        = string
  default     = ""
}

variable "github_connection_arn" {
  description = "ARN of the AWS CodeStar Connection for GitHub (only used when source_provider = GitHub)"
  type        = string
  default     = ""
}

# -------------------------------------------------------
# IAM Roles
# -------------------------------------------------------
variable "codebuild_service_role_arn" {
  description = "ARN of the IAM role for AWS CodeBuild"
  type        = string
}

variable "codepipeline_service_role_arn" {
  description = "ARN of the IAM role for AWS CodePipeline"
  type        = string
}

# -------------------------------------------------------
# VPC (required for private EKS cluster access)
# -------------------------------------------------------
variable "use_vpc" {
  description = "Whether to run CodeBuild projects within the VPC (required for private EKS)"
  type        = bool
  default     = true
}

variable "vpc_id" {
  description = "VPC ID in which to run CodeBuild (required for private EKS endpoint access)"
  type        = string
  default     = ""
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for CodeBuild VPC configuration"
  type        = list(string)
  default     = []
}

variable "codebuild_security_group_ids" {
  description = "Security group IDs for CodeBuild VPC configuration"
  type        = list(string)
  default     = []
}

# -------------------------------------------------------
# Approval / Notifications
# -------------------------------------------------------
variable "approval_sns_topic_arn" {
  description = "ARN of SNS topic for manual approval notifications (QA/PROD gates)"
  type        = string
  default     = ""
}

variable "flowsource_dev_url" {
  description = "URL of the DEV FlowSource deployment (shown in approval notification)"
  type        = string
  default     = ""
}

variable "flowsource_qa_url" {
  description = "URL of the QA FlowSource deployment (shown in PROD approval notification)"
  type        = string
  default     = ""
}

# -------------------------------------------------------
# Miscellaneous
# -------------------------------------------------------
variable "build_timeout_minutes" {
  description = "Build timeout in minutes for CodeBuild projects"
  type        = number
  default     = 60
}

variable "tags" {
  description = "Map of tags to apply to all AWS resources"
  type        = map(string)
  default = {
    Project     = "FlowSource"
    ManagedBy   = "Terraform"
    Environment = "cicd"
  }
}

variable "enable_qa_prod" {
  description = "Set to true to enable QA and PROD pipeline stages. false = DEV only."
  type        = bool
  default     = false
}

variable "skip_eks_cluster_stage" {
  description = "Set to true to skip the Provision-EKS-Cluster pipeline stage when the cluster already exists."
  type        = bool
  default     = false
}

variable "skip_infra_stages" {
  description = "Set to true to skip both Provision-EKS-Cluster and Provision-EKS-HelmResources stages. Use when infra is stable and only deployment is needed."
  type        = bool
  default     = false
}

variable "skip_build_stage" {
  description = "Set to true to skip the Build-Image stage. Pipeline goes Source → Infra → Deploy using the last successfully built image from S3."
  type        = bool
  default     = false
}

# -------------------------------------------------------
# Build Server
# -------------------------------------------------------
variable "build_server_type" {
  description = "CodeBuild image OS for all pipeline stages. 'ubuntu' (default) or 'amazonlinux'."
  type        = string
  default     = "ubuntu"
  validation {
    condition     = contains(["amazonlinux", "ubuntu"], var.build_server_type)
    error_message = "build_server_type must be 'ubuntu' or 'amazonlinux'."
  }
}
