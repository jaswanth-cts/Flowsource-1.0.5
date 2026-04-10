# FlowSource AWS CI/CD Pipeline — Complete Reference Guide

> **Document Version:** 1.0.0 | **FlowSource Version:** 1.0.5 | **Date:** March 2026  
> **Cloud Provider:** Amazon Web Services (AWS)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)  
2. [CI/CD Folder Structure](#2-cicd-folder-structure)  
3. [Pipeline Stages Explained](#3-pipeline-stages-explained)  
4. [Pre-Requisites](#4-pre-requisites)  
   - 4.1 [AWS Resources — Manual Console Steps](#41-aws-resources--manual-console-steps)  
   - 4.2 [Networking Pre-Requisites](#42-networking-pre-requisites)  
   - 4.3 [IAM Roles & Permissions](#43-iam-roles--permissions)  
   - 4.4 [Secrets Manager](#44-secrets-manager)  
   - 4.5 [Tools Required Locally](#45-tools-required-locally)  
5. [First-Time Setup — Step by Step](#5-first-time-setup--step-by-step)  
6. [How Commits Trigger the Pipeline](#6-how-commits-trigger-the-pipeline)  
7. [New Version Release — What to Do](#7-new-version-release--what-to-do)  
8. [Configuration Files Reference](#8-configuration-files-reference)  
9. [Troubleshooting](#9-troubleshooting)  

---

## 1. Architecture Overview

The FlowSource CI/CD pipeline for AWS automates all three phases of delivery:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS CodePipeline                                  │
│                                                                     │
│  ┌──────────┐  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │  Source  │  │  Infra Provision    │  │    Build               │ │
│  │          │  │                     │  │                        │ │
│  │ GitHub / │─▶│ Stage 1: EKS + RDS  │─▶│ Docker build + ECR    │ │
│  │CodeCommit│  │ Stage 2: CSI + ALB  │  │ push (version.txt)    │ │
│  └──────────┘  └─────────────────────┘  └────────────────────────┘ │
│                                                    │                │
│  ┌─────────────────────────────────────────────────▼──────────────┐ │
│  │                  Deploy Stages                                  │ │
│  │                                                                 │ │
│  │  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐         │ │
│  │  │Deploy DEV│─▶│Approve  │─▶│Deploy QA │─▶│Approve  │─▶PROD   │ │
│  │  │(auto)    │  │for QA   │  │(auto)    │  │for PROD │         │ │
│  │  └──────────┘  └─────────┘  └──────────┘  └─────────┘         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Version-driven** | Image tag is read from `FlowSourceInstaller/version/version.txt` — bump the version to trigger a new build |
| **Generic & reusable** | All buildspecs reference files by path; new releases just need a version bump |
| **State isolation** | Each pipeline stage stores Terraform state in a separate S3 key |
| **Secure** | Values files (secrets) are stored in S3, not in source control; secrets injected via AWS Secrets Manager |
| **Environment gates** | Manual approval between DEV→QA and QA→PROD |
| **VPC-aware** | CodeBuild runs inside the VPC to access the private EKS endpoint |

---

## 2. CI/CD Folder Structure

```
cicd/
├── .gitignore                                # Excludes tfvars, state files, actual config
│
├── infra-pipeline/
│   ├── buildspec-infra-eks-cluster.yaml      # Stage: Provision EKS cluster + RDS (Terraform)
│   └── buildspec-infra-helm-resources.yaml   # Stage: Install CSI Driver + ALB Controller (Helm)
│
├── build-pipeline/
│   └── buildspec-build-image.yaml            # Stage: Build Docker image + push to ECR
│
├── deploy-pipeline/
│   ├── buildspec-deploy-dev.yaml             # Stage: Helm deploy to DEV namespace
│   ├── buildspec-deploy-qa.yaml              # Stage: Helm deploy to QA namespace
│   └── buildspec-deploy-prod.yaml            # Stage: Helm deploy to PROD namespace
│
├── bootstrap-codepipeline/
│   ├── main.tf                               # Creates all CodeBuild projects + CodePipeline
│   ├── variables.tf                          # Variable declarations
│   ├── outputs.tf                            # Pipeline/project ARNs and names
│   ├── terraform.example.tfvars             # Template — copy and fill in values
│   └── backend-config.example.hcl           # S3 backend config template
│
├── config/
│   ├── dev-values.example.yaml              # DEV Helm values template
│   ├── prod-values.example.yaml             # PROD Helm values template
│   ├── dev/                                 # Actual dev values (NOT committed — in S3)
│   ├── qa/                                  # Actual qa values (NOT committed — in S3)
│   └── prod/                                # Actual prod values (NOT committed — in S3)
│
└── scripts/
    ├── setup-aws-prerequisites.sh           # One-time AWS resource bootstrap
    ├── update-version.sh                    # Bump version + git push to trigger pipeline
    └── upload-config-to-s3.sh              # Upload Helm values files to S3
```

### Referenced Source Folders (Not Copied — Referenced In-Place)

| Folder | Used By |
|--------|---------|
| `FlowSource-infra-provision/aws/eks-flowsource-env/` | `buildspec-infra-eks-cluster.yaml` |
| `FlowSource-infra-provision/aws/eks-flowsource-resources-helm/` | `buildspec-infra-helm-resources.yaml` |
| `configuration/Dockerfile` | `buildspec-build-image.yaml` |
| `FlowSourceInstaller/version/version.txt` | `buildspec-build-image.yaml` (reads image tag) |
| `FlowSourceInstaller/helm-chart/` | `buildspec-deploy-*.yaml` (Helm chart source) |
| `FlowSourceInstaller/terraform-scripts/` | `buildspec-deploy-*.yaml` (Helm deploy via Terraform) |

---

## 3. Pipeline Stages Explained

### Stage 1 — Source
- **Trigger:** Push to the configured branch (`main` by default)
- **GitHub source:** Uses AWS CodeStar Connection (OAuth app — set up once in Console)
- **CodeCommit source:** Uses EventBridge rule (created automatically by Terraform)
- **Output:** Full source code zip passed to downstream stages

### Stage 2 — Provision EKS Cluster (`buildspec-infra-eks-cluster.yaml`)
- Runs `terraform apply` on `FlowSource-infra-provision/aws/eks-flowsource-env/`
- Creates: EKS Cluster, EKS Node Group, RDS PostgreSQL, Security Groups
- Reads `terraform.tfvars` from S3 (pre-uploaded)
- Stores Terraform state in S3 at key `infra/eks-cluster/terraform.tfstate`
- **Idempotent:** Safe to re-run; only changes what has changed

### Stage 3 — Provision Helm Resources (`buildspec-infra-helm-resources.yaml`)
- Runs `terraform apply` on `FlowSource-infra-provision/aws/eks-flowsource-resources-helm/`
- Installs: AWS Secrets Store CSI Driver, CSI Provider for AWS, ALB Ingress Controller
- **Runs inside VPC** (private EKS endpoint access required)
- State stored at `infra/eks-helm-resources/terraform.tfstate`

### Stage 4 — Build Docker Image (`buildspec-build-image.yaml`)
- Reads version from `FlowSourceInstaller/version/version.txt` (e.g., `flowsource:1.0.5`)
- Builds Docker image using `configuration/Dockerfile` with full repo as context
- Tags image as both `<version>` and `latest`
- Pushes to ECR repository
- Writes `imageDetail.json` to S3 for downstream stages

### Stage 5 — Deploy DEV (`buildspec-deploy-dev.yaml`)
- Downloads values files from `s3://<bucket>/flowsource/config/dev/`
- Uses `FlowSourceInstaller/terraform-scripts/` with `FlowSourceInstaller/helm-chart/` as chart
- Deploys to Kubernetes namespace `flowsource-dev`
- Auto-triggers after build stage completes

### Stage 6 — Approval Gate (DEV → QA)
- Sends email notification to SNS subscribers
- An approver reviews the DEV deployment and clicks Approve/Reject in AWS Console

### Stage 7 — Deploy QA (`buildspec-deploy-qa.yaml`)
- Same as DEV but deploys to `flowsource-qa` namespace with QA-specific values

### Stage 8 — Approval Gate (QA → PROD)
- Second manual gate before production

### Stage 9 — Deploy PROD (`buildspec-deploy-prod.yaml`)
- Deploys to `flowsource` (production) namespace with PROD-specific values
- Higher replica count (2+), HTTPS/OIDC configured on ALB

---

## 4. Pre-Requisites

### 4.1 AWS Resources — Manual Console Steps

The following resources **MUST be created manually** before running any pipeline. They cannot be created by the pipeline itself.

#### ✅ REQUIRED: Create Once in AWS Console

| # | Resource | Service | Notes |
|---|----------|---------|-------|
| 1 | **VPC** | EC2 → VPC | Pre-existing VPC required. Pipeline does not create VPC. |
| 2 | **Private Subnets (EKS)** | EC2 → Subnets | Minimum 2 private subnets across 2 AZs with NAT Gateway. Must meet [EKS subnet requirements](https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html#network-requirements-subnets) |
| 3 | **Private Subnets (RDS)** | EC2 → Subnets | Minimum 2 private subnets across 2 AZs (can overlap with EKS subnets) |
| 4 | **NAT Gateway** | EC2 → NAT Gateways | Required for EKS nodes and CodeBuild to reach internet (ECR, S3, package downloads) |
| 5 | **Bastion Host** | EC2 | EC2 instance inside VPC for post-deploy `kubectl` access. Can use AWS Systems Manager Fleet Manager. |
| 6 | **EKS Cluster IAM Role** | IAM | With `AmazonEKSClusterPolicy` attached |
| 7 | **EKS Node IAM Role** | IAM | With `AmazonEKSWorkerNodePolicy`, `AmazonEC2ContainerRegistryReadOnly`, `AmazonEKS_CNI_Policy` |
| 8 | **AWS Secrets Manager Secret** | Secrets Manager | Create secret(s) containing FlowSource app secrets. **Secret key names must NOT contain hyphens** (JMESPath limitation). Use underscores (e.g., `GITHUB_TOKEN` not `GITHUB-TOKEN`) |
| 9 | **IRSA Role for FlowSource** | IAM | Role with OIDC trust policy allowing `default` service account in `flowsource` namespace to call `secretsmanager:GetSecretValue` and `secretsmanager:DescribeSecret` |
| 10 | **IRSA Role for ALB Controller** | IAM | Role with ALB management permissions (see `Policy_ALB-Role-1.json` and `Policy_ALB-Role-2.json` in `FlowSource-infra-provision/aws/eks-flowsource-env/`) |
| 11 | **CodeStar Connection** (GitHub only) | CodePipeline → Settings → Connections | GitHub OAuth connection. Must be set to **Available** status. Note the Connection ARN. |
| 12 | **ACM Certificate** (PROD only) | ACM | SSL certificate for the ALB HTTPS listener |
| 13 | **ALB Controller IAM Policy** | IAM | Create the IAM policy from `Policy_ALB-Role-1.json` + `Policy_ALB-Role-2.json` and attach to ALB Controller role |

#### ✅ CREATED AUTOMATICALLY by `setup-aws-prerequisites.sh`

Run the script once and it will create:

| Resource | Details |
|----------|---------|
| S3 Bucket | Terraform state + pipeline artifacts (versioning + encryption enabled) |
| DynamoDB Table | Terraform state locking |
| CodeBuild IAM Role | `FlowSourceCodeBuildRole` |
| CodePipeline IAM Role | `FlowSourceCodePipelineRole` |
| SNS Topic | For approval email notifications |
| SSM Parameter | `/flowsource/cicd/infra-tfvars-s3-key` |

---

### 4.2 Networking Pre-Requisites

```
VPC
├── Public Subnets (2+ across AZs)
│   ├── NAT Gateway (for private subnet outbound)
│   └── Application Load Balancer (public-facing, created by ALB Controller)
│
└── Private Subnets (2+ across AZs)
    ├── EKS Control Plane ENIs
    ├── EKS Worker Nodes (EC2)
    │   └── FlowSource Pod (flowsource namespace)
    ├── RDS PostgreSQL
    └── CodeBuild (runs here for VPC access to private EKS endpoint)
```

**Security Group Requirements for CodeBuild:**
- Outbound: Allow all (443, 80) to internet via NAT (for ECR, S3, Helm repos, `terraform init`)
- Outbound: Allow port 443 to EKS cluster endpoint (security group of EKS control plane)
- Inbound: No inbound required

---

### 4.3 IAM Roles & Permissions

#### CodeBuild Role (`FlowSourceCodeBuildRole`)
Must allow:
- `ecr:*` — push/pull Docker images
- `eks:DescribeCluster`, `eks:AccessKubernetesApi` — kubeconfig generation
- `sts:AssumeRole` — for `terraform apply` with EKS
- `s3:GetObject/PutObject/ListBucket` — state and artifacts bucket
- `dynamodb:GetItem/PutItem/DeleteItem` — state locking
- `secretsmanager:GetSecretValue` — for reading secrets during deploy
- `ssm:GetParameter` — for pipeline parameters
- `ec2:DescribeVpcs`, `ec2:CreateNetworkInterface` etc. — VPC-mode CodeBuild
- `cloudwatch:*` — logging

#### CodePipeline Role (`FlowSourceCodePipelineRole`)
Must allow:
- `s3:GetObject/PutObject` — artifact bucket
- `codebuild:StartBuild/BatchGetBuilds`
- `codestar-connections:UseConnection`
- `codecommit:GetBranch/GetCommit/UploadArchive`
- `sns:Publish` — approval notifications
- `iam:PassRole`

#### IRSA Role for FlowSource App (FlowSource Namespace)
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue",
    "secretsmanager:DescribeSecret"
  ],
  "Resource": "arn:aws:secretsmanager:<region>:<account-id>:secret:<secret-name>*"
}
```
Trust policy must use the EKS cluster OIDC provider for the `default` service account in `flowsource` namespace.

---

### 4.4 Secrets Manager

Create a single Secrets Manager secret (or multiple) containing all FlowSource application secrets.

**Example secret structure (JSON):**
```json
{
  "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx",
  "AUTH_GITHUB_CLIENT_ID": "your-github-app-client-id",
  "AUTH_GITHUB_CLIENT_SECRET": "your-github-app-client-secret",
  "POSTGRES_PASSWORD": "your-rds-password",
  "BACKEND_SECRET": "a-random-secret-key",
  "JIRA_TOKEN": "Basic <base64>",
  "SONARQUBE_TOKEN": "squ_xxxxx"
}
```

> ⚠️ **CRITICAL:** Key names must NOT contain hyphens. AWS Secrets Store CSI Provider uses JMESPath to extract keys and hyphens are not valid JMESPath identifiers. Use underscores.

---

### 4.5 Tools Required Locally

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| **AWS CLI** | v2 | Run `setup-aws-prerequisites.sh` and manual ops |
| **Terraform** | >= 1.3.0 | Run `bootstrap-codepipeline/` Terraform |
| **Git** | Any | Commit and push to trigger pipeline |
| **kubectl** | >= 1.28 | Post-deploy verification (optional) |
| **Helm** | >= 3.x | Local testing of values files (optional) |
| **Docker** | Any | Local image build testing (optional) |

---

## 5. First-Time Setup — Step by Step

### Phase 1 — AWS Prerequisites (Run Once)

```bash
# Step 1: Run the prerequisites script
chmod +x cicd/scripts/setup-aws-prerequisites.sh
./cicd/scripts/setup-aws-prerequisites.sh
```

This creates: S3 bucket, DynamoDB table, IAM roles, SNS topic.

```bash
# Step 2: Create the GitHub CodeStar Connection (Console only)
# Go to: AWS Console → CodePipeline → Settings → Connections → Create connection
# Select: GitHub → Authorize → Note the Connection ARN
```

```bash
# Step 3: Create the EKS Cluster IAM Role (if not existing)
# AWS Console → IAM → Roles → Create Role → EKS Cluster → Attach AmazonEKSClusterPolicy

# Step 4: Create the EKS Node IAM Role (if not existing)
# AWS Console → IAM → Roles → Create Role → EC2 →
#   Attach: AmazonEKSWorkerNodePolicy, AmazonEC2ContainerRegistryReadOnly, AmazonEKS_CNI_Policy

# Step 5: Create the AWS Secrets Manager secret
aws secretsmanager create-secret \
  --name "flowsource-app-secrets" \
  --region us-east-1 \
  --secret-string '{
    "GITHUB_TOKEN": "ghp_xxxx",
    "POSTGRES_PASSWORD": "changeme",
    "BACKEND_SECRET": "random-key",
    "AUTH_GITHUB_CLIENT_ID": "your-client-id",
    "AUTH_GITHUB_CLIENT_SECRET": "your-client-secret"
  }'
```

### Phase 2 — Configure Infra Terraform Variables

```bash
# Step 6: Copy and fill the infra terraform.tfvars
cp FlowSource-infra-provision/aws/eks-flowsource-env/terraform.exampletfvars \
   FlowSource-infra-provision/aws/eks-flowsource-env/terraform.tfvars
# Edit terraform.tfvars with your VPC ID, subnet IDs, cluster name, DB settings, IAM roles, etc.

# Step 7: Upload infra tfvars to S3 (pipeline reads it from here)
aws s3 cp FlowSource-infra-provision/aws/eks-flowsource-env/terraform.tfvars \
  s3://<TF_STATE_BUCKET>/flowsource/config/infra/terraform.tfvars
```

### Phase 3 — Configure Helm Values Files

```bash
# Step 8: Create environment values files
mkdir -p cicd/config/dev cicd/config/qa cicd/config/prod

# For DEV — copy from example and fill in your values
cp cicd/config/dev-values.example.yaml cicd/config/dev/values.yaml
# Edit dev/values.yaml: set RDS endpoint, ECR image URI, secrets ARN, subnet IDs

# Create app-config.yaml for each env:
# Reference: FlowSourceInstaller/helm-chart/docs/example-app-config.yaml
# The file MUST have a single root key "appconfig" with all content nested under it.
cp FlowSourceInstaller/helm-chart/docs/example-app-config.yaml cicd/config/dev/app-config.yaml
# Edit: set FLOWSOURCE_BASE_URL, POSTGRES_SERVICE_HOST, etc.

# Create all-configurations.yaml for each env:
# Reference: FlowSourceInstaller/helm-chart/docs/example-all-configurations.yaml
cp FlowSourceInstaller/helm-chart/docs/example-all-configurations.yaml \
   cicd/config/dev/all-configurations.yaml

# Repeat for qa/ and prod/ with environment-specific values

# Step 9: Upload values files to S3
./cicd/scripts/upload-config-to-s3.sh dev <TF_STATE_BUCKET> us-east-1
./cicd/scripts/upload-config-to-s3.sh qa  <TF_STATE_BUCKET> us-east-1
./cicd/scripts/upload-config-to-s3.sh prod <TF_STATE_BUCKET> us-east-1
```

### Phase 4 — Bootstrap the CodePipeline

```bash
# Step 10: Configure the bootstrap Terraform
cd cicd/bootstrap-codepipeline/

# Copy and fill in the tfvars
cp terraform.example.tfvars terraform.tfvars
# Edit terraform.tfvars:
#   - aws_region, eks_cluster_name
#   - tf_state_bucket, tf_dynamodb_table
#   - github_owner, repository_name, branch_name
#   - github_connection_arn (from Step 2)
#   - codebuild_service_role_arn, codepipeline_service_role_arn
#   - vpc_id, private_subnet_ids, codebuild_security_group_ids
#   - approval_sns_topic_arn

# Copy and fill in the backend config
cp backend-config.example.hcl backend-config.hcl
# Edit: set bucket, region, dynamodb_table

# Step 11: Initialize and apply bootstrap Terraform
terraform init -backend-config=backend-config.hcl
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

cd ../..
```

### Phase 5 — Subscribe to Approval Notifications

```bash
# Step 12: Subscribe your email to the SNS approval topic
aws sns subscribe \
  --topic-arn "arn:aws:sns:us-east-1:<account-id>:flowsource-approvals" \
  --protocol email \
  --notification-endpoint "your-team@company.com" \
  --region us-east-1
# Confirm subscription from the email you receive
```

### Phase 6 — Set Up IRSA for FlowSource

```bash
# Step 13: Associate OIDC provider with EKS cluster
eksctl utils associate-iam-oidc-provider \
  --cluster <cluster-name> \
  --approve \
  --region us-east-1

# Step 14: Get OIDC details
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_PROVIDER=$(aws eks describe-cluster --name <cluster-name> --region us-east-1 \
  --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")

# Step 15: Create IRSA trust policy
cat > trust-relationship.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "${OIDC_PROVIDER}:aud": "sts.amazonaws.com",
        "${OIDC_PROVIDER}:sub": "system:serviceaccount:flowsource:default"
      }
    }
  }]
}
EOF

# Step 16: Create the IRSA role
aws iam create-role \
  --role-name FlowSourceSecretsManagerRole \
  --assume-role-policy-document file://trust-relationship.json

aws iam put-role-policy \
  --role-name FlowSourceSecretsManagerRole \
  --policy-name FlowSourceSecretsAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue","secretsmanager:DescribeSecret"],
      "Resource": "arn:aws:secretsmanager:us-east-1:'${ACCOUNT_ID}':secret:flowsource*"
    }]
  }'

# Step 17: Annotate the default service account (post EKS creation)
kubectl annotate serviceaccount default \
  -n flowsource \
  eks.amazonaws.com/role-arn=arn:aws:iam::${ACCOUNT_ID}:role/FlowSourceSecretsManagerRole
```

### Phase 7 — First Pipeline Run

```bash
# Step 18: Trigger the pipeline (first commit after setup)
git add .
git commit -m "feat: initial FlowSource CI/CD pipeline setup"
git push origin main
# The pipeline will trigger automatically in AWS CodePipeline
```

---

## 6. How Commits Trigger the Pipeline

### When Using GitHub (CodeStar Connection)

The CodePipeline source stage is configured with `DetectChanges=true`. When any commit is pushed to the configured branch (`main`), AWS CodePipeline polls the connection and starts the pipeline within **~1 minute**.

```
Developer pushes to GitHub (main branch)
         │
         ▼
AWS CodeStar Connection detects push
         │
         ▼
CodePipeline Source stage pulls latest code
         │
         ▼
Pipeline runs all stages automatically
```

### When Using CodeCommit

An **EventBridge rule** (created by Terraform) detects `referenceUpdated` events on the target branch and immediately triggers CodePipeline.

```
Developer pushes to CodeCommit (main branch)
         │
         ▼
EventBridge rule fires (sub-second)
         │
         ▼
CodePipeline Source stage pulls latest code
         │
         ▼
Pipeline runs all stages automatically
```

### Manual Pipeline Trigger

You can also manually trigger the pipeline from:
- **AWS Console:** CodePipeline → `flowsource-master-pipeline` → Release Change
- **AWS CLI:**
  ```bash
  aws codepipeline start-pipeline-execution \
    --name flowsource-master-pipeline \
    --region us-east-1
  ```

---

## 7. New Version Release — What to Do

When a new version of FlowSource is released (e.g., 1.0.6):

### Option A — Using the Version Update Script (Recommended)

```bash
./cicd/scripts/update-version.sh 1.0.6
```

This:
1. Updates `FlowSourceInstaller/version/version.txt` to `image: flowsource:1.0.6`
2. Commits the change with message `chore: bump FlowSource version to 1.0.6 [trigger-pipeline]`
3. Pushes to the configured branch
4. **Automatically triggers the full pipeline** (infra → build → deploy)

### Option B — Manual Steps

```bash
# 1. Update version file
echo "image: flowsource:1.0.6" > FlowSourceInstaller/version/version.txt

# 2. Commit and push
git add FlowSourceInstaller/version/version.txt
git commit -m "chore: bump to v1.0.6"
git push origin main
```

### What the Pipeline Does on a New Release

| Stage | Action |
|-------|--------|
| Infra EKS | `terraform apply` — detects no changes (idempotent), passes quickly |
| Infra Helm | `terraform apply` — detects no changes, passes quickly |
| Build | Builds new Docker image tagged `1.0.6` and `latest`, pushes to ECR |
| Deploy DEV | Helm upgrade with new image tag in DEV namespace |
| Approve QA | Email sent — approver reviews DEV |
| Deploy QA | Helm upgrade in QA namespace |
| Approve PROD | Email sent — approver reviews QA |
| Deploy PROD | Helm upgrade in PROD namespace |

### Infra-Only Changes

If you change Terraform in `FlowSource-infra-provision/aws/eks-flowsource-env/` and push, the pipeline runs all stages including a full rebuild. This is safe — Docker build is idempotent for the same version tag.

---

## 8. Configuration Files Reference

### Files Committed to Source Control

| File | Description | How to Use |
|------|-------------|-----------|
| `cicd/infra-pipeline/buildspec-infra-eks-cluster.yaml` | CodeBuild spec for EKS/RDS Terraform | No changes needed unless env var names change |
| `cicd/infra-pipeline/buildspec-infra-helm-resources.yaml` | CodeBuild spec for CSI/ALB Helm | No changes needed |
| `cicd/build-pipeline/buildspec-build-image.yaml` | CodeBuild spec for Docker build + ECR push | No changes needed |
| `cicd/deploy-pipeline/buildspec-deploy-dev.yaml` | CodeBuild spec for DEV Helm deploy | No changes needed |
| `cicd/deploy-pipeline/buildspec-deploy-qa.yaml` | CodeBuild spec for QA Helm deploy | No changes needed |
| `cicd/deploy-pipeline/buildspec-deploy-prod.yaml` | CodeBuild spec for PROD Helm deploy | No changes needed |
| `cicd/bootstrap-codepipeline/main.tf` | CodePipeline + CodeBuild Terraform | No changes needed |
| `cicd/bootstrap-codepipeline/variables.tf` | Variable definitions | No changes needed |
| `cicd/bootstrap-codepipeline/terraform.example.tfvars` | Template for bootstrap tfvars | Copy to `terraform.tfvars`, fill in, do NOT commit |
| `cicd/config/dev-values.example.yaml` | DEV Helm values template | Copy to `cicd/config/dev/values.yaml`, fill in, upload to S3 |
| `cicd/config/prod-values.example.yaml` | PROD Helm values template | Copy to `cicd/config/prod/values.yaml`, fill in, upload to S3 |

### Files Stored in S3 (Not in Source Control)

| S3 Path | File | Description |
|---------|------|-------------|
| `flowsource/config/infra/terraform.tfvars` | infra tfvars | EKS/RDS Terraform variables (VPC IDs, cluster name, etc.) |
| `flowsource/config/dev/values.yaml` | DEV Helm values | Helm values for DEV deployment |
| `flowsource/config/dev/app-config.yaml` | DEV app config | FlowSource app-config.yaml wrapped in `appconfig:` key |
| `flowsource/config/dev/all-configurations.yaml` | DEV catalog config | Backstage catalog entity definitions |
| `flowsource/config/qa/values.yaml` | QA Helm values | Same structure, QA-specific values |
| `flowsource/config/qa/app-config.yaml` | QA app config | QA-specific app config |
| `flowsource/config/qa/all-configurations.yaml` | QA catalog config | |
| `flowsource/config/prod/values.yaml` | PROD Helm values | Production values (higher replicas, HTTPS, OIDC) |
| `flowsource/config/prod/app-config.yaml` | PROD app config | |
| `flowsource/config/prod/all-configurations.yaml` | PROD catalog config | |
| `cicd-artifacts/imageDetail.json` | Build metadata | Written by build stage, read by deploy stages |
| `cicd-artifacts/infra-outputs.json` | Infra outputs | Terraform outputs from EKS stage |

### app-config.yaml Format Requirement

The `app-config.yaml` uploaded to S3 must wrap the contents under a single `appconfig:` key:

```yaml
appconfig: |-
  app:
    title: Cognizant Flowsource
    baseUrl: ${FLOWSOURCE_BASE_URL}
  backend:
    baseUrl: ${FLOWSOURCE_BASE_URL}
    database:
      client: pg
      connection:
        host: ${POSTGRES_SERVICE_HOST}
        ...
  # (rest of configuration/app-config.yaml content here)
```

Reference: `FlowSourceInstaller/helm-chart/docs/example-app-config.yaml`

---

## 9. Troubleshooting

### Pipeline doesn't trigger on push

**GitHub:** Check CodeStar Connection status — must be `Available` (not `Pending`).  
Go to: AWS Console → CodePipeline → Settings → Connections

**CodeCommit:** Check EventBridge rule is enabled.  
```bash
aws events describe-rule --name flowsource-codecommit-push --region us-east-1
```

### CodeBuild: "Cannot connect to EKS cluster"

This means CodeBuild is not in the VPC or its security group cannot reach the EKS endpoint.  
- Verify `use_vpc = true` in `terraform.tfvars`
- Ensure `private_subnet_ids` are correct (private subnets with NAT gateway)
- Ensure `codebuild_security_group_ids` allows outbound to EKS control plane SG on port 443

### Terraform init fails: "Error acquiring state lock"

Another process has the DynamoDB lock. Wait 15 minutes, then:
```bash
terraform force-unlock <lock-id>
```

### Docker build fails: "no space left on device"

CodeBuild `BUILD_GENERAL1_MEDIUM` has limited disk. Use `BUILD_GENERAL1_LARGE` or add Docker layer cache configuration.

### Helm deploy fails: "IRSA role not found"

The `default` service account in `flowsource` namespace is not annotated with the IRSA role ARN.  
Run Step 17 from the setup guide. The EKS cluster must exist first.

### Secrets not injected into pod (CSI driver)

1. Verify CSI driver pods are running: `kubectl get pods -n kube-system | grep csi`
2. Verify the SecretProviderClass is created: `kubectl get secretproviderclass -n flowsource`
3. Check secret key names in Secrets Manager — must not contain hyphens
4. Verify IRSA role trust policy matches the EKS OIDC provider and namespace/service-account

### ALB not created after Helm deploy

1. Verify ALB Controller is running: `kubectl get pods -n alb-ingress`
2. Check the ingress annotations are correct (see `example-values-alb-ingress.yaml`)
3. Check ALB Controller logs: `kubectl logs -n alb-ingress -l app.kubernetes.io/name=aws-load-balancer-controller`
4. Verify ALB Controller IAM role has correct permissions

### Manual approval email not received

1. Confirm SNS subscription: `aws sns list-subscriptions-by-topic --topic-arn <arn>`
2. Check spam folder
3. Manually approve from AWS Console: CodePipeline → pipeline → Review

---

## Appendix A: Permissions Checklist (Quick Reference)

| Resource | Created By | Terraform Managed |
|----------|-----------|-------------------|
| VPC + Subnets | Admin (Manual) | No |
| NAT Gateway | Admin (Manual) | No |
| EKS Cluster IAM Role | Admin (Manual) | No |
| EKS Node IAM Role | Admin (Manual) | No |
| Bastion Host | Admin (Manual) | No |
| S3 Bucket (TF state) | `setup-aws-prerequisites.sh` | No |
| DynamoDB (TF locks) | `setup-aws-prerequisites.sh` | No |
| CodeBuild IAM Role | `setup-aws-prerequisites.sh` | No |
| CodePipeline IAM Role | `setup-aws-prerequisites.sh` | No |
| SNS Topic (approvals) | `setup-aws-prerequisites.sh` | No |
| CodeStar Connection | Admin (Manual - Console) | No |
| AWS Secrets Manager | Admin (Manual) | No |
| IRSA Role (FlowSource) | Admin (Manual - OIDC setup) | No |
| IRSA Role (ALB Controller) | Admin (Manual) | No |
| ECR Repository | `bootstrap-codepipeline/` Terraform | ✅ Yes |
| CodeBuild Projects (6x) | `bootstrap-codepipeline/` Terraform | ✅ Yes |
| CodePipeline | `bootstrap-codepipeline/` Terraform | ✅ Yes |
| EventBridge Rule | `bootstrap-codepipeline/` Terraform | ✅ Yes (CodeCommit only) |
| EKS Cluster | `buildspec-infra-eks-cluster.yaml` | ✅ Yes |
| RDS PostgreSQL | `buildspec-infra-eks-cluster.yaml` | ✅ Yes |
| CSI Driver | `buildspec-infra-helm-resources.yaml` | ✅ Yes |
| ALB Controller | `buildspec-infra-helm-resources.yaml` | ✅ Yes |
| FlowSource Deployment | `buildspec-deploy-*.yaml` | ✅ Yes (Helm) |

---

*For deployment document reference: `releases/Cognizant Flowsource Platform - Deployment Document.pdf`*  
*For database backup/restore: `releases/Flowsource-Database Backup and Restore.pdf`*
