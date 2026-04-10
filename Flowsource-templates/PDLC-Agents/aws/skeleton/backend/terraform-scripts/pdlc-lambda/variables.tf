variable "lambda_function_file" {
    description = "The zip file name for the lambda function"
    type  = string
}

variable "lambda_functionname" {
    description = "The lambda function name"
    type  = string
}

variable "lambda_handler" {
    description = "The handler file of the lambda function "
    type  = string
}

variable "lambda_runtime" {
    description = "The runtime environment of the lambda function"
    type  = string
}

variable "lambda_function_memory" {
  type = number
  description = "Amount of memory in MB Lambda Function can use at runtime"
  default = 128
}

variable "lambda_function_timeout" {
  type = number
  description = "Amount of time Lambda Function has to run in seconds"
  default = 30
}

variable "layers" {
    description = "The layers for the lambda function "
    type  = list(string)
    default = []
}

variable "lambda_iam_role" {
    description = "IAM role for Lambda function execution"
    type  = string
}

variable "lambda_environment_variables" {
    description = "Environment variables for Lambda function execution"
    type  = map(string)
    default = {}
}

variable "subnet_ids" {
  description = "List of subnet ids to associate with the Lambda Function"
  default = []
  type    = list(string)
}

variable "security_group_ids" {
  description = "List of security group ids to associate with the Lambda Function"
  default = []
  type    = list(string)
}