# ============================================================
# FlowSource AWS CI/CD - Bootstrap CodePipeline (Terraform)
# Creates the master CodePipeline with stages:
#   1. Source  - GitHub (via CodeStar Connection) or CodeCommit
#   2. Infra   - EKS Cluster + RDS provisioning
#   3. Build   - Docker image build + ECR push
#   4. Deploy DEV   - Helm deploy to DEV namespace
#   5. Approval     - Manual gate for QA/PROD
#   6. Deploy QA    - Helm deploy to QA namespace
#   7. Approval     - Manual gate for PROD only
#   8. Deploy PROD  - Helm deploy to PROD namespace
# ============================================================

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Filled by -backend-config or backend-config.hcl
     bucket         = "naiev1-impl-terraform"
     key            = "cicd/bootstrap/terraform.tfstate"
     region         = "us-east-1"
    # dynamodb_table = "<TF_DYNAMODB_TABLE>"
    # encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# -------------------------------------------------------
# Local helpers
# -------------------------------------------------------
locals {
  pipeline_name   = "${var.project_name}-master-pipeline"

  build_image_map = {
    amazonlinux = "aws/codebuild/amazonlinux2023-x86_64-standard:5.0"
    ubuntu      = "aws/codebuild/standard:7.0"
  }
  build_image = local.build_image_map[var.build_server_type]

  common_env_vars = [
    { name = "AWS_REGION",        value = var.aws_region,      type = "PLAINTEXT" },
    { name = "CLUSTER_NAME",      value = var.eks_cluster_name, type = "PLAINTEXT" },
    { name = "TF_STATE_BUCKET",   value = var.tf_state_bucket,  type = "PLAINTEXT" },
    { name = "TF_STATE_REGION",   value = var.aws_region,       type = "PLAINTEXT" },
    { name = "BUILD_ROLE_ARN", value = var.codebuild_service_role_arn, type = "PLAINTEXT" },
    { name = "ECR_REPO_NAME",     value = var.ecr_repo_name,    type = "PLAINTEXT" },
  ]
}

# -------------------------------------------------------
# ECR Repository for FlowSource images
# (only created if var.create_ecr_repo = true)
# -------------------------------------------------------
resource "aws_ecr_repository" "flowsource_ecr" {
  count                = var.create_ecr_repo ? 1 : 0
  name                 = var.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = var.tags
}

