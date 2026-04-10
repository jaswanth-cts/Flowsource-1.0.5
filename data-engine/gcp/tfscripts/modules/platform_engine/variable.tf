variable "zip_file" {
  description = "Zip file name"
  type        = string
  default     = ""
}

variable "funct_name" {
  description = "The cloud run function name"
  type        = string
  default     = ""
}

variable "bucket_name" {
  description = "The bucket name to store the source code"
  type        = string
  default     = ""
}

variable "trigger_bucket_name" {
  description = "The bucket name from where the function will trigger"
  type        = string
  default     = ""
}

variable "location" {
  description = "Location"
  type        = string
  default     = ""
}

variable "entry_point" {
  description = "The entry point of the cloud run function"
  type        = string
  default     = ""
}

variable "service_account" {
  description = "Service account to create the cloud run function"
  type        = string
  default     = ""
}

variable "service_account_email" {
  description = "Service account to run the cloud run function"
  type        = string
  default     = ""
}

variable "environment_var" {
  description = "Environment variables for the cloud run function"
  type        = map(string)
}
