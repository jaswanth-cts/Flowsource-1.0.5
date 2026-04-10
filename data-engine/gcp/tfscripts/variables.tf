
variable "project_id" {
  description = "The Project id of the GCP"
  type        = string
  default     = ""
}

variable "project_number" {
  description = "The Project number of the GCP"
  type        = string
  default     = ""
}

variable "region" {
  description = "Region"
  type        = string
  default     = "us-central1"
}

variable "service_account_email" {
  description = "Service account email"
  type        = string
  default     = ""
}

variable "user_account_email" {
  description = "Current user account email"
  type        = string
  default     = ""
}

variable "big_query_dataset" {
  description = "big query dataset name"
  type        = string
  default     = ""
}

variable "platform_engine_cloud_function_name" {
  description = "platform engine cloud function name"
  type        = string
  default     = ""
}

variable "platform_engine_filename" {
  description = "platform engine source code zip file name"
  type        = string
  default     = ""
}

variable "platform_engine_entry_point" {
  description = "entry point for the platform engine cloud function"
  type        = string
  default     = ""
}

variable "platform_engine_environment_variables" {
  description = "platform engine environment variables"
  type        = map(string)
  default     = {}
}

variable "data_agent_cloud_functions" {
  default = {}
  type = map(object({
    filename              = string
    cloud_function_name   = string
    entry_point           = string
    cron_expression       = string
    environment_variables = optional(map(string))
  }))
}
