# AKS Cluster Setup on Azure 

## Description
The repository contains the Terraform scripts required to setup an AKS cluster.

## Contents / Final Output
- Terraform scripts for setting up an AKS cluster.
- Configuration files including `variables.tf` and `backend.tf`.

## Pre-Requisites
Following are pre-requisites required before executing the scripts:

-   A Virtual Network with at least 1 subnets
    * One Subnet for AKS Nodes

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

By default when executing the Terraform scripts, the terraform state will be stored locally. It is recommended to manage state at a shared location in cloud storage. The configuration can be found in backend.tf. Update the required details as per your execution environment