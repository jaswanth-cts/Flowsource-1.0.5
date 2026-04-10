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

resource "google_cloudfunctions2_function" "data_agent" {
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
    timeout_seconds       = 900
    environment_variables = var.environment_var
    service_account_email = var.service_account_email
  }
  timeouts {
    create = "15m"
    update = "15m"
    delete = "15m"
  }

  depends_on = [
    google_storage_bucket_object.cloud_function_code
  ]
}

resource "google_cloudfunctions2_function_iam_member" "invoker" {
  project        = google_cloudfunctions2_function.data_agent.project
  location       = google_cloudfunctions2_function.data_agent.location
  cloud_function = google_cloudfunctions2_function.data_agent.name
  role           = "roles/cloudfunctions.invoker"
  member         = "serviceAccount:${var.service_account_email}"
}

resource "google_cloud_run_service_iam_member" "cloud_run_invoker" {
  project  = google_cloudfunctions2_function.data_agent.project
  location = google_cloudfunctions2_function.data_agent.location
  service  = google_cloudfunctions2_function.data_agent.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.service_account_email}"
}

resource "google_cloud_scheduler_job" "invoke_cloud_function" {
  name        = "${var.funct_name}-scheduler"
  description = "Schedule the HTTPS trigger for cloud function"
  schedule    = var.schedule
  project     = google_cloudfunctions2_function.data_agent.project
  region      = google_cloudfunctions2_function.data_agent.location

  http_target {
    uri         = google_cloudfunctions2_function.data_agent.service_config[0].uri
    http_method = "POST"
    oidc_token {
      audience              = "${google_cloudfunctions2_function.data_agent.service_config[0].uri}/"
      service_account_email = var.service_account_email
    }
  }
}
