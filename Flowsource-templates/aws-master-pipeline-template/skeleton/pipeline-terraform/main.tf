provider "aws" {
  region = var.region
}

resource "aws_codebuild_project" "codebuild_project" {
  name          = var.project_name
  description   = "CodeBuild project for ${var.project_name}"
  build_timeout = var.build_timeout

  source {
    type      = "CODEPIPELINE"
    buildspec = var.buildspec
  }

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = var.image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  service_role = var.codebuild_service_role_arn

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.project_name}"
      stream_name = "${var.project_name}-log"
      status      = "ENABLED"
    }

    s3_logs {
      status = "DISABLED"
    }
  }

  dynamic "vpc_config" {
    for_each = var.use_vpc ? [1] : []
    content {
      vpc_id             = var.vpc_config.vpc_id
      subnets            = var.vpc_config.subnets
      security_group_ids = var.vpc_config.security_group_ids
    }
  }
}

resource "aws_codepipeline" "codepipeline" {
  name          = var.pipeline_name
  role_arn      = var.codepipeline_service_role_arn
  pipeline_type = "V2"

  artifact_store {
    type     = "S3"
    location = var.s3_bucket
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeCommit"
      version          = "1"
      output_artifacts = ["source_output"]
      configuration = {
        RepositoryName = var.repository_name
        BranchName     = var.branch_name
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      configuration = {
        ProjectName = var.project_name
      }
    }
  }
}
