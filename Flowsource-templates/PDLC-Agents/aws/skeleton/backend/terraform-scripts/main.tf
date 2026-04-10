locals {
  common_tags = {
    Project     = "flowsource-pdlc"
    terraform   = "true"
  }
}

module "dynamodb_table" {
  source          = "terraform-aws-modules/dynamodb-table/aws"
  for_each        =  var.dynamodb_tables
  name                            = each.value.name
  hash_key                        = each.value.hash_key
  range_key                       = each.value.range_key
  attributes                      = [for k, v in each.value.columns : { name: k, type: v }]
  global_secondary_indexes        = each.value.global_secondary_indexes
  local_secondary_indexes         = each.value.local_secondary_indexes 

  table_class                     = each.value.table_class
  billing_mode                    = each.value.billing_mode
  write_capacity                  = each.value.write_capacity
  read_capacity                   = each.value.read_capacity

  server_side_encryption_enabled  = true

  tags = merge (
    {Name = each.key},
    local.common_tags
  )
}

module "pdlc_lambda_function" {
  source                = "./pdlc-lambda"
  for_each              =  var.pdlc_bot_lambda_functions

  lambda_function_file        = each.value.lambda_function_file
  lambda_functionname         = each.value.lambda_functionname
  lambda_handler              = each.value.lambda_handler
  lambda_runtime              = each.value.lambda_runtime
  layers                      = each.value.layers
  lambda_iam_role             = each.value.lambda_iam_role
  lambda_environment_variables = each.value.lambda_environment_variables

  lambda_function_memory      = each.value.lambda_function_memory
  lambda_function_timeout     = each.value.lambda_function_timeout

  security_group_ids          = each.value.security_groups
  subnet_ids                  = each.value.subnets
}

module "pdlc-apigw" {
  source    = "./pdlc-apigw"

  api_gw_specfile                        = var.api_gw_specfile
  api_service_lambda_functionname = var.api_service_lambda_functionname
  api_stage_name = var.api_stage_name
  api_source_vpc = var.api_source_vpc
  api_endpoint_type = var.api_endpoint_type
  api_private_endpoint = var.api_private_endpoint
  eks_irsa_role_arn = var.eks_irsa_role_arn

  depends_on = [module.pdlc_lambda_function]
}