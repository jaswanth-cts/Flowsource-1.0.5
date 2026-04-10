#!/bin/bash
# ============================================================
# FlowSource CI/CD - AWS Bootstrap Setup Script
# This script creates the foundational AWS resources that must
# exist BEFORE running the Terraform bootstrap pipeline.
#
# Run this ONCE from a local machine with AWS CLI configured
# and sufficient permissions.
#
# Usage:
#   chmod +x cicd/scripts/setup-aws-prerequisites.sh
#   ./cicd/scripts/setup-aws-prerequisites.sh
# ============================================================

set -euo pipefail

# -------------------------------------------------------
# CONFIGURATION — Update these values before running
# -------------------------------------------------------
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PROJECT_NAME="flowsource"
TF_STATE_BUCKET="${PROJECT_NAME}-tf-state-${AWS_ACCOUNT_ID}"
TF_DYNAMODB_TABLE="${PROJECT_NAME}-tf-locks"
CODEBUILD_ROLE_NAME="FlowSourceCodeBuildRole"
CODEPIPELINE_ROLE_NAME="FlowSourceCodePipelineRole"
SNS_TOPIC_NAME="${PROJECT_NAME}-approvals"

echo "=================================================="
echo " FlowSource CI/CD AWS Prerequisites Setup"
echo " Account: ${AWS_ACCOUNT_ID}"
echo " Region : ${AWS_REGION}"
echo "=================================================="
echo ""

# -------------------------------------------------------
# Step 1: Create S3 bucket for Terraform state + artifacts
# -------------------------------------------------------
echo "[1/7] Creating S3 bucket: ${TF_STATE_BUCKET}"
if aws s3api head-bucket --bucket "${TF_STATE_BUCKET}" 2>/dev/null; then
  echo "  Bucket already exists. Skipping."
else
  if [ "${AWS_REGION}" == "us-east-1" ]; then
    aws s3api create-bucket \
      --bucket "${TF_STATE_BUCKET}" \
      --region "${AWS_REGION}"
  else
    aws s3api create-bucket \
      --bucket "${TF_STATE_BUCKET}" \
      --region "${AWS_REGION}" \
      --create-bucket-configuration LocationConstraint="${AWS_REGION}"
  fi
  # Enable versioning for state file safety
  aws s3api put-bucket-versioning \
    --bucket "${TF_STATE_BUCKET}" \
    --versioning-configuration Status=Enabled
  # Enable server-side encryption
  aws s3api put-bucket-encryption \
    --bucket "${TF_STATE_BUCKET}" \
    --server-side-encryption-configuration '{
      "Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]
    }'
  # Block public access
  aws s3api put-public-access-block \
    --bucket "${TF_STATE_BUCKET}" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  echo "  Created: ${TF_STATE_BUCKET}"
fi

# -------------------------------------------------------
# Step 2: Create DynamoDB table for Terraform state locking
# -------------------------------------------------------
echo ""
echo "[2/7] Creating DynamoDB table: ${TF_DYNAMODB_TABLE}"
if aws dynamodb describe-table --table-name "${TF_DYNAMODB_TABLE}" --region "${AWS_REGION}" 2>/dev/null; then
  echo "  Table already exists. Skipping."
else
  aws dynamodb create-table \
    --table-name "${TF_DYNAMODB_TABLE}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${AWS_REGION}"
  echo "  Created: ${TF_DYNAMODB_TABLE}"
fi

# -------------------------------------------------------
# Step 3: Create IAM Role for CodeBuild
# -------------------------------------------------------
echo ""
echo "[3/7] Creating IAM Role: ${CODEBUILD_ROLE_NAME}"
CODEBUILD_TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "codebuild.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

if aws iam get-role --role-name "${CODEBUILD_ROLE_NAME}" 2>/dev/null; then
  echo "  Role already exists. Skipping."
