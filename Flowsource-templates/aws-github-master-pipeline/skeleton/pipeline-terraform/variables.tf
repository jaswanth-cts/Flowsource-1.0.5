variable "region" {
  description = "The AWS region to create resources in."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The name of the CodeBuild project."
  type        = string
}

variable "build_timeout" {
  description = "The build timeout for the CodeBuild project."
  type        = number
  default     = 60
}

variable "buildspec" {
  description = "The buildspec for the CodeBuild project."
  type        = string
}

variable "image" {
  description = "The image for the CodeBuild project environment."
  type        = string
}

variable "codebuild_service_role_arn" {
  description = "The ARN of the IAM role that AWS CodeBuild will use."
  type        = string
}

variable "codepipeline_service_role_arn" {
  description = "The ARN of the IAM role that AWS CodePipeline will use."
  type        = string
}

variable "pipeline_name" {
  description = "The name of the CodePipeline."
  type        = string
}

variable "s3_bucket" {
  description = "The S3 bucket for storing CodePipeline artifacts."
  type        = string
}

variable "github_owner" {
  description = "GitHub Owner (Organization)"
  type        = string
}

variable "github_connection_arn" {
  description = "GitHub Connection ARN"
  type        = string
}

variable "repository_name" {
  description = "The name of the GitHub Repository."
  type        = string
}

variable "branch_name" {
  description = "The branch name of the GitHub Repository."
  type        = string
}

variable "build_project_name" {
  description = "The name of the CodeBuild project."
  type        = string
}

variable "use_vpc" {
  description = "Flag to indicate whether to deploy the CodeBuild project within a VPC."
  type        = bool
  default     = false
}

variable "vpc_config" {
  description = "Configuration for the VPC if used."
  type = object({
    vpc_id             = string
    subnets            = list(string)
    security_group_ids = list(string)
  })
  default = {
    vpc_id             = ""
    subnets            = []
    security_group_ids = []
  }
}

variable "ecr_repo_name" {
  description = "The name of the ECR Repository."
  type        = string
}
