variable "platform_engine_function_name" {
  description = "The name of the Lambda function for Platform engine"
  default = "lambda_platform_engine"
  type    = string
}

variable "platform_engine_file" {
  description = "Zip file containing the platform engine lambda function code. Should be absolute or relative path"
  type = string

}

variable "platform_engine_handler" {
  description = "The name of the handler function which is the function entrypoint"
  type = string

}

variable "platform_engine_runtime" {
  description = "The runtime for the platform engine function"
  type = string
  default = "python3.12"
}

variable "platform_engine_lambda_env_variables" {
  description = "The environment variables for Platform Engine Lambda Function"
  type = map(string)
  default = {}
}

variable "platform_engine_timeout" {
  description = "Amount of time Lambda Function has to run in seconds. Defaults to 3"
  type = number
}

#Name of the Lambda Execution role
variable "platform_engine_iam_role" {
  description = "Name of the Lambda Execution role to be assumed for Lambda Execution. the role should have permissions to access the required services such as Athena, S3, Redshift, Cloudwatch, etc."
  type = string
}

variable "platform_engine_lambda_subnet_ids" {
  description = "List of subnet ids to associate with platform engine lambda function"
  default = []
  type    = list(string)
}

variable "platform_engine_lambda_security_group_ids" {
  description = "List of security group ids to associate with platform engine lambda function"
  default = []
  type    = list(string)
}

variable "platformengine_s3_bucket_notification_trigger" {
  type = object({
    bucket_name: string
    events: list(string)
    filter_suffix: optional(string)
    filter_prefix: optional(string)
    source_account: optional(string)
  })
  description = <<EOT
    Details for the S3 trigger for Platform Engine with the following attributes
    bucket_name: (Required) Name of the S3 bucket
    events: (Required) List of events for which the trigger is to be fired
    filter_suffix: (Optional) Object key name suffix
    filter_prefix: (Optional) Object key name prefix
    source_account: (Optional) AWS Account for the S3 bucket
  EOT
}

variable "region" {
  default = "us-east-1"
}

variable "plaform_engine_lambda_layers" {
  default = []
  type = list(string)
  description = "Details of layers to attach to Platform Enging Lambda function. Should be the list of keys for existing and new layers specified in the input."
}

variable "new_lamda_layers" {
  description = "Details of the Lambda layers"
  default = {}
  type = map(object({
    filename              = string
    compatible_runtimes   = optional(list(string))
    name                  = string
  }))
}

variable "existing_lamda_layers" {
  description = "Details of AWS Lambda layers used"
  default = {}
  type = map(object({
    arn  = string
  }))
}

variable "data_agent_lambda_functions" {
  default = {}
  type = map(object({
    filename                    = string
    lambda_function_name        = string
    iam_role_for_lambda         = string
    lambda_handler              = string
    runtime                     = string
    timeout                     = number
    layers                      = list(string)
    security_group_ids          = list(string)
    subnet_ids                  = list(string)
    environment_variables       = optional(map(string))
  }))

  description                   = <<EOT
  Details of the Lambda Functions to be created.
  key: {
    filename: (Required) Zip file containing the lambda function code. Should be absolute or relative path
    lambda_function_name: (Required) Name of the Lambda function
    iam_role_for_lambda: (Required) ARN of the Lambda Execution role
    lambda_handler: (Required) Name of the entry point for Lambda
    runtime: (Required) The Lambda runtime eg python, node, etc.
    timeout: (Required) Amount of time Lambda Function has to run in seconds. Defaults to 3
    layers: (Required) Details of layers to attach to Platform Enging Lambda function. Should be the list of keys for existing and new layers specified in the input.
    security_group_ids: (Required) List of security group ids to associate with platform engine lambda function
    subnet_ids: (Required) List of subnet ids to associate with platform engine lambda function
    environment_variables: (Optional) Key value pair of environment variables to configure
  }
  Example:
  data_engine: {
    filename: "package/data_engine.zip",
    lambda_function_name: "lambda_data_engine",
    iam_role_for_lambda: "test_role",
    lambda_handler: "lambda_function.py",
    runtime: "python3.12",
    layers: ["redshift", "dataagent"],
    security_group_ids: ["sg1"],
    subnet_ids: ["sn1", "sn2"],
    environment_variables: {"key1" = "Value1", "key2" = "value2"}
  }
  EOT
}

