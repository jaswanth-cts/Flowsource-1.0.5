resource "aws_ecr_repository" "ecr_repo" {
  name                 = var.ecr_repo_name
  image_tag_mutability = "MUTABLE"
  encryption_configuration {
    encryption_type = "AES256"
  }
}

output "ecr_repository_name" {
  description = "The name of the ECR repository"
  value       = aws_ecr_repository.ecr_repo.name
  # example     = test-alm-repo
}

output "ecr_repository_uri" {
  description = "The URI of the ECR repository"
  value       = aws_ecr_repository.ecr_repo.repository_url
  # example     = "<account_id>.dkr.ecr.<region>.amazonaws.com/<ecr_repo_name>"
}

output "ecr_repository_arn" {
  description = "The ARN of the ECR repository"
  value       = aws_ecr_repository.ecr_repo.arn
  # example     = "arn:aws:ecr:<region>:<account_id>:repository/<ecr_repo_name>"
}
