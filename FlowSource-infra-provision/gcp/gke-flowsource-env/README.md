# Flowsource Setup in GCP

## Overview

```
The repository contains the Terraform scripts required to setup a GKE cluster along with the AlloyDB for PostgreSQL on GCP for Flowsource.

The scripts are created in the form of reusable modules which are assembled in main.tf. Modules provided for creating GKE and AlloyDB for PostgreSQL database. The use of modules allows the flexibility
```

## Pre-Requisites

Following are the pre-requisites that are required in-place before executing the terraform scripts for creating GKE cluster and AlloyDB

```
1) A VPC with at least two Private Subnets for EKS Worker Nodes across availability region with NAT gateway (for Outbound traffic)

2) A backend bucket to store the terraform state (Scripts placed inside - pre-requisites/backend)

3) Bastion host within the VPC which can be accessed via the IAP Desktop in order to access the  K8s control plane and AlloyDB if required

4) Google Artifact Registry - is required which contains the Flowsource Container Image (Scripts placed inside - pre-requisites/gar)

5) Private pool
```
Note:

```
The Terraform script does not create the VPC, subnets or IAM service accounts/roles. "Network" pre-requisites needs to be created manually by the GCP project administrators. Appropriate values needs to be updated in the terraform.tfvars placed in the following folder
- "network"
```

### Pre-Requisites folder (Run content of this folder from local terminal or bastion host)

1. To create new Backend Bucket (Storage) - [Scripts placed inside - pre-requisites/backend]

```
Update the terraform.tfvars with the appropriate values for:-
  - backend_bucket_name
  - project_id
  - region
```

2. To create new Bastion host(VM Instance) [applicable when running the code from local terminal. If running the code from bastion host, ignore this step]

```
Update the terraform.tfvars with the appropriate values for:-
  - vm_template_name
  - bastion_host_name
```

3. To create new GAR (Google Artifact Registry) [Scripts placed inside - pre-requisites/gar]

```
Update the terraform.tfvars with the appropriate values for:-
  - project_id
  - region
  - gar_repo
```

4. Update the following details in "network"

```
Below resources should be created in GCP by administrator
  - Enable Google Services (refer to "Services to be enabled to setup the project" in roles.md ) 
  - VPC
  - 2 Private/1 Public Subnets
  - NAT Gateway
  - Default Firewall rules for K8s communication
  - Private Service Access (Refer to "configure private ip for PostgreSQL" in gcp_access.md)

Following details needs to be updated by user in "terraform.tfvars" file
  - project_id
  - region
  - network_name
  - subnets
  - IPs
  - peering network details
```
Once the peering network is created execute  below commands,

```
gcloud compute addresses create <peering-private-pool-reserved-ip> network-name> e --global --purpose=VPC_PEERING --addresses=192.168.0.0 --prefix-length=20 --network=<peering-network-name> 

gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=<peering-private-pool-reserved-ip>  --network=<peering-network-name>

gcloud compute networks peerings update servicenetworking-googleapis-com --network=<peering-network-name> --export-custom-routes --no-export-subnet-routes-with-public-ip
```
5. Private Pool and VPN for Cloud Build
   Once VPN is created and BGP is established. Run following gcloud commands to update the bgp peer

```
gcloud compute routers update-bgp-peer <source_vpn_router> --peer-name=<source_vpn_router_peer1> --region=us-east1 --advertisement-mode=CUSTOM --set-advertisement-ranges=<GKE_Master_Control_Plane_CIDR>

gcloud compute routers update-bgp-peer <source_vpn_router> --peer-name=<source_vpn_router_peer2> --region=us-east1 --advertisement-mode=CUSTOM --set-advertisement-ranges=<GKE_Master_Control_Plane_CIDR>

gcloud compute routers update-bgp-peer <peering_vpn_router> --peer-name=<peering_vpn_router_peer1> --region=us-east1 --advertisement-mode=CUSTOM --set-advertisement-ranges=192.168.0.0/20

gcloud compute routers update-bgp-peer <peering_vpn_router> --peer-name=<peering_vpn_router_peer2> --region=us-east1 --advertisement-mode=CUSTOM --set-advertisement-ranges=192.168.0.0/20
```

## Pre-requisites for Service account for the below Terraform script to run

```
1) GKE cluster (Refer roles.md - "Service Account 2 - GKE Cluster ServiceAccounts")

2) Kubernetes ServiceAccounts (Refer Role.md - "Service Account 3 - Kubernetes workload ServiceAccount" and "link Kubernetes ServiceAccounts to IAM)
```

### To create new cluster & AlloyDB (Postgres) with existing VPC

## 1. To create new GKE Cluster :-

Update the terraform.tfvars with the appropriate values for:-
  - gke_cluster_name - GKE Cluster Name
  - master_cidr - The IP range in CIDR notation to use for the hosted master network.
  - cluster_resource_labels - The GKE resource labels (a map of key/value pairs) to be  applied to the cluster
  - node_pools.name - The name of the node pool for the gke cluster
  - node_pools.label - Map of maps containing node labels by node-pool name
  - DO NOT REMOVE -- "enable-oslogin" = "true" -- required for bastion access

## 2. To create new Alloy DB (PostgreSQL):-

