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