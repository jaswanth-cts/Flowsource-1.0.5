terraform {
  backend "gcs" {
    # bucket should be the same as var.backend_bucket_name
    bucket = "${{values.bucketName}}"
    prefix = "terraform-states/${{values.appName}}/${{values.appName}}-dev.tfstate"
  }
}