# -------------------------------------------------------
# S3 Bucket — Terraform state + CodePipeline artifacts
# (only created if var.create_tf_state_bucket = true)
# -------------------------------------------------------
resource "aws_s3_bucket" "tf_state" {
  count         = var.create_tf_state_bucket ? 1 : 0
  bucket        = var.tf_state_bucket
  force_destroy = false

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "tf_state" {
  count  = var.create_tf_state_bucket ? 1 : 0
  bucket = aws_s3_bucket.tf_state[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  count  = var.create_tf_state_bucket ? 1 : 0
  bucket = aws_s3_bucket.tf_state[0].id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tf_state" {
  count                   = var.create_tf_state_bucket ? 1 : 0
  bucket                  = aws_s3_bucket.tf_state[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -------------------------------------------------------
# CodeBuild: Infra Stage - EKS Cluster
# -------------------------------------------------------
resource "aws_codebuild_project" "infra_eks_cluster" {
  name          = "${var.project_name}-infra-eks-cluster"
  description   = "Provisions EKS Cluster and RDS for FlowSource"
  build_timeout = var.build_timeout_minutes
  service_role  = var.codebuild_service_role_arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "cicd/infra-pipeline/buildspec-infra-eks-cluster.yaml"
  }

  artifacts { type = "CODEPIPELINE" }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    dynamic "environment_variable" {
      for_each = local.common_env_vars
      content {
        name  = environment_variable.value.name
        value = environment_variable.value.value
        type  = environment_variable.value.type
      }
    }
    environment_variable {
      name  = "TF_STATE_KEY"
      value = "infra/eks-cluster/terraform.tfstate"
    }
    environment_variable {
      name  = "SKIP_EKS_CLUSTER"
      value = tostring(var.skip_eks_cluster_stage)
    }
  }

  dynamic "vpc_config" {
    for_each = var.use_vpc ? [1] : []
    content {
      vpc_id             = var.vpc_id
      subnets            = var.private_subnet_ids
      security_group_ids = var.codebuild_security_group_ids
    }
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}-infra-eks-cluster"
      status      = "ENABLED"
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# CodeBuild: Infra Stage - Helm Resources (CSI/ALB)
# -------------------------------------------------------
resource "aws_codebuild_project" "infra_helm_resources" {
  name          = "${var.project_name}-infra-helm-resources"
  description   = "Installs CSI Driver and ALB Controller on EKS"
  build_timeout = var.build_timeout_minutes
  service_role  = var.codebuild_service_role_arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "cicd/infra-pipeline/buildspec-infra-helm-resources.yaml"
  }

  artifacts { type = "CODEPIPELINE" }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    dynamic "environment_variable" {
      for_each = local.common_env_vars
      content {
        name  = environment_variable.value.name
        value = environment_variable.value.value
        type  = environment_variable.value.type
      }
    }
    environment_variable {
      name  = "TF_STATE_KEY"
      value = "infra/eks-helm-resources/terraform.tfstate"
    }
  }

  # MUST run in VPC to reach private EKS endpoint
  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = var.codebuild_security_group_ids
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}-infra-helm-resources"
      status      = "ENABLED"
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# CodeBuild: Build Stage - Docker Image
# -------------------------------------------------------
resource "aws_codebuild_project" "build_image" {
  name          = "${var.project_name}-build-image"
  description   = "Builds FlowSource Docker image and pushes to ECR"
  build_timeout = var.build_timeout_minutes
  service_role  = var.codebuild_service_role_arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "cicd/build-pipeline/buildspec-build-image.yaml"
  }

  artifacts { type = "CODEPIPELINE" }

  environment {
    compute_type                = "BUILD_GENERAL1_LARGE"
    image                       = local.build_image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true   # Required for Docker build

    environment_variable {
      name  = "BUILD_SERVER_TYPE"
      value = var.build_server_type
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "SKIP_BUILD"
      value = tostring(var.skip_build_stage)
      type  = "PLAINTEXT"
    }

    dynamic "environment_variable" {
      for_each = local.common_env_vars
      content {
        name  = environment_variable.value.name
        value = environment_variable.value.value
        type  = environment_variable.value.type
      }
    }
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}-build-image"
      status      = "ENABLED"
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# CodeBuild: Deploy DEV
# -------------------------------------------------------
resource "aws_codebuild_project" "deploy_dev" {
  name          = "${var.project_name}-deploy-dev"
  description   = "Deploys FlowSource to DEV EKS namespace"
  build_timeout = var.build_timeout_minutes
  service_role  = var.codebuild_service_role_arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "cicd/deploy-pipeline/buildspec-deploy-dev.yaml"
  }

  artifacts { type = "CODEPIPELINE" }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = local.build_image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    dynamic "environment_variable" {
      for_each = local.common_env_vars
      content {
        name  = environment_variable.value.name
        value = environment_variable.value.value
        type  = environment_variable.value.type
      }
    }
    environment_variable {
      name  = "BUILD_SERVER_TYPE"
      value = var.build_server_type
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "NAMESPACE"
      value = "flowsource-dev"
    }
    environment_variable {
      name  = "DEPLOYMENT_NAME"
      value = "flowsource-dev"
    }
    environment_variable {
      name  = "TF_STATE_KEY"
      value = "deploy/dev/terraform.tfstate"
    }
    environment_variable {
      name  = "VALUES_S3_PREFIX"
      value = "flowsource/config/dev"
    }
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = var.codebuild_security_group_ids
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}-deploy-dev"
      status      = "ENABLED"
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# CodeBuild: Deploy QA
# -------------------------------------------------------
resource "aws_codebuild_project" "deploy_qa" {
  count         = var.enable_qa_prod ? 1 : 0
  name          = "${var.project_name}-deploy-qa"
  description   = "Deploys FlowSource to QA EKS namespace"
  build_timeout = var.build_timeout_minutes
  service_role  = var.codebuild_service_role_arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "cicd/deploy-pipeline/buildspec-deploy-qa.yaml"
  }

  artifacts { type = "CODEPIPELINE" }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = local.build_image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    dynamic "environment_variable" {
      for_each = local.common_env_vars
      content {
        name  = environment_variable.value.name
        value = environment_variable.value.value
        type  = environment_variable.value.type
      }
    }
    environment_variable {
      name  = "BUILD_SERVER_TYPE"
      value = var.build_server_type
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "NAMESPACE"
      value = "flowsource-qa"
    }
    environment_variable {
      name  = "DEPLOYMENT_NAME"
      value = "flowsource-qa"
    }
    environment_variable {
      name  = "TF_STATE_KEY"
      value = "deploy/qa/terraform.tfstate"
    }
    environment_variable {
      name  = "VALUES_S3_PREFIX"
      value = "flowsource/config/qa"
    }
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = var.codebuild_security_group_ids
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}-deploy-qa"
      status      = "ENABLED"
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# CodeBuild: Deploy PROD
# -------------------------------------------------------
resource "aws_codebuild_project" "deploy_prod" {
  count         = var.enable_qa_prod ? 1 : 0
  name          = "${var.project_name}-deploy-prod"
  description   = "Deploys FlowSource to PROD EKS namespace"
  build_timeout = var.build_timeout_minutes
  service_role  = var.codebuild_service_role_arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "cicd/deploy-pipeline/buildspec-deploy-prod.yaml"
  }

  artifacts { type = "CODEPIPELINE" }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = local.build_image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    dynamic "environment_variable" {
      for_each = local.common_env_vars
      content {
        name  = environment_variable.value.name
        value = environment_variable.value.value
        type  = environment_variable.value.type
      }
    }
    environment_variable {
      name  = "BUILD_SERVER_TYPE"
      value = var.build_server_type
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "NAMESPACE"
      value = "flowsource"
    }
    environment_variable {
      name  = "DEPLOYMENT_NAME"
      value = "flowsource"
    }
    environment_variable {
      name  = "TF_STATE_KEY"
      value = "deploy/prod/terraform.tfstate"
    }
    environment_variable {
      name  = "VALUES_S3_PREFIX"
      value = "flowsource/config/prod"
    }
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = var.codebuild_security_group_ids
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}-deploy-prod"
      status      = "ENABLED"
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# Master CodePipeline
# -------------------------------------------------------
resource "aws_codepipeline" "flowsource_pipeline" {
  name          = local.pipeline_name
  role_arn      = var.codepipeline_service_role_arn
  pipeline_type = "V2"

  artifact_store {
    type     = "S3"
    location = var.tf_state_bucket
  }

  # ------- Stage 1: Source -------
  stage {
    name = "Source"

    dynamic "action" {
      for_each = var.source_provider == "GitHub" ? [1] : []
      content {
        name             = "Source-GitHub"
        category         = "Source"
        owner            = "AWS"
        provider         = "CodeStarSourceConnection"
        version          = "1"
        output_artifacts = ["source_output"]
        configuration = {
          ConnectionArn        = var.github_connection_arn
          FullRepositoryId     = "${var.github_owner}/${var.repository_name}"
          BranchName           = var.branch_name
          OutputArtifactFormat = "CODE_ZIP"
          DetectChanges        = "true"
        }
      }
    }

    dynamic "action" {
      for_each = var.source_provider == "CodeCommit" ? [1] : []
      content {
        name             = "Source-CodeCommit"
        category         = "Source"
        owner            = "AWS"
        provider         = "CodeCommit"
        version          = "1"
        output_artifacts = ["source_output"]
        configuration = {
          RepositoryName = var.repository_name
          BranchName     = var.branch_name
          PollForSourceChanges = "false"
        }
      }
    }
  }

  # ------- Stage 2: Infra - EKS Cluster (skipped when skip_eks_cluster_stage = true OR skip_infra_stages = true) -------
  dynamic "stage" {
    for_each = (var.skip_eks_cluster_stage || var.skip_infra_stages) ? [] : [1]
    content {
      name = "Provision-EKS-Cluster"

      action {
        name             = "Terraform-EKS-Cluster"
        category         = "Build"
        owner            = "AWS"
        provider         = "CodeBuild"
        version          = "1"
        input_artifacts  = ["source_output"]
        output_artifacts = ["infra_cluster_output"]
        configuration = {
          ProjectName = aws_codebuild_project.infra_eks_cluster.name
        }
        run_order = 1
      }
    }
  }

  # ------- Stage 3: Infra - Helm Resources (skipped when skip_infra_stages = true) -------
  dynamic "stage" {
    for_each = var.skip_infra_stages ? [] : [1]
    content {
      name = "Provision-EKS-HelmResources"

      action {
        name             = "Terraform-Helm-Resources"
        category         = "Build"
        owner            = "AWS"
        provider         = "CodeBuild"
        version          = "1"
        input_artifacts  = ["source_output"]
        output_artifacts = ["infra_helm_output"]
        configuration = {
          ProjectName = aws_codebuild_project.infra_helm_resources.name
        }
        run_order = 1
      }
    }
  }

  # ------- Stage 4: Build Docker Image (skipped when skip_build_stage = true) -------
  dynamic "stage" {
    for_each = var.skip_build_stage ? [] : [1]
    content {
      name = "Build-Image"

      action {
        name             = "Build-Docker-Image"
        category         = "Build"
        owner            = "AWS"
        provider         = "CodeBuild"
        version          = "1"
        input_artifacts  = ["source_output"]
        output_artifacts = ["build_output"]
        configuration = {
          ProjectName = aws_codebuild_project.build_image.name
        }
        run_order = 1
      }
    }
  }

  # ------- Stage 5: Deploy DEV -------
  stage {
    name = "Deploy-DEV"

    action {
      name             = "Helm-Deploy-DEV"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["deploy_dev_output"]
      configuration = {
        ProjectName = aws_codebuild_project.deploy_dev.name
      }
      run_order = 1
    }
  }

  # ------- Stage 6: Manual Approval for QA (disabled when enable_qa_prod = false) -------
  dynamic "stage" {
    for_each = var.enable_qa_prod ? [1] : []
    content {
      name = "Approve-QA-Deployment"

      action {
        name     = "Approve-QA"
        category = "Approval"
        owner    = "AWS"
        provider = "Manual"
        version  = "1"
        configuration = {
          NotificationArn    = var.approval_sns_topic_arn
          CustomData         = "Please review DEV deployment and approve to promote to QA."
          ExternalEntityLink = var.flowsource_dev_url
        }
      }
    }
  }

  # ------- Stage 7: Deploy QA (disabled when enable_qa_prod = false) -------
  dynamic "stage" {
    for_each = var.enable_qa_prod ? [1] : []
    content {
      name = "Deploy-QA"

      action {
        name             = "Helm-Deploy-QA"
        category         = "Build"
        owner            = "AWS"
        provider         = "CodeBuild"
        version          = "1"
        input_artifacts  = ["source_output"]
        output_artifacts = ["deploy_qa_output"]
        configuration = {
          ProjectName = aws_codebuild_project.deploy_qa[0].name
        }
        run_order = 1
      }
    }
  }

  # ------- Stage 8: Manual Approval for PROD (disabled when enable_qa_prod = false) -------
  dynamic "stage" {
    for_each = var.enable_qa_prod ? [1] : []
    content {
      name = "Approve-PROD-Deployment"

      action {
        name     = "Approve-PROD"
        category = "Approval"
        owner    = "AWS"
        provider = "Manual"
        version  = "1"
        configuration = {
          NotificationArn    = var.approval_sns_topic_arn
          CustomData         = "Please review QA deployment and approve for PRODUCTION release."
          ExternalEntityLink = var.flowsource_qa_url
        }
      }
    }
  }

  # ------- Stage 9: Deploy PROD (disabled when enable_qa_prod = false) -------
  dynamic "stage" {
    for_each = var.enable_qa_prod ? [1] : []
    content {
      name = "Deploy-PROD"

      action {
        name             = "Helm-Deploy-PROD"
        category         = "Build"
        owner            = "AWS"
        provider         = "CodeBuild"
        version          = "1"
        input_artifacts  = ["source_output"]
        output_artifacts = ["deploy_prod_output"]
        configuration = {
          ProjectName = aws_codebuild_project.deploy_prod[0].name
        }
        run_order = 1
      }
    }
  }

  tags = var.tags
}

# -------------------------------------------------------
# EventBridge Rule: Auto-trigger pipeline on CodeCommit push
# (Only used when source_provider = "CodeCommit")
# -------------------------------------------------------
resource "aws_cloudwatch_event_rule" "codecommit_trigger" {
  count       = var.source_provider == "CodeCommit" ? 1 : 0
  name        = "${var.project_name}-codecommit-push"
  description = "Trigger FlowSource pipeline on CodeCommit push to ${var.branch_name}"

  event_pattern = jsonencode({
    source      = ["aws.codecommit"]
    detail-type = ["CodeCommit Repository State Change"]
    resources   = ["arn:aws:codecommit:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${var.repository_name}"]
    detail = {
      event         = ["referenceUpdated", "referenceCreated"]
      referenceType = ["branch"]
      referenceName = [var.branch_name]
    }
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "codecommit_pipeline_target" {
  count     = var.source_provider == "CodeCommit" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.codecommit_trigger[0].name
  target_id = "FlowSourcePipeline"
  arn       = aws_codepipeline.flowsource_pipeline.arn
  role_arn  = var.codepipeline_service_role_arn
}

data "aws_caller_identity" "current" {}
