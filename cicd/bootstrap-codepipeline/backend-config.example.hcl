# ============================================================
# FlowSource CI/CD - Terraform Backend Configuration
# Use this file with:
#   terraform init -backend-config=backend-config.hcl
#
# NEVER commit this file with real values to source control.
# Add backend-config.hcl to .gitignore.
# ============================================================

bucket         = "flowsource-tf-state-<AWS_ACCOUNT_ID>"
key            = "cicd/bootstrap/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "flowsource-tf-locks"
encrypt        = true
