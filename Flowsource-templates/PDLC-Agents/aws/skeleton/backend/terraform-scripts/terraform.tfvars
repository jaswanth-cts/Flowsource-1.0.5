region = "${{values.awsRegion}}"

dynamodb_tables = {
    PDLCInteractionHistory : {
        name            : "PDLCInteractionHistory"
        hash_key        : "PK"
        range_key       : "SK"
        billing_mode    : "PROVISIONED"
        read_capacity   : 5
        write_capacity  : 5
        columns = {
                    "PK"        : "S"
                    "SK"        : "N"
                    "UserId"    : "S"
                    "SessionId" : "S"
                }
        global_secondary_indexes = [{
            name            : "UserSessionsIndex"
            hash_key        : "UserId"
            range_key       : "SessionId"
            projection_type : "ALL"
            read_capacity   : 5
            write_capacity  : 5
        }]
        local_secondary_indexes = []

    }
}

pdlc_bot_lambda_functions = {
    pdlc_lambda_function : {
        lambda_function_file    : "pdlc_assistant_deployment.zip",
        lambda_functionname     : "pdlc_lambda_function",
        lambda_iam_role         : "${{values.lambdaExecutionIamRole}}",
        lambda_handler          : "lambda_function.lambda_handler",
        security_groups         : ["${{values.securityGroup}}"]
        subnets                 : ["${{values.subnets}}"]
        lambda_runtime          : "python3.12",
        lambda_function_memory  : 128
        lambda_function_timeout : 900
        lambda_environment_variables : {
            "CLEANUP_MINUTES" = "20"
            "CONVERSATION_LIMIT" = "10"
        }
    }
}

api_gw_specfile                 = "apispec.json"
api_service_lambda_functionname = "pdlc_lambda_function"
disable_execute_api_endpoint    = false
api_endpoint_type               = "PRIVATE"
api_stage_name                  = "v1"
api_source_vpc                  = ["${{values.apiGatewaySourceVpcId}}"]
api_private_endpoint            = ["${{values.apiGatewayPrivateEndpoint}}"]
eks_irsa_role_arn               = "${{values.eksIrsaRoleArn}}"