# All Cloud Watch Events (invoking Lambda as target) to be configured
variable "cloud_watch_lambda_event_triggers" {
  type = map(object({
    name: string
    schedule_expression: string
    description: string
    targets: list(string)
  }))
  description = <<EOT
  Details such as Name, Schedule Expression, Target Lambda Functions, of all Cloud Watch Event Triggers to be configured.
    key: {
      name: (Required) Name for the Event Rule
      schedule_expression: (Required) The scheduling expression. For example, cron(0 20 * * ? *) or rate(5 minutes)
      description: (Optional) Optional description for the event rule
      targets: (Required) List of targets for the event. This should be the list of  keys of the Lambda Functions specified in the inputs.
    }
  EOT    
  default = {}
}

variable "athena_external_tables" {
  type = map(object({
    name            = string
    database_name   = string
    description     = optional(string)
    s3_location     = string
    columns         = map(string)
  }))
  default           = {}
  description       = <<EOT
  Details of the table

  EOT
} 

variable "redshift_admin_username" {
  type = string
  description = "The username of the administrator"
}

variable "redshift_database_name" {
  type = string
  description = "The name of the database created"
}

variable "redshift_iam_roles" {
  type = list(string)
  description =  "List of IAM roles (ARN) to associate with Redshift"
}

variable "redshift_serverless" {
  default = null
  type = object({
    namespace   = string
    workgroup   = object({
      name            = string
      base_capacity   = optional(number)
      max_capacity    = optional(number)
      subnets         = list(string)
      security_groups = list(string)
    })

    usage_limits  = optional(object({
      amount  = number
      period  = optional(string)
      usage_type = string
      breach_action = optional(string)
    }))      
  })

  description = <<EOT
    Configuration for Redshift Serverless
    namespace: (Required) The namespace name
    workgroup: {
      name: (Required) Name of the workgroup
      base_capacity: (Optional) The base data warehouse capacity of the workgroup in Redshift Processing Units (RPUs)
      max_capacity: (Optional) he maximum data-warehouse capacity Amazon Redshift Serverless uses to serve queries, specified in Redshift Processing Units (RPUs)
      subnets: (Required) List of subnet ids for Redshift
      security_groups: (Required) List of security groups to associate
    }
    usage_limits (Optional): {
      amount: (Required) If usage limit is specified amount is required. If time-based, this amount is in Redshift Processing Units (RPU) consumed per hour. If data-based, this amount is in terabytes (TB) of data transferred between Regions in cross-account sharing. The value must be a positive number
      usage_type: (Required) The type of Amazon Redshift Serverless usage to create a usage limit for. Valid values are serverless-compute or cross-region-datasharing
      period: (Optional) The time period that the amount applies to. Valid values are daily, weekly, monthly
      breach_action: (Optional) he action that Amazon Redshift Serverless takes when the limit is reached. Valid values are log, emit-metric, and deactivate 
    }
  EOT
}

variable "redshift" {
  default = null
  type = object({
    cluster_identifier  = string
    node_type           = string
    number_of_nodes     = number
    encrypted           = bool
    kms_key_arn         = optional(string)
    security_groups     = list(string)
    subnets             = list(string)
    allow_version_upgrade = optional(bool)
    automated_snapshot_retention_period = optional(number)
    manual_snapshot_retention_period = optional(number)
    cluster_version = optional(string)
    multi_az = optional(bool)
    availability_zone_relocation_enabled = optional(bool) # Only available when using the ra3.x type
    availability_zone = optional(string)
    snapshot_copy = any  #Refer https://github.com/terraform-aws-modules/terraform-aws-redshift/blob/master/examples/complete/main.tf for example
    snapshot_schedule_definitions = optional(list(string))
    usage_limits = any # Refer https://github.com/terraform-aws-modules/terraform-aws-redshift/blob/master/examples/complete/main.tf for example
  })
}