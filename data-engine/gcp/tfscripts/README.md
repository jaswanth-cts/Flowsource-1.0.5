# Data Engine Setup on GCP
## Overview
The repository contains the Terraform scripts required to setup Cloud Run Functions, Cloud Scheduler and BigQuery Dataset on GCP for Data Engine.

The scripts are created in the form of reusable modules which are assembled in main.tf. Modules provided for creating Cloud Run Functions, Cloud Scheduler and BigQuery Dataset. The use of modules allows the flexibility.

#### General Note:
Update the terraform.tfvars with the appropriate values:

## Pre-requisites for Service account for the Terraform script to run
    roles/bigquery.jobUser
    roles/cloudbuild.builds.builder
    roles/cloudfunctions.developer
    roles/eventarc.eventReceiver
    roles/iam.serviceAccountUser
    roles/secretmanager.secretAccessor
    roles/storage.objectViewer
    roles/artifactregistry.writer
    roles/logging.logWriter

## Running the Templates
Use Terraform Plan to view the resources which will be created/updated.
```
terraform plan -var-file <tfvars file>
```

Use Terraform Apply to create the resources
```
terraform apply -var-file <tfvars file>
```

The variables to be supplied can be referred from variables.tf

## Managing State
By default when executing the Terraform scripts, the terraform state will be stored locally. It is recommended to manage state at a shared location in cloud storage.

The configuration can be found in [backend.tf](backend.tf). Update the required details as per your execution environment

