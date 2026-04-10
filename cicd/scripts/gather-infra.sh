#!/bin/bash
# ============================================================
# FlowSource Infrastructure Gather Script
# Run from AWS CloudShell in the target account.
# Output saved to: flowsource-infra-report-<account>-<date>.txt
# Usage: chmod +x gather-infra.sh && ./gather-infra.sh
# ============================================================

set -euo pipefail

REGION="ap-south-1"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
OUTPUT_FILE="flowsource-infra-report-${ACCOUNT}-$(date +%Y%m%d-%H%M%S).txt"

log() {
  echo "$@" | tee -a "$OUTPUT_FILE"
}

section() {
  log ""
  log "========================================"
  log "  $1"
  log "========================================"
}

run_cmd() {
  LABEL="$1"
  shift
  section "$LABEL"
  "$@" 2>&1 | tee -a "$OUTPUT_FILE" || log "  [not found or insufficient permissions]"
}

log "FlowSource Infrastructure Report"
log "Account : $ACCOUNT"
log "Region  : $REGION"
log "Date    : $(date)"
log "========================================"

# -------------------------------------------------------
# Caller Identity
# -------------------------------------------------------
run_cmd "CALLER IDENTITY" \
  aws sts get-caller-identity

# -------------------------------------------------------
# IAM Roles
# -------------------------------------------------------
ROLES="naiev1-dev-codebuild-role naiev1-dev-codepipeline-role flowsource-sa-role AmazonEKSLoadBalancerControllerRole-fs-cluster-1"

for ROLE in $ROLES; do
  section "IAM ROLE: $ROLE"

  log "-- Trust Policy & ARN --"
  aws iam get-role \
    --role-name "$ROLE" \
    --query 'Role.{ARN:Arn,Trust:AssumeRolePolicyDocument}' \
    --output json 2>&1 | tee -a "$OUTPUT_FILE" || log "  [role not found]"

  log ""
  log "-- Attached Managed Policies --"
  aws iam list-attached-role-policies \
    --role-name "$ROLE" \
    --query 'AttachedPolicies[]' \
    --output table 2>&1 | tee -a "$OUTPUT_FILE" || log "  [none]"

  log ""
  log "-- Inline Policies --"
  INLINE_POLICIES=$(aws iam list-role-policies \
    --role-name "$ROLE" \
    --query 'PolicyNames[]' \
    --output text 2>/dev/null || true)

  if [ -z "$INLINE_POLICIES" ]; then
    log "  [none]"
  else
    for P in $INLINE_POLICIES; do
      log "  Policy: $P"
      aws iam get-role-policy \
        --role-name "$ROLE" \
        --policy-name "$P" \
        --query 'PolicyDocument' \
        --output json 2>&1 | tee -a "$OUTPUT_FILE"
    done
  fi
done

# -------------------------------------------------------
# S3
# -------------------------------------------------------
run_cmd "S3 BUCKET VERSIONING" \
  aws s3api get-bucket-versioning --bucket flowsource-tf-state-fs105

run_cmd "S3 BUCKET ENCRYPTION" \
  aws s3api get-bucket-encryption --bucket flowsource-tf-state-fs105

run_cmd "S3 BUCKET CONTENTS" \
  aws s3 ls s3://flowsource-tf-state-fs105 --recursive --human-readable --summarize

# -------------------------------------------------------
# ECR
# -------------------------------------------------------
run_cmd "ECR REPOSITORY" \
  aws ecr describe-repositories \
    --repository-names flowsource105 \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# Secrets Manager
# -------------------------------------------------------
run_cmd "SECRETS MANAGER - describe" \
  aws secretsmanager describe-secret \
    --secret-id flowsource-app-secrets \
    --region "$REGION"

run_cmd "SECRETS MANAGER - versions" \
  aws secretsmanager list-secret-version-ids \
    --secret-id flowsource-app-secrets \
    --region "$REGION"

# -------------------------------------------------------
# SSM Parameters
# -------------------------------------------------------
run_cmd "SSM PARAMETERS" \
  aws ssm get-parameters-by-path \
    --path "/flowsource/" \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# CodePipeline
# -------------------------------------------------------
run_cmd "CODEPIPELINE" \
  aws codepipeline get-pipeline \
    --name flowsource105-master-pipeline \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# CodeBuild
# -------------------------------------------------------
run_cmd "CODEBUILD PROJECTS" \
  aws codebuild batch-get-projects \
    --names \
      flowsource105-infra-eks-cluster \
      flowsource105-infra-helm-resources \
      flowsource105-build-image \
      flowsource105-deploy-dev \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# CodeStar Connections
# -------------------------------------------------------
run_cmd "CODESTAR CONNECTIONS" \
  aws codestar-connections list-connections \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# SNS
# -------------------------------------------------------
run_cmd "SNS TOPICS" \
  aws sns list-topics \
    --region "$REGION" \
    --output json

run_cmd "SNS SUBSCRIPTIONS - flowsource-approvals" \
  aws sns list-subscriptions-by-topic \
    --topic-arn "arn:aws:sns:${REGION}:${ACCOUNT}:flowsource-approvals"

# -------------------------------------------------------
# ACM
# -------------------------------------------------------
run_cmd "ACM CERTIFICATES" \
  aws acm list-certificates \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# VPC / Networking
# -------------------------------------------------------
run_cmd "VPC" \
  aws ec2 describe-vpcs \
    --vpc-ids vpc-07ce784950e1d1b96 \
    --region "$REGION" \
    --output json

run_cmd "SUBNETS" \
  aws ec2 describe-subnets \
    --subnet-ids subnet-014652a06f09c9288 subnet-0d42dfd82eef04a9e \
    --region "$REGION" \
    --output json

run_cmd "SECURITY GROUP" \
  aws ec2 describe-security-groups \
    --group-ids sg-0494bcb3e1a0eb840 \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# EKS
# -------------------------------------------------------
run_cmd "EKS CLUSTER" \
  aws eks describe-cluster \
    --name fs-cluster-1 \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# Cognito
# -------------------------------------------------------
run_cmd "COGNITO USER POOL" \
  aws cognito-idp describe-user-pool \
    --user-pool-id ap-south-1_hhcovUJqC \
    --region "$REGION" \
    --output json

run_cmd "COGNITO APP CLIENT" \
  aws cognito-idp describe-user-pool-client \
    --user-pool-id ap-south-1_hhcovUJqC \
    --client-id 6222lhli3e0c45h9kp2utc2bos \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# RDS
# -------------------------------------------------------
run_cmd "RDS CLUSTERS" \
  aws rds describe-db-clusters \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# CloudWatch Log Groups
# -------------------------------------------------------
run_cmd "CLOUDWATCH LOG GROUPS" \
  aws logs describe-log-groups \
    --log-group-name-prefix "/aws/codebuild/flowsource105" \
    --region "$REGION" \
    --output json

# -------------------------------------------------------
# Done
# -------------------------------------------------------
log ""
log "========================================"
log "Report complete."
log "File: $OUTPUT_FILE"
log "Download: CloudShell Actions > Download file > $OUTPUT_FILE"
log "========================================"