else
  aws iam create-role \
    --role-name "${CODEBUILD_ROLE_NAME}" \
    --assume-role-policy-document "${CODEBUILD_TRUST_POLICY}" \
    --description "IAM Role for FlowSource CodeBuild projects"
  
  # Attach managed policies
  for POLICY in \
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess" \
    "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy" \
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy" \
    "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess" \
    "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess" \
    "arn:aws:iam::aws:policy/AmazonVPCReadOnlyAccess"; do
    aws iam attach-role-policy \
      --role-name "${CODEBUILD_ROLE_NAME}" \
      --policy-arn "${POLICY}"
  done
  
  # Inline policy for S3, STS, EKS, Terraform operations
  aws iam put-role-policy \
    --role-name "${CODEBUILD_ROLE_NAME}" \
    --policy-name "FlowSourceCodeBuildInlinePolicy" \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:GetObject","s3:PutObject","s3:DeleteObject",
            "s3:ListBucket","s3:GetBucketLocation"
          ],
          "Resource": [
            "arn:aws:s3:::'"${TF_STATE_BUCKET}"'",
            "arn:aws:s3:::'"${TF_STATE_BUCKET}"'/*"
          ]
        },
        {
          "Effect": "Allow",
          "Action": ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:DeleteItem"],
          "Resource": "arn:aws:dynamodb:'"${AWS_REGION}"':'"${AWS_ACCOUNT_ID}"':table/'"${TF_DYNAMODB_TABLE}"'"
        },
        {
          "Effect": "Allow",
          "Action": ["sts:AssumeRole","sts:GetCallerIdentity"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": [
            "eks:DescribeCluster","eks:ListClusters",
            "eks:UpdateKubeconfig","eks:AccessKubernetesApi"
          ],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
          ],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["ec2:DescribeVpcs","ec2:DescribeSubnets","ec2:DescribeSecurityGroups",
                     "ec2:DescribeNetworkInterfaces","ec2:CreateNetworkInterface",
                     "ec2:DeleteNetworkInterface","ec2:DescribeNetworkInterfaceAttribute"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["ssm:GetParameter","ssm:GetParameters","ssm:GetParametersByPath"],
          "Resource": "arn:aws:ssm:'"${AWS_REGION}"':'"${AWS_ACCOUNT_ID}"':parameter/flowsource/*"
        }
      ]
    }'
  echo "  Created: ${CODEBUILD_ROLE_NAME}"
  echo "  ARN: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${CODEBUILD_ROLE_NAME}"
fi

# -------------------------------------------------------
# Step 4: Create IAM Role for CodePipeline
# -------------------------------------------------------
echo ""
echo "[4/7] Creating IAM Role: ${CODEPIPELINE_ROLE_NAME}"
CODEPIPELINE_TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "codepipeline.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

if aws iam get-role --role-name "${CODEPIPELINE_ROLE_NAME}" 2>/dev/null; then
  echo "  Role already exists. Skipping."
