### Backend Bucket
variable "backend_bucket_name" {
  description = "Name of the bucket where terraform state file will be stored"
  type        = string
}

variable "region" {
  description = "The region in which to create the resources"
  type        = string
}

variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
}
