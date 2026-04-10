#!/bin/bash
# ============================================================
# FlowSource CI/CD - Upload Values Files to S3
# Run this script to upload/update the Helm values files
# for each environment to the central S3 bucket.
# These files are consumed by the deploy pipeline stages.
#
# Usage:
#   ./cicd/scripts/upload-config-to-s3.sh <env> <s3-bucket> <aws-region>
#   ./cicd/scripts/upload-config-to-s3.sh dev flowsource-tf-state-123456789 us-east-1
# ============================================================

set -euo pipefail

ENV="${1:-}"
S3_BUCKET="${2:-}"
AWS_REGION="${3:-us-east-1}"

if [ -z "${ENV}" ] || [ -z "${S3_BUCKET}" ]; then
  echo "Usage: $0 <env> <s3-bucket> [aws-region]"
  echo "  env: dev | qa | prod"
  echo "  s3-bucket: Your Terraform state S3 bucket"
  exit 1
fi

if [[ ! "${ENV}" =~ ^(dev|qa|prod)$ ]]; then
  echo "ERROR: env must be one of: dev, qa, prod"
  exit 1
fi

S3_PREFIX="flowsource/config/${ENV}"
CONFIG_DIR="cicd/config"

echo "=================================================="
echo " Uploading ${ENV} config files to S3"
echo " Bucket : ${S3_BUCKET}"
echo " Prefix : ${S3_PREFIX}"
echo "=================================================="

# Check required files exist
REQUIRED_FILES=("values.yaml" "app-config.yaml" "all-configurations.yaml")
for FILE in "${REQUIRED_FILES[@]}"; do
  LOCAL_PATH="${CONFIG_DIR}/${ENV}/${FILE}"
  if [ ! -f "${LOCAL_PATH}" ]; then
    echo "WARNING: ${LOCAL_PATH} not found. Create it from the example files in cicd/config/"
    echo "  Example: copy cicd/config/dev-values.example.yaml -> cicd/config/dev/values.yaml"
  else
    echo "Uploading ${LOCAL_PATH} -> s3://${S3_BUCKET}/${S3_PREFIX}/${FILE}"
    aws s3 cp "${LOCAL_PATH}" "s3://${S3_BUCKET}/${S3_PREFIX}/${FILE}" --region "${AWS_REGION}"
  fi
done

echo ""
echo "Done. Files are available in S3 for the deploy pipeline."
echo ""
echo "To upload infra terraform.tfvars:"
echo "  aws s3 cp FlowSource-infra-provision/aws/eks-flowsource-env/terraform.tfvars \\"
echo "    s3://${S3_BUCKET}/flowsource/config/infra/terraform.tfvars"
