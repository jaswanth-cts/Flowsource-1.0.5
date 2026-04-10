#Uncomment and add the relevant backend to store state in Azure Storage

#terraform {
#    required_version = "~> 1.3"
#    backend "azurerm" {
#      resource_group_name  = ""
#      storage_account_name = ""
#      container_name       = ""
#      key                  = "terraform.tfstate"
#  }
#}

#Uncomment and add the relevant backend to store state in Google Cloud Storage
/*
terraform {
  backend "gcs" {
    # bucket should be the same as var.backend_bucket_name
    bucket = "flowsource-gke-terraform-state"
    prefix = "terraform/state/dev/flowsource-app"
  }
}
*/