Update the terraform.tfvars with the appropriate values for:-
  - adb_cluster_name
  - project_id
  - region
  - network_name
  - primary_db_cluster_zones
  - read_pool_cluster_zones
  - user
  - password

### Permissions Required
In order for the Terraform script to create the various resoutrces, the user executing the Terraform needs to have the relevant permissions for creation of EKS cluster and AlloyDB for PostGress & Pre-Requisites folder 

#### Note:-

Some of the permissions that might be needed are provided below. Please note that there might be additional permissions/policies needed as well depending on the environment.

#### Terraform scripts to create GKE & AlloyDB is placed in Pre-Requisites folder

#### GKE Cluster & AlloyDB(Postgress)

        - Artifact Registry Administrator
        - Compute Network Admin
        - Compute OS Login
        - Compute Security Admin
        - Compute Viewer
        - Kubernetes Engine Admin
        - Logs Writer 
        - Monitoring Admin 
        - Monitoring Viewer
        - Secret Manager Admin 
        - Storage Admin
        - Viewer
        - Alloy admin

 ## services to be enabled to setup the project:
   - alloydb.googleapis.com
   - cloudresourcemanager.googleapis.com
   - compute.googleapis.com
   - container.googleapis.com
   - containerregistry.googleapis.com
   - iap.googleapis.com
   - logging.googleapis.com
   - monitoring.googleapis.com
   - secretmanager.googleapis.com
   - servicenetworking.googleapis.com
   - alloydb.googleapis.com
   - cloudresourcemanager.googleapis.com
   - compute.googleapis.com
   - container.googleapis.com
   - containerregistry.googleapis.com
   - iap.googleapis.com
   - logging.googleapis.com
   - monitoring.googleapis.com
   - secretmanager.googleapis.com
   - servicenetworking.googleapis.com

 ### Create Service account roles required

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

### Flowsource installation step

# Install latest Software in Bastion server

    1. gcloud CLI
    2. Helm
    3. kubectl

# Configure kubectl to Connect google GKE cluster
```
gcloud container clusters get-credentials <Cluster Name> --region <Region> --project <Project id>
```
# Google Secrets Store CSI Provider Setup
```
To enable the injection of secret as environment variable, need to install the CSI drivers for Google Secrets Secret Manager using Helm. The Helm chart takes care of creating the required cluster roles required for the CSI driver. These need to be exeucted from a host (within VPC) which can access the private GKE Cluster endpoint.

Download google helm chart from github repo (using below link) in gcp-csi-driver directory and update the gcp_csi_chart name in terraform.tfvars with the correct charts directory name to ensure both charts are installed correctly.
("https://github.com/GoogleCloudPlatform/secrets-store-csi-driver-provider-gcp/tree/main/charts/secrets-store-csi-driver-provider-gcp")

The Terraform scripts present in (run-on bastion/gc-csi-driver folder will install the charts for CSI drivers).
Steps to install CSI Driver:

1. Download the "templates" folder, "Chart.yaml" and "values.yaml" files
2. Create a folder of choice within "Flowsource_Package_x\FlowSource-infra-provision\gcp\gke-flowsource-env\run-on-bastion\gcp-csi-driver". E.g. "secretsprovider"
3. Copy the downloaded files to the folder created in step.2
4. Update the chart path in terraform.tfvars. Field name "gcp_csi_chart". E.g. "./secretsprovider"
```
## Configure Kubernetes ServiceAccounts to IAM

  Pre-requisites(GCP Console):- 
      Create Secret Manager <secret Manager Name> for adding the secret keys for the flowsource app and create secrets object Ref file (Flowsource-Charts-main\docs\example-values.yaml
         under the section  SecreteObject & secrets)

  For Work Load Identity,Default Kubernetes Service Account from the namespace can be used or a new Kubernetes service account can be created(along with annotaion) with the Flowsource installer.
      
### Annotate Service account with mail account in case default Kubernetes service account is being used .
kubectl annotate serviceaccount default --namespace flowsource  iam.gke.io/gcp-service-account=<Service account EX-saflowsourcek8s-dev@Project-ID-gc.iam.gserviceaccount.com>

# Auth UI

```
To set-up Auth UI, refer document placed in the following path
"Flowsource_Package_version_x" -> "proxied-authentication" -> "Google-IAP.pdf"
```

# Flowsource Installation

```
Flowsource can be installed on the GCP cluster using the Terraform scripts and Helm Charts availabe in the path "Flowsource_Package_version_x" -> "FlowSourceInstaller" -> "terraform-scripts"

Pre-requisites:
In order to access AlloyDb from flowsource instance on GKE cluster securely, fetch the certificate of the alloydb using below command from shell
and add it in the all-configurations.yaml file in FlowsourceInstaller as flowsource-rds-certificate.pem
openssl s_client -starttls postgres -showcerts -connect <InternalIP of Alloy DB>:5432

Unzip the release package and install the Helm charts using Terraform scripts in FlowSource-Package_version_x/FlowSourceInstaller/terraform-scripts 

For detailed steps refer to "ReadMe.md" file placed in "Flowsource_Package_version_x" -> "FlowSourceInstaller" -> "terraform-scripts"
```

