locals {
  api_spec = jsondecode(templatefile(var.api_gw_specfile, {
    service_lambda_function = data.aws_lambda_function.api_lambda.invoke_arn
  }))

  common_tags = {
    Project     = "flowsource-pdlc"
    terraform   = "true"
  }
}

data "aws_lambda_function" "api_lambda" {
  function_name = var.api_service_lambda_functionname
}

resource "aws_api_gateway_rest_api" "restapi" {
  body                          = jsonencode(local.api_spec)
  fail_on_warnings              = true

  disable_execute_api_endpoint  = var.disable_execute_api_endpoint

  // API Name is picked up from the spec   
  name = "${local.api_spec.info.title}"
  put_rest_api_mode = "merge"

  endpoint_configuration {
    types = [var.api_endpoint_type]
    vpc_endpoint_ids = var.api_private_endpoint
  }

  tags = merge (
    {Name = "${local.api_spec.info.title}"},
    local.common_tags
  )
}

data "aws_iam_policy_document" "restapi_policy" {
  statement {
    sid = "AllowEKSIRSAOnly"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [var.eks_irsa_role_arn]
    }
    actions   = ["execute-api:Invoke"]
    resources = ["${aws_api_gateway_rest_api.restapi.execution_arn}/*"]
  }
}

resource "aws_api_gateway_rest_api_policy" "api_gateway_restapi_policy" {
  rest_api_id = aws_api_gateway_rest_api.restapi.id
  policy      = data.aws_iam_policy_document.restapi_policy.json
}

# API Gateway will take certain seconds to apply policies, adding the time interval of 10 seconds so that 
# the api deployment doesn't encounter any error 
resource "time_sleep" "wait_10_seconds" {
  create_duration = "10s"

  depends_on = [aws_api_gateway_rest_api_policy.api_gateway_restapi_policy]
}

resource "aws_api_gateway_deployment" "restapi" {
  rest_api_id = aws_api_gateway_rest_api.restapi.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.restapi.body))
  }

  lifecycle {
    create_before_destroy = true
  }
  depends_on = [time_sleep.wait_10_seconds]
}

resource "aws_api_gateway_stage" "restapi" {
  deployment_id = aws_api_gateway_deployment.restapi.id
  rest_api_id   = aws_api_gateway_rest_api.restapi.id
  stage_name    = var.api_stage_name
}

resource "aws_lambda_permission" "allow_apigateway_invoke" {
  statement_id  = "AllowInvokeForAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.api_service_lambda_functionname
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.restapi.execution_arn}/**"
}
