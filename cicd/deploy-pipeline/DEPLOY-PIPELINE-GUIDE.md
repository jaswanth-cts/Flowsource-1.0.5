# FlowSource — Deploy Pipeline Detailed Guide

> **Scope:** AWS Cloud Provider | **Environments:** DEV, QA, PROD  
> **Document Version:** 1.0.0 | **Date:** April 2026

---

## Table of Contents

1. [Overview — What "Deploy" Means in This Pipeline](#1-overview--what-deploy-means-in-this-pipeline)
2. [Files in This Folder](#2-files-in-this-folder)
3. [How the Deploy Script Gets Initiated](#3-how-the-deploy-script-gets-initiated)
4. [How the Environment (DEV / QA / PROD) Is Determined](#4-how-the-environment-dev--qa--prod-is-determined)
5. [Complete File Reference Map](#5-complete-file-reference-map)
6. [Phase-by-Phase Walkthrough](#6-phase-by-phase-walkthrough)
   - 6.1 [env — Variables Available to All Phases](#61-env--variables-available-to-all-phases)
   - 6.2 [install — Setting Up the Worker's Tools](#62-install--setting-up-the-workers-tools)
   - 6.3 [pre_build — Connecting to AWS and EKS](#63-pre_build--connecting-to-aws-and-eks)
   - 6.4 [build — Terraform Plans the Helm Deploy](#64-build--terraform-plans-the-helm-deploy)
   - 6.5 [post_build — Apply and Verify](#65-post_build--apply-and-verify)
7. [The Terraform → Helm Chain Explained](#7-the-terraform--helm-chain-explained)
8. [What Gets Created in Kubernetes](#8-what-gets-created-in-kubernetes)
9. [DEV vs QA vs PROD — What Is Different](#9-dev-vs-qa-vs-prod--what-is-different)
10. [The Three Values Files — What They Contain](#10-the-three-values-files--what-they-contain)
11. [Helm Chart Templates — What Each File Produces](#11-helm-chart-templates--what-each-file-produces)
12. [How a New Version Deployment Works](#12-how-a-new-version-deployment-works)
13. [Troubleshooting Deploy Failures](#13-troubleshooting-deploy-failures)

---

## 1. Overview — What "Deploy" Means in This Pipeline

The deploy pipeline does **not** run `helm install` directly. Instead it uses a layered approach:

```
buildspec-deploy-*.yaml   (CodeBuild instructions)
        │
        └──► runs Terraform on ──► FlowSourceInstaller/terraform-scripts/
                                              │
                                              └──► calls Helm module ──► modules/helm-install/main.tf
                                                                                    │
                                                                                    └──► helm install/upgrade
                                                                                                │
                                                                                                └──► FlowSourceInstaller/helm-chart/
                                                                                                            │
                                                                                                            └──► Kubernetes resources created
```

**Why Terraform instead of direct Helm?**  
Terraform tracks what was deployed and what changed (via state file in S3). If the pipeline reruns, Terraform detects whether a Helm release already exists and does an `upgrade` instead of a fresh `install`. This makes the deployment **idempotent** — safe to run multiple times.

---

## 2. Files in This Folder

```
cicd/deploy-pipeline/
├── buildspec-deploy-dev.yaml    ← Instructions for deploying to DEV environment
├── buildspec-deploy-qa.yaml     ← Instructions for deploying to QA environment
├── buildspec-deploy-prod.yaml   ← Instructions for deploying to PROD environment
└── DEPLOY-PIPELINE-GUIDE.md    ← This document
```

These 3 buildspec files are **AWS CodeBuild specification files**. They are read and executed by AWS CodeBuild when the corresponding pipeline stage runs. They are not run manually.

### Referenced Source Folders (Outside This Folder)

| Folder / File | Used By | Purpose |
|---------------|---------|---------|
| `FlowSourceInstaller/terraform-scripts/` | All 3 buildspecs | Terraform that calls Helm |
| `FlowSourceInstaller/helm-chart/` | All 3 buildspecs (via Terraform) | The actual Helm chart for FlowSource |
| `FlowSourceInstaller/terraform-scripts/provider.tf.eks` | All 3 buildspecs | EKS authentication template |
| `FlowSourceInstaller/terraform-scripts/modules/helm-install/` | Terraform | The `helm_release` Terraform resource |
| S3: `flowsource/config/dev/` | `buildspec-deploy-dev.yaml` | DEV-specific values files |
| S3: `flowsource/config/qa/` | `buildspec-deploy-qa.yaml` | QA-specific values files |
| S3: `flowsource/config/prod/` | `buildspec-deploy-prod.yaml` | PROD-specific values files |
| S3: `cicd-artifacts/imageDetail.json` | All 3 buildspecs | Docker image URI written by Build stage |

---

## 3. How the Deploy Script Gets Initiated

You never run these files manually. Here is the exact chain of events:

```
Step 1: Developer pushes commit to GitHub / CodeCommit (branch: main)
           │
Step 2: AWS CodePipeline detects the push (Source stage)
           │
Step 3: Pipeline runs Infra stages (EKS cluster, Helm resources)
           │
Step 4: Pipeline runs Build stage (Docker image built and pushed to ECR)
           │
Step 5: Pipeline reaches Stage: "Deploy-DEV"
           │
Step 6: CodePipeline starts CodeBuild project: "flowsource-deploy-dev"
           │
Step 7: CodeBuild downloads source code ZIP from S3 (the pipeline artifact)
           │
Step 8: CodeBuild reads:  cicd/deploy-pipeline/buildspec-deploy-dev.yaml
           │
Step 9: CodeBuild executes the 4 phases in sequence:
           install → pre_build → build → post_build
           │
Step 10: Pipeline pauses at "Approve-QA-Deployment" (Manual Approval)
           │  Approver receives email, reviews DEV, clicks Approve
           │
Step 11: Pipeline runs Stage: "Deploy-QA"
           │  (same flow using buildspec-deploy-qa.yaml)
           │
Step 12: Pipeline pauses at "Approve-PROD-Deployment" (Manual Approval)
           │  Approver receives email, reviews QA, clicks Approve
           │
Step 13: Pipeline runs Stage: "Deploy-PROD"
              (same flow using buildspec-deploy-prod.yaml)
```

The link between the CodeBuild project and the buildspec file is established in `cicd/bootstrap-codepipeline/main.tf`:

```hcl
resource "aws_codebuild_project" "deploy_dev" {
  source {
    buildspec = "cicd/deploy-pipeline/buildspec-deploy-dev.yaml"  ← hardcoded path
  }
}
```

---

## 4. How the Environment (DEV / QA / PROD) Is Determined

This is one of the most important things to understand. **There is no runtime flag, no user prompt, and no if/else logic inside a buildspec that picks an environment.** The environment is determined entirely by the **pipeline stage structure** that was defined once — at Terraform `apply` time — inside `cicd/bootstrap-codepipeline/main.tf`.

---

### The Core Mechanism — Three Separate, Dedicated CodeBuild Projects

`bootstrap-codepipeline/main.tf` creates **three completely separate** CodeBuild projects, one per environment. Each is permanently wired to exactly one buildspec file and one fixed set of environment variables:

```
AWS CodeBuild Projects created by Terraform:
┌─────────────────────────────────┬──────────────────────────────────────────────┬─────────────────────────┐
│ CodeBuild Project Name          │ buildspec Hardcoded Inside It                │ NAMESPACE Env Var       │
├─────────────────────────────────┼──────────────────────────────────────────────┼─────────────────────────┤
│ flowsource-deploy-dev           │ cicd/deploy-pipeline/buildspec-deploy-dev.yaml  │ flowsource-dev          │
│ flowsource-deploy-qa            │ cicd/deploy-pipeline/buildspec-deploy-qa.yaml   │ flowsource-qa           │
│ flowsource-deploy-prod          │ cicd/deploy-pipeline/buildspec-deploy-prod.yaml │ flowsource (prod)       │
└─────────────────────────────────┴──────────────────────────────────────────────┴─────────────────────────┘
```

From `main.tf`, each project is defined like this (DEV shown):

```hcl
resource "aws_codebuild_project" "deploy_dev" {
  name = "flowsource-deploy-dev"

  source {
    buildspec = "cicd/deploy-pipeline/buildspec-deploy-dev.yaml"  ← hardcoded, DEV only
  }

  environment {
    environment_variable { name = "NAMESPACE"         value = "flowsource-dev" }
    environment_variable { name = "DEPLOYMENT_NAME"   value = "flowsource-dev" }
    environment_variable { name = "TF_STATE_KEY"      value = "deploy/dev/terraform.tfstate" }
    environment_variable { name = "VALUES_S3_PREFIX"  value = "flowsource/config/dev" }
  }
}
```

And for PROD:

```hcl
resource "aws_codebuild_project" "deploy_prod" {
  name = "flowsource-deploy-prod"

  source {
    buildspec = "cicd/deploy-pipeline/buildspec-deploy-prod.yaml"  ← hardcoded, PROD only
  }

  environment {
    environment_variable { name = "NAMESPACE"         value = "flowsource" }
    environment_variable { name = "DEPLOYMENT_NAME"   value = "flowsource" }
    environment_variable { name = "TF_STATE_KEY"      value = "deploy/prod/terraform.tfstate" }
    environment_variable { name = "VALUES_S3_PREFIX"  value = "flowsource/config/prod" }
  }
}
```

There is **no shared CodeBuild project** that receives an `--env=dev` argument. Each project is entirely isolated and knows only its own environment.

---

### The Pipeline Stage Order Enforces the Promotion Sequence

The `aws_codepipeline` resource in `main.tf` defines 9 stages **in strict order**. CodePipeline always runs them top to bottom:

```
Stage 1  ─  Source               (Git push triggers this — automatic)
Stage 2  ─  Provision-EKS-Cluster
Stage 3  ─  Provision-EKS-HelmResources
Stage 4  ─  Build-Image           (Docker image built, imageDetail.json written to S3)
Stage 5  ─  Deploy-DEV            ← runs CodeBuild project: flowsource-deploy-dev
                                       uses buildspec-deploy-dev.yaml
                                       NAMESPACE = flowsource-dev
                                       VALUES_S3_PREFIX = flowsource/config/dev
Stage 6  ─  Approve-QA-Deployment ← 🔴 MANUAL GATE — pipeline pauses here
                                       Email sent to approver via SNS
                                       Approver must click "Approve" in AWS Console
Stage 7  ─  Deploy-QA             ← only runs AFTER stage 6 is approved
                                       runs CodeBuild project: flowsource-deploy-qa
                                       uses buildspec-deploy-qa.yaml
                                       NAMESPACE = flowsource-qa
                                       VALUES_S3_PREFIX = flowsource/config/qa
Stage 8  ─  Approve-PROD-Deployment ← 🔴 MANUAL GATE — pipeline pauses again
                                       Email sent to approver via SNS
                                       Approver must click "Approve" in AWS Console
Stage 9  ─  Deploy-PROD           ← only runs AFTER stage 8 is approved
                                       runs CodeBuild project: flowsource-deploy-prod
                                       uses buildspec-deploy-prod.yaml
                                       NAMESPACE = flowsource (production)
                                       VALUES_S3_PREFIX = flowsource/config/prod
```

From `main.tf`, the pipeline stage for DEV looks like this:

```hcl
stage {
  name = "Deploy-DEV"
  action {
    name      = "Helm-Deploy-DEV"
    category  = "Build"
    provider  = "CodeBuild"
    configuration = {
      ProjectName = aws_codebuild_project.deploy_dev.name  ← points to DEV project only
    }
  }
}

stage {
  name = "Approve-QA-Deployment"
  action {
    name     = "Approve-QA"
    category = "Approval"
    provider = "Manual"
    configuration = {
      NotificationArn    = var.approval_sns_topic_arn   ← sends email
      CustomData         = "Please review DEV deployment and approve to promote to QA."
      ExternalEntityLink = var.flowsource_dev_url        ← link to DEV environment URL
    }
  }
}

stage {
  name = "Deploy-QA"
  action {
    name      = "Helm-Deploy-QA"
    category  = "Build"
    provider  = "CodeBuild"
    configuration = {
      ProjectName = aws_codebuild_project.deploy_qa.name  ← points to QA project only
    }
  }
}
```

The sequence is **structurally enforced** — CodePipeline will never skip a stage or run them out of order. If DEV fails, QA never starts. If QA is not manually approved, PROD never starts.

---

### What Distinguishes DEV vs QA vs PROD at Runtime

When a CodeBuild project runs, it receives all of its environment variables from the project definition (set by Terraform). The buildspec files themselves are nearly identical — the difference is purely in which project executes them and what environment variables that project injects:

| What Is Different | Where It Is Set | DEV | QA | PROD |
|---|---|---|---|---|
| **Which buildspec runs** | `aws_codebuild_project.source.buildspec` in `main.tf` | `buildspec-deploy-dev.yaml` | `buildspec-deploy-qa.yaml` | `buildspec-deploy-prod.yaml` |
| **Kubernetes namespace** | `NAMESPACE` env var in CodeBuild project | `flowsource-dev` | `flowsource-qa` | `flowsource` |
| **Helm release name** | `DEPLOYMENT_NAME` env var in CodeBuild project | `flowsource-dev` | `flowsource-qa` | `flowsource` |
| **Terraform state file** | `TF_STATE_KEY` env var in CodeBuild project | `deploy/dev/terraform.tfstate` | `deploy/qa/terraform.tfstate` | `deploy/prod/terraform.tfstate` |
| **Helm values files** | `VALUES_S3_PREFIX` env var in CodeBuild project | `s3://.../flowsource/config/dev/` | `s3://.../flowsource/config/qa/` | `s3://.../flowsource/config/prod/` |
| **Triggered by** | Pipeline stage order in `main.tf` | Automatically (after Build stage) | Manually approved QA gate | Manually approved PROD gate |

---

### Summary — The Three-Layer Decision

```
LAYER 1: Terraform (bootstrap-codepipeline/main.tf)
         ─ Creates 3 CodeBuild projects, each locked to one environment
         ─ Creates the pipeline with 9 stages in fixed order
         ─ This is decided ONCE when you run: terraform apply
                    │
                    ▼
LAYER 2: CodePipeline (AWS, runtime)
         ─ Always runs stages in order: DEV → (approval) → QA → (approval) → PROD
         ─ Each stage calls only its designated CodeBuild project
         ─ Manual approval stages act as human-controlled gates
                    │
                    ▼
LAYER 3: CodeBuild Project (AWS, runtime)
         ─ Each project has its NAMESPACE, TF_STATE_KEY, VALUES_S3_PREFIX baked in
         ─ Runs its assigned buildspec file
         ─ The buildspec reads those env vars to know which namespace,
           which S3 folder, and which Terraform state to use
```

You **cannot** accidentally deploy to PROD by skipping DEV. The pipeline structure makes that physically impossible — PROD stage only becomes available after both approval gates are manually clicked.

---

## 5. Complete File Reference Map

This map shows every file touched during a deploy, and when it is accessed:

```
PHASE 1 — install
  (no files read — tools downloaded from internet)

PHASE 2 — pre_build
  ├── FROM S3 (downloaded at runtime — NOT in git):
  │   ├── s3://<bucket>/flowsource/config/dev/values.yaml             → /tmp/values-files/values.yaml
  │   ├── s3://<bucket>/flowsource/config/dev/app-config.yaml         → /tmp/values-files/app-config.yaml
  │   ├── s3://<bucket>/flowsource/config/dev/all-configurations.yaml → /tmp/values-files/all-configurations.yaml
  │   └── s3://<bucket>/cicd-artifacts/imageDetail.json               → /tmp/imageDetail.json
  │
  └── FROM REPO (source code):
      └── FlowSourceInstaller/terraform-scripts/provider.tf.eks
              └── COPIED TO → FlowSourceInstaller/terraform-scripts/provider.tf

PHASE 3 — build
  ├── WRITTEN AT RUNTIME (generated by the buildspec):
  │   └── FlowSourceInstaller/terraform-scripts/backend-override.tf
  │
  └── READ BY TERRAFORM (FlowSourceInstaller/terraform-scripts/):
      ├── main.tf              ← Entry point: defines the helm module call
      ├── variables.tf         ← Declares all variable types
      ├── provider.tf          ← EKS connection (copied from provider.tf.eks)
      ├── backend-override.tf  ← S3 backend (just written above)
      └── modules/helm-install/
          ├── main.tf          ← The single helm_release resource
          ├── variables.tf     ← Module input declarations
          ├── providers.tf     ← Configures Helm provider with EKS token
          └── output.tf        ← Returns deployment status

PHASE 4 — post_build
  └── READ BY HELM (FlowSourceInstaller/helm-chart/):
      ├── Chart.yaml           ← Chart name, version, appVersion
      ├── values.yaml          ← Default values (overridden by /tmp/values-files/*.yaml)
      └── templates/
          ├── flowsource-deployment.yaml      ← Pod spec with image, ports, resources
          ├── flowsource-service.yaml         ← Kubernetes Service (ClusterIP port 7007)
          ├── flowsource-configmap.yaml       ← Environment variables ConfigMap
          ├── flowsource-secret-provider.yaml ← SecretProviderClass (AWS Secrets Manager)
          ├── flowsource-ingress.yaml         ← ALB Ingress rules (if enabled)
          ├── flowsource-service-account.yaml ← Kubernetes ServiceAccount (if create=true)
          └── config-map-from-files.yaml      ← app-config + all-configurations ConfigMaps
```

---

## 6. Phase-by-Phase Walkthrough

A CodeBuild buildspec has 4 phases that run in strict sequence:  
`install` → `pre_build` → `build` → `post_build`

If any phase fails, the build stops immediately and the pipeline stage is marked **Failed**.

---

### 6.1 `env` — Variables Available to All Phases

```yaml
env:
  variables:
    TERRAFORM_VERSION: "1.5.0"
    HELM_CHART_DIR:  "FlowSourceInstaller/helm-chart"
    TF_DEPLOY_DIR:   "FlowSourceInstaller/terraform-scripts"
    NAMESPACE:       "flowsource-dev"        # Kubernetes namespace
    DEPLOYMENT_NAME: "flowsource-dev"        # Helm release name
    TF_STATE_KEY:    "deploy/dev/terraform.tfstate"
    VALUES_S3_PREFIX: "flowsource/config/dev"

    # These are empty here — overridden by CodeBuild project env vars
    AWS_REGION:        ""
    CLUSTER_NAME:      ""
    TF_STATE_BUCKET:   ""
    TF_STATE_REGION:   ""
    TF_DYNAMODB_TABLE: ""
    CODEBUILD_ROLE_ARN: ""
```

**Important concept — Two sources of variables:**

| Variable | Defined In | Set To |
|----------|-----------|--------|
| `NAMESPACE`, `TF_STATE_KEY`, `VALUES_S3_PREFIX`, `HELM_CHART_DIR`, `TF_DEPLOY_DIR` | The buildspec file itself | Fixed values specific to DEV/QA/PROD |
| `AWS_REGION`, `CLUSTER_NAME`, `TF_STATE_BUCKET`, `CODEBUILD_ROLE_ARN` | CodeBuild project (configured by `bootstrap-codepipeline/main.tf`) | Your actual AWS values from `terraform.tfvars` |

The empty-string variables in the buildspec act as **placeholders**. The CodeBuild project injects the real values at runtime — like passing arguments to a function.

---

### 6.2 `install` — Setting Up the Worker's Tools

```yaml
phases:
  install:
    commands:
      - curl -sLo terraform.zip https://releases.hashicorp.com/terraform/1.5.0/...
      - unzip -q terraform.zip && mv terraform /usr/local/bin/

      - curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

      - curl -sLo kubectl "https://dl.k8s.io/release/.../kubectl"
      - chmod +x kubectl && mv kubectl /usr/local/bin/

      - apt-get install -y jq
```

**What is happening:** Every CodeBuild run starts as a completely clean, empty Ubuntu Linux container. Nothing is pre-installed. This phase downloads and installs the 4 tools needed for the rest of the script.

| Tool | Version | Why It Is Needed |
|------|---------|-----------------|
| **Terraform** | 1.5.0 | Orchestrates the Helm install; tracks state in S3 |
| **Helm** | Latest v3 | Does the actual `helm install` / `helm upgrade` to Kubernetes |
| **kubectl** | Latest stable | Checks namespace exists; verifies pod rollout after deploy |
| **jq** | OS package | Parses JSON — extracts image URI from `imageDetail.json` |

**Why Terraform AND Helm?** Helm alone has no memory — every `helm install` is treated as new. Terraform wraps the Helm install in a stateful resource (`helm_release`) so it knows whether to `install` (first time) or `upgrade` (subsequent runs).

---

### 6.3 `pre_build` — Connecting to AWS and EKS

This is the most important phase. It establishes all connections before any deployment work begins.

#### Step A — Assume IAM Role (Security)

```yaml
- CREDENTIALS=$(aws sts assume-role \
    --role-arn ${CODEBUILD_ROLE_ARN} \
    --role-session-name eks-deploy-dev \
    --duration-seconds 3600)
- export AWS_ACCESS_KEY_ID="$(echo ${CREDENTIALS} | jq -r '.Credentials.AccessKeyId')"
- export AWS_SECRET_ACCESS_KEY="$(echo ${CREDENTIALS} | jq -r '.Credentials.SecretAccessKey')"
- export AWS_SESSION_TOKEN="$(echo ${CREDENTIALS} | jq -r '.Credentials.SessionToken')"
```

**What it does:** CodeBuild has a base IAM role, but to communicate with the private EKS cluster and run Terraform, it needs to assume the `FlowSourceCodeBuildRole` which has specific EKS permissions. This is AWS STS (Security Token Service) — it returns temporary credentials valid for 1 hour. All subsequent `aws`, `kubectl`, and `terraform` commands use these temporary credentials.

**Why not just use the base CodeBuild role?**  
Security best practice — the base CodeBuild role has minimal permissions. The assumed role has just the EKS, ECR, and Secrets Manager permissions needed for deployment. This limits blast radius if credentials are ever compromised.

#### Step B — Connect kubectl to EKS

```yaml
- aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
```

**What it does:** Generates a `~/.kube/config` file on the CodeBuild container. This file contains:
- The EKS cluster's API server endpoint URL
- The SSL certificate authority data for verifying the server
- An authentication token

After this line, every `kubectl` command knows which cluster to talk to and how to authenticate.

#### Step C — Download Values Files from S3

```yaml
- mkdir -p /tmp/values-files
- aws s3 cp s3://${TF_STATE_BUCKET}/flowsource/config/dev/values.yaml \
           /tmp/values-files/values.yaml
- aws s3 cp s3://${TF_STATE_BUCKET}/flowsource/config/dev/app-config.yaml \
           /tmp/values-files/app-config.yaml
- aws s3 cp s3://${TF_STATE_BUCKET}/flowsource/config/dev/all-configurations.yaml \
           /tmp/values-files/all-configurations.yaml
```

**Why S3 and not git?**  
These 3 files contain environment-specific sensitive information — database hostnames, AWS Secrets Manager ARNs, integration URLs. They must **never be committed to git**. They are uploaded once using `cicd/scripts/upload-config-to-s3.sh` and every pipeline run downloads the latest version.

The 3 files serve distinct purposes:

| File | What It Contains | Where It Is Used |
|------|-----------------|-----------------|
| `values.yaml` | Docker image URI, replica count, namespace, ingress annotations, ALB subnets, secrets ARN | Helm values — controls deployment configuration |
| `app-config.yaml` | FlowSource application config: database connection, integrations (GitHub, Jira, SonarQube), URLs | Mounted as `/app/app-config.yaml` inside the pod |
| `all-configurations.yaml` | Backstage catalog definitions: org chart, teams, users, systems | Mounted as files in `/app/configurations/` inside the pod |

#### Step D — Get Image URI from Build Stage

```yaml
- aws s3 cp s3://${TF_STATE_BUCKET}/cicd-artifacts/imageDetail.json /tmp/imageDetail.json
- IMAGE_URI=$(cat /tmp/imageDetail.json | jq -r '.imageUri')
- echo "Deploying image: ${IMAGE_URI}"
```

The **Build stage** (which ran earlier in the pipeline) wrote this JSON file to S3:

```json
{
  "imageUri": "123456789.dkr.ecr.us-east-1.amazonaws.com/flowsource:1.0.5",
  "imageTag": "1.0.5",
  "ecrRegistry": "123456789.dkr.ecr.us-east-1.amazonaws.com",
  "ecrRepoName": "flowsource",
  "builtAt": "2026-04-01T10:00:00Z"
}
```

This is how the deploy stage knows **exactly which image was built** in this pipeline run. The `IMAGE_URI` variable is used for logging/verification. The actual image URI that gets deployed is set in your `values.yaml` file under `flowsource.flowsourceDeploy.image`.

#### Step E — Ensure Kubernetes Namespace Exists

```yaml
- kubectl get namespace ${NAMESPACE} || kubectl create namespace ${NAMESPACE}
```

Checks if `flowsource-dev` namespace exists in the EKS cluster. The `||` means: "if the get command fails (namespace not found), then create it." This makes the script safe to run for both first-time and subsequent deployments.

#### Step F — Set Up the EKS Terraform Provider

```yaml
- cp ${TF_DEPLOY_DIR}/provider.tf.eks ${TF_DEPLOY_DIR}/provider.tf
```

Copies `FlowSourceInstaller/terraform-scripts/provider.tf.eks` → `provider.tf`.

This file is the bridge that tells Terraform how to connect to Kubernetes. Here is its full content:

```hcl
# provider.tf.eks (what gets copied to provider.tf)

provider "aws" {
  region = var.region                    # ← Uses your AWS_REGION variable
}

data "aws_eks_cluster" "flowsource-cluster" {
  name = var.cluster_name               # ← Looks up EKS cluster by name
}                                        #   Gets: endpoint URL, CA certificate

data "aws_eks_cluster_auth" "flowsource-cluster" {
  name = var.cluster_name               # ← Gets a temporary auth token
}

locals {
  kubeconfig = {
    host                   = data.aws_eks_cluster.flowsource-cluster.endpoint
    cluster_ca_certificate = data.aws_eks_cluster.flowsource-cluster.certificate_authority.0.data
    token                  = data.aws_eks_cluster_auth.flowsource-cluster.token
  }
}
```

This `kubeconfig` local value flows down through:
- `terraform-scripts/main.tf` → passes `kubeconfig` to the `helm` module
- `modules/helm-install/providers.tf` → uses `kubeconfig` to configure the Helm provider
- The Helm provider then connects to Kubernetes using the token

**Why is it a `.eks` file and not just `provider.tf`?**  
There are 3 versions: `provider.tf.eks`, `provider.tf.aks`, `provider.tf.gke`. Only one is activated at a time by copying it. This makes the Terraform scripts reusable across cloud providers.

---

### 6.4 `build` — Terraform Plans the Helm Deploy

#### Step A — Write the S3 Backend Configuration

```yaml
- |
  cat > FlowSourceInstaller/terraform-scripts/backend-override.tf <<EOF
  terraform {
    required_version = "~> 1.3"
    backend "s3" {
      bucket         = "${TF_STATE_BUCKET}"
      key            = "deploy/dev/terraform.tfstate"
      region         = "${TF_STATE_REGION}"
      dynamodb_table = "${TF_DYNAMODB_TABLE}"
      encrypt        = true
    }
  }
  EOF
```

**What is happening:** This `cat` command **writes a new Terraform file** called `backend-override.tf` directly onto the CodeBuild container's disk — at runtime. The `${...}` variables are substituted by the shell before writing.

The resulting file looks like:

```hcl
terraform {
  required_version = "~> 1.3"
  backend "s3" {
    bucket         = "flowsource-tf-state-123456789"
    key            = "deploy/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "flowsource-tf-locks"
    encrypt        = true
  }
}
```

**Why write it dynamically?**  
The bucket name and region come from environment variables that are only known at pipeline runtime. They cannot be hardcoded in git. By writing the file dynamically, the same committed buildspec works in any AWS account and region.

**What is `terraform.tfstate`?**  
Terraform's memory file. It records: "I have a Helm release called `flowsource-dev` in namespace `flowsource-dev`, currently at chart version X, with these values." On the next pipeline run, Terraform reads this state and performs only the diff (change) — upgrading the Helm release rather than reinstalling from scratch.

Each environment has its own separate state key:
- DEV: `deploy/dev/terraform.tfstate`
- QA:  `deploy/qa/terraform.tfstate`
- PROD: `deploy/prod/terraform.tfstate`

#### Step B — Initialize Terraform

```yaml
- cd FlowSourceInstaller/terraform-scripts/
- terraform init -reconfigure
```

Terraform reads ALL `.tf` files in `FlowSourceInstaller/terraform-scripts/`. After Step A, those files are:

```
FlowSourceInstaller/terraform-scripts/
├── main.tf              ← Calls the helm module
├── variables.tf         ← All variable type declarations
├── provider.tf          ← Copied from provider.tf.eks in pre_build
└── backend-override.tf  ← Just written by the cat command above
```

`terraform init` then:
1. Downloads the **hashicorp/aws** provider (to call `aws_eks_cluster` data sources)
2. Downloads the **hashicorp/helm** provider (to run `helm install`)
3. Connects to S3 to read the existing state file (or creates a new one if first run)

The `-reconfigure` flag forces Terraform to use the new backend config without prompting.

#### Step C — Terraform Plan

```yaml
- terraform plan \
    -var="region=${AWS_REGION}" \
    -var="cluster_name=${CLUSTER_NAME}" \
    -var="chart=../../FlowSourceInstaller/helm-chart" \
    -var="namespace=flowsource-dev" \
    -var="deploymentname=flowsource-dev" \
    -var="clustertype=eks" \
    -var="create_namespace=true" \
    -var="values-files=[
        \"/tmp/values-files/values.yaml\",
        \"/tmp/values-files/app-config.yaml\",
        \"/tmp/values-files/all-configurations.yaml\"
    ]" \
    -out=tfplan-deploy-dev.out
```

Each `-var` feeds a value into `FlowSourceInstaller/terraform-scripts/variables.tf`.

| `-var` | Value | Purpose |
|--------|-------|---------|
| `region` | `us-east-1` | AWS region for EKS cluster lookup |
| `cluster_name` | `flowsource-cluster` | Which EKS cluster to deploy to |
| `chart` | `../../FlowSourceInstaller/helm-chart` | **Local path** to the Helm chart folder |
| `namespace` | `flowsource-dev` | Kubernetes namespace |
| `deploymentname` | `flowsource-dev` | Name of the Helm release |
| `clustertype` | `eks` | Tells Helm provider to use token auth (not cert auth like AKS) |
| `create_namespace` | `true` | Tells Helm to create the namespace if missing |
| `values-files` | 3 YAML file paths | Override files for the Helm chart |

The plan is saved to `tfplan-deploy-dev.out` — a binary snapshot of exactly what Terraform intends to do. The `post_build` phase applies this saved plan.

**What does the plan output show?**  
Terraform will show something like:
```
# helm_release.deployment will be created (first run)
# helm_release.deployment will be updated in-place (subsequent runs)
  + resource "helm_release" "deployment" {
      + name      = "flowsource-dev"
      + chart     = "../../FlowSourceInstaller/helm-chart"
      + namespace = "flowsource-dev"
      + values    = [ ... ]
    }
Plan: 1 to add, 0 to change, 0 to destroy.
```

---

### 6.5 `post_build` — Apply and Verify

#### Step A — Apply the Terraform Plan

```yaml
- terraform apply -auto-approve tfplan-deploy-dev.out
```

Terraform executes the saved plan. `-auto-approve` skips the interactive yes/no prompt (required in automated pipelines).

This triggers the full chain through the module files:

```
terraform apply
    │
    reads main.tf:
    │   module "helm" {
    │     source       = "./modules/helm-install"
    │     chart        = "../../FlowSourceInstaller/helm-chart"
    │     deploymentname = "flowsource-dev"
    │     namespace    = "flowsource-dev"
    │     values-files = ["/tmp/values-files/values.yaml", ...]
    │     kubeconfig   = local.kubeconfig    ← from provider.tf.eks
    │   }
    │
    enters modules/helm-install/main.tf:
    │   resource "helm_release" "deployment" {
    │     name      = "flowsource-dev"
    │     chart     = "../../FlowSourceInstaller/helm-chart"
    │     namespace = "flowsource-dev"
    │     values    = [file("values.yaml"), file("app-config.yaml"), file("all-configurations.yaml")]
    │   }
    │
    Helm provider (from modules/helm-install/providers.tf) connects to EKS:
    │   provider "helm" {
    │     kubernetes {
    │       host                   = kubeconfig.host
    │       cluster_ca_certificate = base64decode(kubeconfig.cluster_ca_certificate)
    │       token                  = kubeconfig.token
    │     }
    │   }
    │
    Helm reads FlowSourceInstaller/helm-chart/:
    │   Chart.yaml        ← chart metadata (name: flowsource, version: 0.1.2)
    │   values.yaml       ← default values (overridden by /tmp/values-files/*.yaml)
    │   templates/        ← Kubernetes YAML templates (processed with your values)
    │
    Helm merges templates + your 3 values files
    │
    Sends final Kubernetes manifests to the EKS API server
    │
    EKS creates / updates the Kubernetes resources (see Section 7)
```

#### Step B — Verify the Deployment

```yaml
- kubectl rollout status deployment/flowsource -n ${NAMESPACE} --timeout=300s || true
- kubectl get pods -n ${NAMESPACE}
- kubectl get svc  -n ${NAMESPACE}
```

**`kubectl rollout status`** watches the Deployment object until all pods are running the new image. It waits up to 5 minutes (300 seconds). If a pod fails to start (e.g., wrong image, crash loop), this command prints the failure details.

The `|| true` at the end means the build will NOT fail even if rollout is incomplete — the logs still show the status. You can remove `|| true` if you want the pipeline to fail on rollout problems.

**PROD only** has an additional check:
```yaml
- kubectl get ingress -n flowsource     ← Confirms the ALB Ingress was created
```

---

## 7. The Terraform → Helm Chain Explained

Here is how each file in `FlowSourceInstaller/terraform-scripts/` connects:

### `main.tf` — The Entry Point

```hcl
terraform {
  required_version = "~> 1.3"
}

provider "kubernetes" { }

module "helm" {
  source = "./modules/helm-install"   # ← points to the helm-install subfolder

  chart           = var.chart          # "../../FlowSourceInstaller/helm-chart"
  deploymentname  = var.deploymentname # "flowsource-dev"
  values-files    = var.values-files   # ["/tmp/values-files/values.yaml", ...]
  namespace       = var.namespace      # "flowsource-dev"
  kubeconfig      = local.kubeconfig   # from provider.tf.eks
  clustertype     = var.clustertype    # "eks"
  create_namespace = var.create_namespace  # true
  timeout         = var.timeout        # 120 seconds
}

output "status"       { value = module.helm.status }
output "chart_details" { value = module.helm.chart_details }
```

### `variables.tf` — All Input Declarations

Declares the type and description of every `-var` passed by the buildspec. Key ones:

```hcl
variable "cluster_name" { type = string }
variable "chart"         { type = string }   # local path to helm chart
variable "values-files"  { type = list   }   # list of YAML files
variable "namespace"     { type = string }
variable "clustertype"   {
  validation {
    condition = contains(["eks","aks","gke"], var.clustertype)
    # ← Fails fast if you pass a wrong value
  }
}
```

### `provider.tf` (copied from `provider.tf.eks`) — EKS Connection

```hcl
data "aws_eks_cluster" "flowsource-cluster" {
  name = var.cluster_name   # looks up cluster details from AWS API
}
data "aws_eks_cluster_auth" "flowsource-cluster" {
  name = var.cluster_name   # gets a short-lived auth token
}
locals {
  kubeconfig = {
    host                   = data.aws_eks_cluster.flowsource-cluster.endpoint
    cluster_ca_certificate = data.aws_eks_cluster.flowsource-cluster.certificate_authority.0.data
    token                  = data.aws_eks_cluster_auth.flowsource-cluster.token
  }
}
```

### `modules/helm-install/main.tf` — The Single Helm Resource

```hcl
resource "helm_release" "deployment" {
  name             = var.deploymentname          # "flowsource-dev"
  chart            = var.chart                   # "../../FlowSourceInstaller/helm-chart"
  version          = var.chartversion != "" ? var.chartversion : null
  repository       = var.chartrepository != "" ? var.chartrepository : null
  namespace        = var.namespace               # "flowsource-dev"
  values           = [for f in var.values-files : file(f)]  # reads each YAML file
  create_namespace = var.create_namespace        # true
  timeout          = var.timeout                 # 120
}
```

`file(f)` reads the content of each values file from disk (the `/tmp/values-files/` folder). Helm merges them left to right — later files override earlier ones.

### `modules/helm-install/providers.tf` — Helm Provider Configuration

```hcl
provider "helm" {
  kubernetes {
    host                   = var.kubeconfig.host
    cluster_ca_certificate = base64decode(var.kubeconfig.cluster_ca_certificate)
    token                  = var.kubeconfig.token    # ← EKS token (not used for AKS)
    client_certificate     = var.clustertype == "aks" ? base64decode(var.kubeconfig.client_certificate) : null
    client_key             = var.clustertype == "aks" ? base64decode(var.kubeconfig.client_key) : null
  }
}
```

For EKS (`clustertype = "eks"`), authentication uses the **token** from STS. For AKS it would use client certificates. This is why `clustertype` matters.

### `modules/helm-install/output.tf` — Deployment Status

```hcl
output "status" {
  value = helm_release.deployment.status
  # Returns: "deployed" or "failed"
}

output "chart_details" {
  value = "Chart: ${helm_release.deployment.metadata[0].chart}\n
           Namespace: ${helm_release.deployment.metadata[0].namespace}\n
           Deployment Name: ${helm_release.deployment.metadata[0].name}\n
           Application Version: ${helm_release.deployment.metadata[0].app_version}"
}
```

These outputs are visible in the CodeBuild logs after a successful deploy.

---

## 8. What Gets Created in Kubernetes

After `terraform apply` completes successfully, these Kubernetes resources exist in the cluster:

```
EKS Cluster
└── Namespace: flowsource-dev
    │
    ├── Deployment: flowsource
    │   ├── replicas: 1 (from values.yaml → global.replicaCount)
    │   └── Pod: flowsource-<hash>
    │       ├── Image:   123456789.dkr.ecr.us-east-1.amazonaws.com/flowsource:1.0.5
    │       ├── Port:    7007 (http)
    │       ├── Memory:  Request 1024Mi / Limit 1500Mi
    │       ├── CPU:     Request 500m  / Limit 1000m
    │       ├── EnvFrom: ConfigMap → flowsource-cm
    │       ├── EnvFrom: Secret    → flowsource-secrets
    │       └── VolumeMounts:
    │           ├── /app/app-config.yaml     ← from ConfigMap "app-config-yaml"
    │           ├── /app/configurations/     ← from ConfigMap "all-configuration-yamls"
    │           ├── /app/chatbot/            ← from ConfigMap "chatbot-jsons"
    │           └── /mnt/secrets-store       ← from SecretProviderClass (AWS Secrets Manager)
    │
    ├── Service: flowsource
    │   ├── Type: ClusterIP
    │   └── Port: 7007 → targetPort: http
    │       (not directly public — ALB Ingress routes traffic to this)
    │
    ├── ConfigMap: flowsource-cm
    │   └── Data (all from values.yaml → flowsource.flowsourceConfig):
    │       NODE_OPTIONS=--no-node-snapshot
    │       POSTGRES_SERVICE_HOST=<rds-endpoint>
    │       POSTGRES_SERVICE_PORT=5432
    │       POSTGRES_USER=<db-user>
    │       FLOWSOURCE_BASE_URL=http://<alb-url>
    │       FLOWSOURCE_VERSION=1.0.5
    │       S3_BUCKET_NAME=<bucket>
    │       ... (all other config keys)
    │
    ├── ConfigMap: app-config-yaml
    │   └── Data: full content of app-config.yaml
    │       (mounted as a file at /app/app-config.yaml inside the pod)
    │
    ├── ConfigMap: all-configuration-yamls
    │   └── Data: all-configurations.yaml content
    │       (mounted as files in /app/configurations/)
    │
    ├── SecretProviderClass: flowsource-secrets-provider
    │   ├── provider: aws
    │   ├── region: us-east-1
    │   ├── secretARN: arn:aws:secretsmanager:...:flowsource-app-secrets
    │   └── jmesPath mappings:
    │       GITHUB_TOKEN        → secretName: GITHUB_TOKEN
    │       AUTH_GITHUB_CLIENT_ID → secretName: AUTH_GITHUB_CLIENT_ID
    │       POSTGRES_PASSWORD   → secretName: POSTGRES_PASSWORD
    │       BACKEND_SECRET      → secretName: BACKEND_SECRET
    │       (These are pulled from AWS Secrets Manager into a K8s Secret)
    │
    ├── Secret: flowsource-secrets
    │   └── Created automatically by the CSI driver from SecretProviderClass
    │       Contains the actual secret values fetched from AWS Secrets Manager
    │
    └── Ingress: flowsource-ingress (only if values.yaml → flowsource.ingress.useIngress: true)
        ├── ingressClassName: alb
        └── Annotations:
            alb.ingress.kubernetes.io/scheme: internal
            alb.ingress.kubernetes.io/load-balancer-name: flowsource-dev-lb
            alb.ingress.kubernetes.io/subnets: subnet-xxx, subnet-yyy
            alb.ingress.kubernetes.io/target-type: ip
            → Routes all traffic (path: /) to Service: flowsource, port: 7007
```

---

## 9. DEV vs QA vs PROD — What Is Different

The three buildspec files are structurally identical. Only the values of certain variables differ:

| Setting | DEV | QA | PROD |
|---------|-----|----|------|
| **File** | `buildspec-deploy-dev.yaml` | `buildspec-deploy-qa.yaml` | `buildspec-deploy-prod.yaml` |
| `NAMESPACE` | `flowsource-dev` | `flowsource-qa` | `flowsource` |
| `DEPLOYMENT_NAME` | `flowsource-dev` | `flowsource-qa` | `flowsource` |
| `TF_STATE_KEY` | `deploy/dev/terraform.tfstate` | `deploy/qa/terraform.tfstate` | `deploy/prod/terraform.tfstate` |
| `VALUES_S3_PREFIX` | `flowsource/config/dev` | `flowsource/config/qa` | `flowsource/config/prod` |
| `role-session-name` | `eks-deploy-dev` | `eks-deploy-qa` | `eks-deploy-prod` |
| Plan file name | `tfplan-deploy-dev.out` | `tfplan-deploy-qa.out` | `tfplan-deploy-prod.out` |
| Rollout timeout | 300s (5 min) | 300s (5 min) | **600s (10 min)** |
| Extra kubectl check | None | None | `kubectl get ingress` |
| **Triggered by** | Automatically (after Build stage) | Manual approval → DEV gate | Manual approval → QA gate |
| **Replica count** | 1 (in `dev/values.yaml`) | 1 or 2 (in `qa/values.yaml`) | 2+ (in `prod/values.yaml`) |
| **Ingress** | Optional (dev may use port-forward) | Enabled with ALB | Enabled with ALB + HTTPS/OIDC |
| **RDS endpoint** | DEV database | QA database | PROD database |

The only real difference at runtime is which S3 folder the values files are downloaded from. All the environment customization lives in those 3 YAML files in S3 — not in the buildspec.

---

## 10. The Three Values Files — What They Contain

These files must be uploaded to S3 before the pipeline runs. Use `cicd/scripts/upload-config-to-s3.sh`. Use `cicd/config/dev-values.example.yaml` and `cicd/config/prod-values.example.yaml` as starting templates.

### `values.yaml` — Helm Deployment Configuration

This is the primary Helm override file. Key fields:

```yaml
global:
  replicaCount: 1               # Number of pods (use 2+ for prod)
  namespace: "flowsource-dev"   # Must match NAMESPACE env var

flowsource:
  ingress:
    useIngress: true            # Set true to create ALB Ingress
    ingressClass: alb
    annotations: |
      alb.ingress.kubernetes.io/scheme: internal
      alb.ingress.kubernetes.io/load-balancer-name: flowsource-dev-lb
      alb.ingress.kubernetes.io/subnets: subnet-xxx, subnet-yyy
      alb.ingress.kubernetes.io/target-type: ip

  flowsourceDeploy:
    image: "123456789.dkr.ecr.us-east-1.amazonaws.com/flowsource:1.0.5"
    imagePullPolicy: Always

  flowsourceConfig:
    NODE_OPTIONS: "--no-node-snapshot"
    POSTGRES_SERVICE_HOST: "<rds-endpoint>"  # ← environment-specific
    POSTGRES_SERVICE_PORT: "5432"
    POSTGRES_USER: "dbuser"
    FLOWSOURCE_BASE_URL: "http://<alb-dns>"  # ← environment-specific

  flowsourceSecrets:
    useSecretProvider: true
    secretproviderDetails:
      provider: aws
      aws:
        region: "us-east-1"
        secretARN: "arn:aws:secretsmanager:..."  # ← your Secrets Manager secret
      secretObjects:
        - keyVaultObjectName: GITHUB_TOKEN      # key name in Secrets Manager
          secretName: GITHUB_TOKEN              # name injected as env var in pod
        - keyVaultObjectName: POSTGRES_PASSWORD
          secretName: POSTGRES_PASSWORD
```

> ⚠️ **Critical:** Secret key names in AWS Secrets Manager must use **underscores** (e.g., `GITHUB_TOKEN`), NOT hyphens (e.g., `GITHUB-TOKEN`). The CSI Provider uses JMESPath which does not support hyphens in key names.

### `app-config.yaml` — FlowSource Application Configuration

Must have a single root key `appconfig:` with all content indented under it:

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
        port: ${POSTGRES_SERVICE_PORT}
        user: ${POSTGRES_USER}
        password: ${POSTGRES_PASSWORD}
        ssl:
          require: true
          rejectUnauthorized: true
  integrations:
    github:
      - host: github.com
        token: ${GITHUB_TOKEN}
  ...
```

The `${VARIABLE}` placeholders are resolved at runtime from the pod's environment variables (sourced from the ConfigMap and Secret).

Reference file: `FlowSourceInstaller/helm-chart/docs/example-app-config.yaml`

### `all-configurations.yaml` — Backstage Catalog Definitions

```yaml
allconfigurations:
  files:
    - name: all-configurations.yaml
      content: |-
        apiVersion: backstage.io/v1alpha1
        kind: Location
        metadata:
          name: all-configurations
        spec:
          targets:
            - ./org.yaml
            - ./systems.yaml
    - name: org.yaml
      content: |-
        apiVersion: backstage.io/v1alpha1
        kind: Group
        metadata:
          name: guests
        ...
```

Reference file: `FlowSourceInstaller/helm-chart/docs/example-all-configurations.yaml`

---

## 11. Helm Chart Templates — What Each File Produces

Located in `FlowSourceInstaller/helm-chart/templates/`. Helm processes each template using the merged values from your 3 values files and produces the final Kubernetes YAML.

| Template File | Kubernetes Resource Created | Controlled By |
|---------------|----------------------------|---------------|
| `flowsource-deployment.yaml` | `Deployment: flowsource` — pod spec with image, resources, ports, volume mounts | `values.yaml → flowsource.flowsourceDeploy` |
| `flowsource-service.yaml` | `Service: flowsource` — ClusterIP on port 7007 | `values.yaml → flowsource.service` |
| `flowsource-configmap.yaml` | `ConfigMap: flowsource-cm` — all non-secret env vars | `values.yaml → flowsource.flowsourceConfig` |
| `config-map-from-files.yaml` | `ConfigMap: app-config-yaml` and `all-configuration-yamls` | `app-config.yaml` and `all-configurations.yaml` |
| `flowsource-secret-provider.yaml` | `SecretProviderClass: flowsource-secrets-provider` — maps Secrets Manager to K8s secret | `values.yaml → flowsource.flowsourceSecrets` |
| `flowsource-ingress.yaml` | `Ingress: flowsource-ingress` — ALB routing rules | `values.yaml → flowsource.ingress` (only if `useIngress: true`) |
| `flowsource-service-account.yaml` | `ServiceAccount` — IRSA annotated account | `values.yaml → flowsource.flowsourceDeploy.serviceAccount` (only if `create: true`) |

---

## 12. How a New Version Deployment Works

When FlowSource releases version 1.0.6:

```
Step 1: Run the version update script
        ./cicd/scripts/update-version.sh 1.0.6
            │
            └── Updates FlowSourceInstaller/version/version.txt:
                image: flowsource:1.0.6

Step 2: Script commits and pushes → pipeline triggers

Step 3: Build stage reads version.txt → builds image tagged 1.0.6
        → writes imageDetail.json to S3 with new imageUri

Step 4: Deploy DEV stage runs
        → downloads imageDetail.json (imageUri = .../flowsource:1.0.6)
        → downloads values.yaml from S3 (still has old image tag)

        ⚠️ IMPORTANT: You must also update values.yaml to reference the
           new image tag and re-upload to S3:
           Edit: flowsource.flowsourceDeploy.image: ".../flowsource:1.0.6"
           Run:  ./cicd/scripts/upload-config-to-s3.sh dev <bucket> us-east-1

Step 5: Terraform detects the image change → Helm upgrade runs
        → Kubernetes performs rolling update:
           New pod with 1.0.6 starts → health check passes → old pod terminates

Step 6: Manual approval → QA deploy → Manual approval → PROD deploy
```

---

## 13. Troubleshooting Deploy Failures

### "Error: Kubernetes cluster unreachable"

The CodeBuild project is not running inside the VPC, or its security group cannot reach the EKS private endpoint.

**Check:**
1. In `bootstrap-codepipeline/terraform.tfvars`: `use_vpc = true`
2. `private_subnet_ids` are private subnets with NAT gateway access
3. `codebuild_security_group_ids` allows outbound port 443 to the EKS control plane security group

### "Error: failed to assume role"

The `CODEBUILD_ROLE_ARN` is wrong, or the base CodeBuild role does not have `sts:AssumeRole` permission.

**Check:**
```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::<account>:role/FlowSourceCodeBuildRole \
  --action-names sts:AssumeRole \
  --resource-arns arn:aws:iam::<account>:role/FlowSourceCodeBuildRole
```

### "Error: AccessDenied — s3:GetObject"

The assumed role cannot access the S3 bucket to download values files.

**Check:** The inline policy on `FlowSourceCodeBuildRole` includes the S3 bucket ARN correctly.

### "helm_release: context deadline exceeded"

The Helm install timed out. Default is 120 seconds.

**Fix:** Increase `timeout` variable in the Terraform plan, or check why the pod is not starting:
```bash
kubectl describe pod -n flowsource-dev -l app=flowsource
kubectl logs -n flowsource-dev -l app=flowsource
```

### "Pod CrashLoopBackOff after deploy"

The FlowSource container is crashing. Usually a misconfiguration.

**Check:**
```bash
kubectl logs -n flowsource-dev deployment/flowsource --previous
```

Common causes:
- Wrong database host/credentials in `values.yaml`
- Secrets Manager secret key names contain hyphens (must use underscores)
- IRSA role not annotated on the service account

### "SecretProviderClass not working — secrets not injected"

The CSI driver cannot fetch secrets from AWS Secrets Manager.

**Check:**
1. IRSA role is annotated on the `default` service account in the namespace
2. The secret key names in Secrets Manager use underscores (not hyphens)
3. The IRSA role has `secretsmanager:GetSecretValue` permission for the secret ARN

```bash
kubectl describe secretproviderclass flowsource-secrets-provider -n flowsource-dev
kubectl get events -n flowsource-dev --sort-by='.lastTimestamp'
```

### "Ingress created but ALB not provisioned"

The ALB Controller is not running or does not have sufficient permissions.

**Check:**
```bash
kubectl get pods -n alb-ingress
kubectl logs -n alb-ingress -l app.kubernetes.io/name=aws-load-balancer-controller
```

---

## Appendix — Quick Reference Commands

```bash
# Check what is deployed in DEV namespace
kubectl get all -n flowsource-dev

# View FlowSource pod logs
kubectl logs -n flowsource-dev deployment/flowsource -f

# Check secrets are mounted
kubectl exec -n flowsource-dev deployment/flowsource -- env | grep GITHUB_TOKEN

# Check Ingress and ALB DNS
kubectl get ingress -n flowsource-dev

# Manually trigger pipeline (re-deploy without a code push)
aws codepipeline start-pipeline-execution \
  --name flowsource-master-pipeline \
  --region us-east-1

# Upload updated values files to S3 (after editing)
./cicd/scripts/upload-config-to-s3.sh dev  <TF_STATE_BUCKET> us-east-1
./cicd/scripts/upload-config-to-s3.sh qa   <TF_STATE_BUCKET> us-east-1
./cicd/scripts/upload-config-to-s3.sh prod <TF_STATE_BUCKET> us-east-1

# Check Terraform state for DEV deployment
cd FlowSourceInstaller/terraform-scripts/
terraform state list    # Lists all resources Terraform knows about
terraform state show helm_release.deployment  # Full details of the Helm release
```

---

*Related documents:*
- *`cicd/README.md` — Full CI/CD pipeline overview and setup guide*
- *`cicd/bootstrap-codepipeline/` — Terraform that creates the CodePipeline*
- *`cicd/build-pipeline/buildspec-build-image.yaml` — Docker image build stage*
- *`cicd/infra-pipeline/` — EKS cluster and Helm resources provisioning*
- *`FlowSourceInstaller/ReadMe.MD` — Manual installation reference*
- *`FlowSource-infra-provision/aws/eks-flowsource-env/README.md` — EKS infra details*
