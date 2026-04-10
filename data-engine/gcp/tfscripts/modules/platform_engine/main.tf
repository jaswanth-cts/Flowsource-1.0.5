resource "google_storage_bucket_object" "cloud_function_code" {
  name         = var.zip_file
  content_type = "application/zip"
  bucket       = var.bucket_name
  source       = var.zip_file
}

data "google_storage_bucket_object" "function_code" {
  bucket = google_storage_bucket_object.cloud_function_code.bucket
  name   = google_storage_bucket_object.cloud_function_code.name
}

resource "google_cloudfunctions2_function" "platform_engine" {
  name        = var.funct_name
  location    = var.location
  description = "a new function"

  build_config {
    runtime     = "python312"
    entry_point = var.entry_point
    source {
      storage_source {
        bucket      = data.google_storage_bucket_object.function_code.bucket
        object      = data.google_storage_bucket_object.function_code.name
        generation  = data.google_storage_bucket_object.function_code.generation
      }
    }
    service_account = var.service_account
  }

  service_config {
    min_instance_count    = 1
    available_memory      = "512M"
    timeout_seconds       = 540
    environment_variables = var.environment_var
    service_account_email = var.service_account_email
  }
  timeouts {
    create = "15m"
    update = "15m"
    delete = "15m"
  }

  event_trigger {
    trigger_region        = var.location
    event_type            = "google.cloud.storage.object.v1.finalized"
    retry_policy          = "RETRY_POLICY_RETRY"
    service_account_email = var.service_account_email
    event_filters {
      attribute = "bucket"
      value     = var.trigger_bucket_name
    }
  }

  depends_on = [
    google_storage_bucket_object.cloud_function_code
  ]
}
