# ============================================================
# FlowSource AWS CI/CD - Bootstrap Terraform Outputs
# ============================================================

output "codepipeline_name" {
  description = "Name of the created AWS CodePipeline"
  value       = aws_codepipeline.flowsource_pipeline.name
}

output "codepipeline_arn" {
  description = "ARN of the created AWS CodePipeline"
  value       = aws_codepipeline.flowsource_pipeline.arn
}

output "ecr_repository_uri" {
  description = "URI of the ECR repository"
  value       = var.create_ecr_repo ? aws_ecr_repository.flowsource_ecr[0].repository_url : "ECR repo not managed by this Terraform"
}

output "codebuild_infra_cluster_project" {
  description = "CodeBuild project name for EKS cluster provisioning"
  value       = aws_codebuild_project.infra_eks_cluster.name
}

output "codebuild_infra_helm_project" {
  description = "CodeBuild project name for Helm resources (CSI/ALB)"
  value       = aws_codebuild_project.infra_helm_resources.name
}

output "codebuild_build_image_project" {
  description = "CodeBuild project name for Docker image build"
  value       = aws_codebuild_project.build_image.name
}

output "codebuild_deploy_dev_project" {
  description = "CodeBuild project name for DEV deployment"
  value       = aws_codebuild_project.deploy_dev.name
}

output "codebuild_deploy_qa_project" {
  description = "CodeBuild project name for QA deployment"
  value       = var.enable_qa_prod ? aws_codebuild_project.deploy_qa[0].name : "QA disabled"
}

output "codebuild_deploy_prod_project" {
  description = "CodeBuild project name for PROD deployment"
  value       = var.enable_qa_prod ? aws_codebuild_project.deploy_prod[0].name : "PROD disabled"
}