else
  aws iam create-role \
    --role-name "${CODEPIPELINE_ROLE_NAME}" \
    --assume-role-policy-document "${CODEPIPELINE_TRUST_POLICY}" \
    --description "IAM Role for FlowSource CodePipeline"
  
  aws iam put-role-policy \
    --role-name "${CODEPIPELINE_ROLE_NAME}" \
    --policy-name "FlowSourceCodePipelineInlinePolicy" \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:GetObject","s3:PutObject","s3:GetBucketVersioning",
            "s3:GetObjectVersion","s3:ListBucket"
          ],
          "Resource": [
            "arn:aws:s3:::'"${TF_STATE_BUCKET}"'",
            "arn:aws:s3:::'"${TF_STATE_BUCKET}"'/*"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "codebuild:BatchGetBuilds","codebuild:StartBuild",
            "codebuild:BatchGetProjects"
          ],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["codestar-connections:UseConnection"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["codecommit:GetBranch","codecommit:GetCommit",
                     "codecommit:UploadArchive","codecommit:GetUploadArchiveStatus"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["sns:Publish"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["events:PutTargets","events:PutRule","events:DeleteTargets","events:RemoveTargets"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": "iam:PassRole",
          "Resource": "*"
        }
      ]
    }'
  echo "  Created: ${CODEPIPELINE_ROLE_NAME}"
  echo "  ARN: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${CODEPIPELINE_ROLE_NAME}"
fi

# -------------------------------------------------------
# Step 5: Create SNS Topic for approvals
# -------------------------------------------------------
echo ""
echo "[5/7] Creating SNS topic: ${SNS_TOPIC_NAME}"
SNS_ARN=$(aws sns create-topic --name "${SNS_TOPIC_NAME}" --region "${AWS_REGION}" --query TopicArn --output text)
echo "  SNS Topic ARN: ${SNS_ARN}"
echo "  IMPORTANT: Subscribe your approver email to this topic in AWS Console -> SNS"

# -------------------------------------------------------
# Step 6: Upload placeholder SSM parameter for tfvars S3 key
# -------------------------------------------------------
echo ""
echo "[6/7] Creating SSM parameter for infra tfvars S3 key"
aws ssm put-parameter \
  --name "/flowsource/cicd/infra-tfvars-s3-key" \
  --value "flowsource/config/infra/terraform.tfvars" \
  --type "String" \
  --region "${AWS_REGION}" \
  --overwrite 2>/dev/null || true
echo "  SSM Parameter: /flowsource/cicd/infra-tfvars-s3-key"

# -------------------------------------------------------
# Step 7: Create config S3 folder placeholders
# -------------------------------------------------------
echo ""
echo "[7/7] Creating S3 config folder structure"
for ENV in dev qa prod infra; do
  echo "  Creating placeholder for flowsource/config/${ENV}/"
  echo "" | aws s3 cp - s3://${TF_STATE_BUCKET}/flowsource/config/${ENV}/.gitkeep 2>/dev/null || true
done
echo ""
echo "=================================================="
echo " SETUP COMPLETE"
echo "=================================================="
echo ""
echo " NEXT STEPS:"
echo " 1. Upload your infra terraform.tfvars to S3:"
echo "    aws s3 cp FlowSource-infra-provision/aws/eks-flowsource-env/terraform.tfvars \\"
echo "      s3://${TF_STATE_BUCKET}/flowsource/config/infra/terraform.tfvars"
echo ""
echo " 2. Upload Helm values files for each environment:"
echo "    aws s3 cp cicd/config/dev-values.example.yaml \\"
echo "      s3://${TF_STATE_BUCKET}/flowsource/config/dev/values.yaml"
echo "    (also upload app-config.yaml and all-configurations.yaml for each env)"
echo ""
echo " 3. Create a GitHub CodeStar Connection (if using GitHub):"
echo "    AWS Console -> CodePipeline -> Settings -> Connections"
echo "    Note the Connection ARN for terraform.tfvars"
echo ""
echo " 4. Fill in cicd/bootstrap-codepipeline/terraform.example.tfvars"
echo "    and copy to terraform.tfvars"
echo ""
echo " 5. Run the bootstrap Terraform:"
echo "    cd cicd/bootstrap-codepipeline"
echo "    terraform init -backend-config=backend-config.hcl"
echo "    terraform plan -var-file=terraform.tfvars"
echo "    terraform apply -var-file=terraform.tfvars"
echo ""
echo " Resources created:"
echo "   S3 Bucket     : ${TF_STATE_BUCKET}"
echo "   DynamoDB Table: ${TF_DYNAMODB_TABLE}"
echo "   CodeBuild Role: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${CODEBUILD_ROLE_NAME}"
echo "   Pipeline Role : arn:aws:iam::${AWS_ACCOUNT_ID}:role/${CODEPIPELINE_ROLE_NAME}"
echo "   SNS Topic     : ${SNS_ARN}"
echo "=================================================="
