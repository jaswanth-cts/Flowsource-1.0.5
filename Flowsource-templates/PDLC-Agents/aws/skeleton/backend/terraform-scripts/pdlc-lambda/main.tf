locals {
  common_tags = {
    application = "flowsource-pdlc"
    terraform   = "true"
  }
}

module "lambda_function" {
  source          = "terraform-aws-modules/lambda/aws"
  lambda_at_edge                    = false
  create_package                    = false
  architectures                     = ["x86_64"]
  local_existing_package            = var.lambda_function_file
  package_type                      = "Zip"

  function_name                     = var.lambda_functionname
  handler                           = var.lambda_handler
  runtime                           = var.lambda_runtime
  layers                            = var.layers
  create_role                       = false
  lambda_role                       = var.lambda_iam_role

  memory_size                       = var.lambda_function_memory
  timeout                           = var.lambda_function_timeout
  
  use_existing_cloudwatch_log_group = true
  logging_log_group                 = "/aws/lambda/${var.lambda_functionname}"

  environment_variables             = var.lambda_environment_variables

  vpc_security_group_ids          = var.security_group_ids
  vpc_subnet_ids                  = var.subnet_ids

  tags = merge (
  {Name = var.lambda_functionname},
  local.common_tags)
}