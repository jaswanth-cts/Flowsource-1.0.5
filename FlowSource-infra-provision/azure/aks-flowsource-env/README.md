# Flowsource Setup on Azure 

## Overview
The repository contains the Terraform scripts required to setup an AKS cluster along with the Managed PostgreSQL Database on Azure for Flowsource.

The scripts are created in the form of reusable modules which are assembled in main.tf. Modules provided for creating AKS, Managed PostgreSQL database as well as installing Database and Cloudability agents required for Integrating with these solutions. The use of modules allows the flexibility to script additional resources and configure without requiring to touch the main scripts. 
Eg. In case Datadog and Cloudability integration is required uncomment the relevant portions in main.tf

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


## Azure Services Used
| Service | Description | Part of Terraform | Comments |
| --------| ------------| ------------------|----------|
| Container Registry | Required to push and pull Flowsource container images. The AKS cluster would pull images from the Container Registry using Managed Identity. The Kubelet Managed Identity of AKS should have ACR Pull access for the Registry. If Private registry is being sued then the required network connectivity should be in place as well | N | Is Considered  Pre-Requisite |
| Vnet | The Virtual Network within which the Cluster and Database has to be set up. | N | Is Considered  Pre-Requisite. Any necessary peering required with ACR should be performed. The Vnet is not being created as part of Terraform and being treated as pre-requisite is to ensure that any peering etc. that needs to be done with the Container Registry Network or Application Gateway etc can be done up-front. Additionally due to constraints/standards related to IPs for the network this would mostly be a pre-requisite |
| Application Gateway | Application Gateway which will be used as Public Facing Layer 7 Load Balancer for routing traffic to AKS. Azure Application Gateway Ingress Controller (AGIC) will be used as the Ingress Controller within AKS for all ingress | N | Is considered Pre-Requisite. The required peering to the Vnet for AKS Cluster should be performed. |
| User Assigned Managed Identity | 2 Managed Identities are required for the Kubelet and Control Plane respectively | N | Considered as Pre-Requisite so that the necessary role assignments required can be performed up-front. |
| Azure Key Vault | The AKS cluster will use Azure Key Vault as the Secrets Provider | N | Pre-Requisite.Required persmissions to be provided to the Kubelet Managed Identity to access Key Vault. The  secrets required by Flowsource should be created within Key Vault | 
| Azure Database for PostgreSQL Flexible Server | Managed Postgres Database required for Flowsource. The database will be setup in its own subnet in the same Vnet as AKS. Flowsource Application will be configured to point to this database | Y | |
| Azure Kubernetes Service | AKS cluster which will host the Flowsource application. The Namespace required by Flowsource Application is also created as part of the Terraform script. If Datadog and Aptio Cloudability are available these could be enabled as well, so that the necessary agents are set up at the time of cluster creation itself. AKS uses Azure Keyvaults as the Secrets provider and AGIC as the Ingress Controller. In addition to AGIC Nginx Ingress Controller needs to be set up post the cluster creation (using Terraform script for Helm). | Y | All secrets required by Flowsource will be present in Key Vault. AD authentication needs to be handled at Ingress. Since AGIC does not support this we need to additionally set up NGINX ingress controller with a Cluster IP Service. An AGIC ingress is then setup for the NGINX service.This can be done using the Terraform for Helm which is created. Flowsource application should be installed post this using the Terraform for Helm available as well. |



## Pre-Requisites
Following are pre-requisites required before executing the scripts:

-   A Virtual Network with at least 2 subnets
    * One Subnet for AKS Nodes
    * One Subnet for the Database. The database should have delegate access to `Microsoft.DBforPostgreSQL/flexibleServers`
-   Azure Container Registry - An Azure Container Registry is required which contains the Flowsource Container Image. 
    * The AKS Vnet should have Private Connectivity to ACR
    * The Managed Identity for Kubelet should have AcrPull Access to the Container Registry   
-   Azure Key Vault - The AKS cluster will use Azure Key Vault as the Secrets Provider.
-   User Managed Identities - Two User Managed Identities are required
    * Managed Identity for Kubelet. Will be used to access the Azure Key Vault and ACR and should have at least the below permissions:
        *  `AcrPull` role scoped to ACR
        *  `Key Vaults Secrets User` role scoped to the Azure Key Vault
        *   `Contributor` role scoped to Application Gateway
    * Managed Identity for Control Plan. It should have the below permission:
        *   `Managed Identity Operator` role on Kubelet Identity
            ```
            az role assignment create --assignee  <control-plane-identity-principal-id> --role "Managed Identity Operator" --scope "<kubelet-identity-resource-id>"
            ```
-   Application Gateway - The Application gateway that will be referred to by AGIC. The Managed Identity created after cluster creation will need to have `Contributor` role to Application Gateway and `Reader` access to the Resource Group in which the Application Gateway resides and `Network Contributor` acess to the VNET/Subnet the Application Gateway resides in.

## Nginx Ingress Controller Setup
Azure Application gateway does not have the feature to allow Authentication at the Application Gateway level. In order to implement SSO/Authentication at Ingress level, we need to additionally install and configure Oauth2 Proxy and NGINX Ingress.

Install Nginx Ingress controller using Helm (Use chart https://kubernetes.github.io/ingress-nginx version 4.10.0)
Use Terraform scripts in [flowsource-helm](../../flowsource-helm/) for this.
```
terraform apply --var-file <tfvars file>
```

The Nginx Ingress service should be of Type ClusterIP and will be exposed externally through AGIC Ingress

Create an AGIC Ingress for NGINX with the following command
```
cat <<EOF | kubectl apply -f -
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress-service-agic-ingress
  namespace: <Namespace for the ingress controller>
spec:
  ingressClassName: azure-application-gateway
  rules:
  - http:
      paths:
      - path: /
        backend:
          service:
            name: <Nginx Ingress Controller Service>
            port:
              number: <Nginx Ingress Controller Port>
        pathType: Prefix
EOF
```

**Example**
```
cat <<EOF | kubectl apply  -f -
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress-service-agic-ingress
  namespace: nginx-ingress
spec:
  ingressClassName: azure-application-gateway
  rules:
  - http:
      paths:
      - path: /
        backend:
          service:
            name: nginx-ingress-ingress-nginx-nginx-controller
            port:
              number: 80
        pathType: Prefix
EOF
```

## Flowsource Install
Flowsource can be installed on the AKS Cluster using Helm Charts. The helm charts are available at FlowSource-Package_version_x/FlowSourceInstaller/helm-chart

Unzip the release package and install the Helm charts using Terraform scripts in FlowSource-Package_version_x/FlowSourceInstaller/terraform-scripts -
```
terraform apply --var-file <tfvars file>
```
