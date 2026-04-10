# GCP Access

## Network Module

### Creates: 
Virtual Private Network (VPC) \
Subnets within the VPC \
Secondary ranges for the subnets \
routes \
firewall rules

### Enable APIs
Compute Engine API - compute.googleapis.com

### IAM
roles/compute.networkAdmin on the organization or folder

## Alloy-DB (postgres)

### configure private ip for PostgreSQL (https://cloud.google.com/sql/docs/postgres/configure-private-services-access#terraform)
Private IP Service is required for creating a private IP Postgres database. (Your network "dev-fs-peering-network" requires a private services access connection - You don't have permission to set up this connection. Contact someone with network administration permissions for help)

Private services access is implemented as a VPC peering connection between your VPC network and the underlying Google Cloud VPC network where your Cloud SQL instance resides.

https://cloud.google.com/sql/docs/postgres/configure-private-ip#terraform

### Enable APIs
Service Networking API - servicenetworking.googleapis.com

### IAM 
compute.networks.list \
compute.addresses.create \
compute.addresses.list \
servicenetworking.services.addPeering \

A service account in the service-HOST_PROJECT_NUMBER@service-networking.iam.gserviceaccount.com format is granted the servicenetworking.serviceAgent role while the private connection is created because the account is provisioned just-in-time.

## Bastion
Create a dedicated service account for the bastion host \
Create a GCE instance to be the bastion host \
Create a firewall rule to allow TCP:22 SSH access from the IAP (Identity-Aware Proxy (IAP) Tunneling) to the bastion \
Necessary IAM bindings to allow IAP and OS Logins from specified members \

### Enable APIs
Google Cloud Storage JSON API: storage-api.googleapis.com \
Compute Engine API: compute.googleapis.com \
Cloud Identity-Aware Proxy API: iap.googleapis.com \
OS Login API: oslogin.googleapis.com \

### IAM
roles/compute.osLogin Does not grant administrator permissions
roles/compute.osAdminLogin Grants administrator permissions.

## Kubernetes Engine 
(module "gke") (https://registry.terraform.io/modules/terraform-google-modules/kubernetes-engine/google/latest/submodules/private-cluster) \

Create a private GKE cluster with the provided addons \
Create GKE Node Pool(s) with provided configuration and attach to cluster \
Replace the default kube-dns configmap if stub_domains are provided \

### Enable APIs
Compute Engine APIs - compute.googleapis.com \
Kubernetes Engine APIs - container.googleapis.com \

### IAM
In order to execute this module you must have a Service Account with the following project roles: \
roles/compute.viewer \
roles/compute.securityAdmin (only required if add_cluster_firewall_rules is set to true) \
roles/container.clusterAdmin \
roles/container.developer \
roles/iam.serviceAccountAdmin \
roles/iam.serviceAccountUser \
roles/resourcemanager.projectIamAdmin (only required if service_account is set to create) \
Additionally, if service_account is set to create and grant_registry_access is requested, the service account requires the following role on the registry_project_ids projects: \

roles/resourcemanager.projectIamAdmin \

## Workload-identity

Workload Identity is the recommended way to access GCP services from Kubernetes.

### IAM 
roles/iam.workloadIdentityUser

