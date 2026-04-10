variable "region" {
  description = "The region where the resources will be created"
  type = string
  default = "us-east-1"
}

variable "dynamodb_tables" {
  type = map(object({
    name                  = string
    columns               = optional(map(string), {})
    hash_key              = optional(string, null)
    range_key             = optional(string, null)
    global_secondary_indexes        = optional(any, [])
    local_secondary_indexes         = optional(any, [])

    table_class                     = optional(string, null)
    billing_mode          = optional(string, "PAY_PER_REQUEST")
    read_capacity         = optional(number, null)
    write_capacity        = optional(number, null)

  }))
  default           = {}
  description       = <<EOT
  Details of the Dynamo DB tables to be created. 
      The configuration for each table to be created is provided as a Map where the Key of the map is the Dynamo DB table name
      key: {
        name          : name of the table
        columns       : Map of attribute definitions. Only required for hash_key and range_key attributes. Each attribute has two properties: name - The name of the attribute and is specified as the key, type - Attribute type, which must be a scalar type: S, N, or B for (S)tring, (N)umber or (B)inary data and specifed as the value"
        hash_key      : Attribute to use as the hash (partition) key. Must also be defined as an attribute.
        range_key     : Attribute to use as the range (sort) key. Must also be defined as an attribute
        global_secondary_indexes       : Describe GSIs for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. 
        local_secondary_indexes        : Describe LSIs on the table; these can only be allocated at creation so you cannot change this definition after you have created the resource.

        table_class   : The storage class of the table. Valid values are STANDARD and STANDARD_INFREQUENT_ACCESS
        billing_mode  : Controls how you are billed for read/write throughput and how you manage capacity. The valid values are PROVISIONED or PAY_PER_REQUEST
        read_capacity : The number of read units for this table. If the billing_mode is PROVISIONED, this field should be greater than 0, else its not required
        write_capacity: The number of write units for this table. If the billing_mode is PROVISIONED, this field should be greater than 0, else its not required

      }
  EOT
} 

variable "pdlc_bot_lambda_functions" {
  default = {}
  type = map(object({
    lambda_function_file                    = string
    lambda_functionname        = string
    lambda_iam_role         = string
    lambda_handler              = string
    security_groups             =optional(list(string))
    subnets                   =optional(list(string))
    lambda_runtime                     = string
    lambda_function_memory      = optional(number)
    lambda_function_timeout     = optional(number)
    layers                      = optional(list(string))
    lambda_environment_variables       = optional(map(string))
  }))

  description                   = <<EOT
  Details of the Lambda Functions to be created.
  key: {
    lambda_function_file: (Required) Zip file containing the lambda function code. Should be absolute or relative path
    lambda_functionname: (Required) Name of the Lambda function
    lambda_iam_role: (Required) ARN of the Lambda Execution role
    lambda_handler: (Required) Name of the entry point for Lambda
    lambda_runtime: (Required) The Lambda runtime eg python, node, etc.
    lambda_function_timeout: (Optional) Amount of time Lambda Function has to run in seconds. Defaults to 30 seconds
    layers: (Required) Details of layers to attach to Platform Enging Lambda function. Should be the list of keys for existing and new layers specified in the input.
    lambda_environment_variables: (Optional) Key value pair of environment variables to configure
  }
  EOT
}

variable "api_gw_specfile" {
  type = string
  description = "The relative or absolute path of the api spec JSON file"
}

variable "api_service_lambda_functionname" {
  type = string
  description = "Name of the Lambda Function for the backend service"
}

variable "disable_execute_api_endpoint" {
  type = bool
  description = "Whether clients can invoke your API by using the default execute-api endpoint. By default, clients can invoke your API with the default https://{api_id}.execute-api.{region}.amazonaws.com endpoint. Set to true to disable this behaviour"
  default = false
}

variable "api_endpoint_type" {
  type = string
  description = "List of endpoint types. This resource currently only supports managing a single value. Valid values: EDGE, REGIONAL or PRIVATE. If unspecified, defaults to EDGE. If set to PRIVATE recommend to set put_rest_api_mode = merge to not cause the endpoints and associated Route53 records to be deleted. Refer to the documentation for more information on the difference between edge-optimized and regional APIs."
}

variable "api_stage_name" {
  type = string
  description = "API Deployment stage name"
}

variable "api_source_vpc" {
  type = list(string)
  description = "API gateway's Source VPC "
}

variable "api_private_endpoint" {
  description = "The private end point for the incoming network traffic"
  type = list(string)
}

variable "eks_irsa_role_arn" {
  type = string
  description = "ARN value of the role associated with EKS cluster where Flowsource is deployed"
}