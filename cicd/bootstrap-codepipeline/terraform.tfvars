# ============================================================
# FlowSource CI/CD Bootstrap - Example terraform.tfvars
# Copy this file to terraform.tfvars and fill in your values.
# NEVER commit terraform.tfvars to source control.
# ============================================================

# AWS Region
aws_region = "ap-south-1"

# Project prefix — used to name all created AWS resources
project_name = "flowsource105"

# EKS cluster name (must match what is in the infra terraform.tfvars)
eks_cluster_name = "fs-cluster-1"

# ECR repository for FlowSource Docker images
ecr_repo_name   = "flowsource105"
create_ecr_repo = true   # set false if repo already exists

# -------------------------------------------------------
# Terraform Remote State
# -------------------------------------------------------
# S3 bucket that stores terraform.tfstate AND pipeline artifacts.
# The same bucket is used by all pipeline stages.
tf_state_bucket        = "flowsource-tf-state-fs105"
create_tf_state_bucket = true    # set false if bucket already exists
tf_dynamodb_table      = ""      # DynamoDB locking disabled — S3 state only

# -------------------------------------------------------
# Source Control
# -------------------------------------------------------
# Use "GitHub" or "CodeCommit"
source_provider = "GitHub"

# GitHub settings (ignored when source_provider = "CodeCommit")
github_owner          = "Cognizant-NeuroAI-Implementation"
repository_name       = "FlowSource105"
branch_name           = "main"
github_connection_arn = "arn:aws:codeconnections:ap-south-1:831250773429:connection/9c444bd4-3e11-44a0-8c7d-54fb4b0b2e4b"

# CodeCommit settings (ignored when source_provider = "GitHub")
# repository_name = "FlowSource105"
# branch_name    = "main"

# -------------------------------------------------------
# IAM Roles (must be pre-created - see PREREQUISITES doc)
# -------------------------------------------------------
codebuild_service_role_arn    = "arn:aws:iam::831250773429:role/naiev1-dev-codebuild-role"
codepipeline_service_role_arn = "arn:aws:iam::831250773429:role/naiev1-dev-codepipeline-role"

# -------------------------------------------------------
# VPC (required for private EKS cluster access)
# -------------------------------------------------------
use_vpc = true
vpc_id  = "vpc-07ce784950e1d1b96"

# Private subnets — must have NAT gateway outbound access for internet (ECR, S3, etc.)
private_subnet_ids = ["subnet-014652a06f09c9288", "subnet-0d42dfd82eef04a9e"]

# Security group for CodeBuild — allow outbound internet + EKS API access
codebuild_security_group_ids = ["sg-0494bcb3e1a0eb840"]

# -------------------------------------------------------
# Approval / Notifications
# -------------------------------------------------------
# SNS topic ARN for manual approval emails (leave "" to disable email)
approval_sns_topic_arn = ""

# Public-facing (or ALB) URL of DEV and QA environments for the approval email
flowsource_dev_url = ""
flowsource_qa_url  = ""

# -------------------------------------------------------
# Build Settings
# -------------------------------------------------------
build_timeout_minutes = 60

# Set to true when ready to enable QA and PROD pipeline stages
enable_qa_prod = false

# Set to true to skip the Provision-EKS-Cluster pipeline stage (existing cluster in use)
skip_eks_cluster_stage = true

# Set to true to skip both Infra stages (EKS + Helm resources) — use when infra is stable
skip_infra_stages = true

# Set to true to skip the Build-Image stage — pipeline goes Source → Deploy using last built image
skip_build_stage = true

# -------------------------------------------------------
# Tags
# -------------------------------------------------------
tags = {
  Project     = "FlowSource105"
  ManagedBy   = "Terraform"
  Environment = "cicd"
  Owner       = "DevOps"
}
