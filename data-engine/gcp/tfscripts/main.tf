locals {
  project  = var.project_id
  sa_email = var.service_account_email
}

data "google_service_account" "service_account" {
  account_id = var.service_account_email
}

resource "google_bigquery_dataset" "fs_dataset" {
  dataset_id    = var.big_query_dataset
  friendly_name = "fs_dataengine"
  description   = "Dataset for the Flowsource Data Engine"
  location      = var.region

  labels = {
    env = "fs-prod"
  }

  access {
    role          = "OWNER"
    user_by_email = var.service_account_email
  }

  access {
    role          = "OWNER"
    user_by_email = var.user_account_email
  }
}

resource "google_storage_bucket" "Cloud_function_bucket" {
  name                        = "${local.project}-fs-data-engine-source"
  location                    = var.region
  project                     = var.project_id
  force_destroy               = true
  uniform_bucket_level_access = true
}

module "data_agent" {
  source = "./modules/data_agent"

  for_each              = var.data_agent_cloud_functions
  zip_file              = each.value.filename
  funct_name            = each.value.cloud_function_name
  bucket_name           = google_storage_bucket.Cloud_function_bucket.name
  location              = var.region
  entry_point           = each.value.entry_point
  service_account       = data.google_service_account.service_account.id
  service_account_email = var.service_account_email
  environment_var       = merge({ "GCP_PROJECT_ID" = var.project_number }, each.value.environment_variables)
  schedule              = each.value.cron_expression
}

module "platform_engine" {
  source = "./modules/platform_engine"

  zip_file              = var.platform_engine_filename
  funct_name            = var.platform_engine_cloud_function_name
  bucket_name           = google_storage_bucket.Cloud_function_bucket.name
  trigger_bucket_name   = var.platform_engine_environment_variables["STORAGE_NAME"]
  location              = var.region
  entry_point           = var.platform_engine_entry_point
  service_account       = data.google_service_account.service_account.id
  service_account_email = var.service_account_email
  environment_var       = merge({ "GCP_PROJECT_ID" = var.project_number }, var.platform_engine_environment_variables)
}
