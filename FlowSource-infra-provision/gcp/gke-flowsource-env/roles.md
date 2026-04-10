## Service Account 1 - Bastion Host ServiceAccounts (Optional) 

```
SA
  name: <SA_NAME>@<PROKECT_ID>.iam.gserviceaccount.com
roles: (Predefined SAs with roles needed to setup the project)
		roles/alloydb.admin
		roles/artifactregistry.admin
		roles/autoscaling.metricsWriter
		roles/compute.osLogin
		roles/container.developer (to be able to apply gcp-csi-driver and deploy the app)
		roles/logging.logWriter
		roles/monitoring.metricWriter
		roles/monitoring.viewer
		roles/storage.objectCreator
		roles/storage.objectViewer
```
Note: 
```
These roles can either be associated with a service account and mapped to a bastion host, else to an individual user account to provision the resources mentioned in "pre-requisites" and "run-on-bastion" folders.
If associated with service account use  Service Account 1 in  ./pre-requisites/bastion/terraform.tfvars service_account_email
```

##  Service Account 2 - GKE Cluster ServiceAccounts (Mandatory)
For GKE Cluster (GKE Cluster + Artifact Registry )
```
SA
name: <SA_NAME>@<PROKECT_ID>.iam.gserviceaccount.com

roles:
	roles/artifactregistry.reader
	roles/autoscaling.metricsWriter
	roles/logging.logWriter
	roles/monitoring.metricWriter
	roles/monitoring.viewer
	roles/stackdriver.resourceMetadata.writer
```
Note: 
```
Use Service Account 2 in  ./gke/terraform.tfvars service_account
```

##  Service Account 3 - Kubernetes workload ServiceAccount
For WorkLoad Identity Authentication from Flowosurce
Steps to create the service account for K8s 

#### Step 1 :- Create an IAM service account
```
gcloud iam service-accounts create <IAM_SA_NAME> --project=<IAM_SA_PROJECT_ID>
```
#### Step 2 :- Grant your IAM service account the roles that it needs on specific Google Cloud APIs:
```
gcloud projects add-iam-policy-binding <IAM_SA_PROJECT_ID> --member "serviceAccount:<IAM_SA_NAME@IAM_SA_PROJECT_ID>.iam.gserviceaccount.com" --role "ROLE_NAME"
```
#### Step 3 :-Create an IAM allow policy that gives the Kubernetes ServiceAccount access to impersonate the IAM service account:
```
gcloud iam service-accounts add-iam-policy-binding <IAM_SA_NAME@IAM_SA_PROJECT_ID>.iam.gserviceaccount.com --role roles/iam.workloadIdentityUser --member "<serviceAccount:PROJECT_ID>.svc.id.goog[NAMESPACE/KSA_NAME]"

Add the following roles to the service account
roles/compute.networkViewer
roles/iap.admin
roles/identitytoolkit.viewer
roles/secretmanager.secretAccessor
roles/iam.serviceAccountTokenCreator
roles/storage.objectCreator
roles/storage.objectViewer
roles/iam.workloadIdentityUser
```

### Link Kubernetes ServiceAccounts to IAM
(https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity#kubernetes-sa-to-iam)
To securely access Google Cloud APIs from your workloads running in Google Kubernetes Engine (GKE) clusters by using Workload Identity Federation for GKE
Note:
```
Use Service Account 3 in  FlowsourceInstaller values.yaml file for flowsourceDeploy.annotations
```
### Services to be enabled to setup the project:
```
alloydb.googleapis.com
cloudresourcemanager.googleapis.com
compute.googleapis.com
container.googleapis.com
containerregistry.googleapis.com
iap.googleapis.com
logging.googleapis.com
monitoring.googleapis.com
secretmanager.googleapis.com
servicenetworking.googleapis.com
```