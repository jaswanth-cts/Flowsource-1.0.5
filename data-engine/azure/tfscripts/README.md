## Overview
The repository contains the Terraform scripts required to setup an Azure functions and other dependency along with the Cosmos. PostgreSQL cluster on Azure for data engine
The scripts are created in the form of reusable modules which are assembled in main.tf. Modules provided for creating Azure function and RDS for Cosmos PostgreSQL database. The use of modules allows the flexibility. 

#### General Note:
Update the terraform.tfvars with the appropriate values for VNET, Subnets, Cluster name, resource group, storage account etc.
[Example tfvars] (terraform.exampletfvars) can be used as a reference.


The Terraform script does not create the Vnet, subnets or any Manage identity and these need to be created separately by the Admininstrators. The relvant values need to be provided in the tfvars file.

### Permissions Required
In order for the Terraform script to create the various resoutrces, the user executing the Terraform needs to have the relevant permissions for creation of Azure functions and RDS. 
Some of the permissions that might be needed are provided below. Please note that there might be additional Roles/policies needed as well depending on the environment.

| Type | Resource | Role | Scope |
| ---------------| ---------------------------------| ---------------- | ----------------------|
|Individual User |	Azure Function App              |  Contributor     | 	Resoure Level      |
|Managed Identity|	Storage Account	                |  Contributor     |	Resource Level     |
|Managed Identity|  Storage Account / Storage Blob Data                |  Reader Resource Level|
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
The configuration can be found in [backend.tf] (backend.tf). Update the required details as per your execution environment.

## Pre-Requisites
Following are pre-requisites required before executing the scripts:
-   VNET
-   Subnet(for azure function[web-delegation] and database )
-   Application Service plan
-   Appinsight application 
-   Managed Identity 
         Managed Identity - User Assigned Managed Identity to access below resource
             Database
             Storage
             Keyvault
             Azure function

-   Storage account (Create private end point)
-   Linked Service Name for Datalake & Postgress
-   Runtime integration 
-   Key Valuts
-   Bastion server (Private VM windows)
-   Azuew data factory


## General note
   CLI login command 
   az login \
  --service-principal \ 
  -t <Tenant-ID> \
  -u <Client-ID> \
  -p <Client-secret>  

## Run the Terraform script below Sequence order.
1. Cosmosdb (/fs-data-pipeline/cosmosdb)
   Update tfvars attribute values
   - resource_group_name    = <Resource group name>
   - rg_location            = <location details>
   - cosmosdb_cluster_name  = <db cluster name to create>
   - vnet_name              = <Vnet name >
   - subnet_name            = <subnet name >
   - managed_identity       = <Maanged identity name>
   - pwd                    = <DB password>

  After running the Terraform script and creating the Cosmos PostgreSQL, please log in to the console and navigate to the newly created database. In the Network settings, enable the "Allow public access from Azure services and resources within Azure to this cluster" checkbox. Next, go to the Authentication screen, select Microsoft Entr ID and add the Managed Identity name. This will complete the update and configuration process.

  2. Azure function (fs-data-pipeline\az_function_app)
     update tfvars attribute values
     - resource_group_name    = <Resource group name>
     - rg_location            = <location details>
     - storage_acct_name      = <Storage account name>
     - service_plan_name      = <Service plan name >
     - service_plan_name_os_type = <OS type either Linux / Windows >
     - managed_identity       = <Maanged identity name>
     -  az_func_asset =       = <Azure function name >
         - az_fun_name       =  <Azure function name>
             az_phy_file_zip   = <phython script absolute path>
             environment_var   = 
                    Provide the key pair values for Envionment variables
                    AZURE_CLIENT_ID                = "<azure client id>"
                    BASE_URL                       = "<BASE_URL>"
         Run the terraform script and validate all the assets are created in the Azure function
