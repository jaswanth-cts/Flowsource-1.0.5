resource "aws_lambda_layer_version" "new_layer" {
  for_each            = var.new_lamda_layers
  filename            = "${path.module}/${each.value.filename}"
  layer_name          = each.value.name
  compatible_runtimes = each.value.compatible_runtimes
}

locals {
  lambda_layers_lookup = merge(var.existing_lamda_layers, aws_lambda_layer_version.new_layer)
  depends_on = aws_lambda_layer_version.new_layer
}

locals {
  event_targets  = flatten([
    for event_key, event in var.cloud_watch_lambda_event_triggers: [
      for target in event.targets: {
        event_key  = event_key
        event_rule = event.name
        event_target = target
      }
    ]
  ])
}

locals {
  lambda_functions = merge(aws_lambda_function.lambda_platform_engine, aws_lambda_function.lambda_data_agent)
}

// TODO: Specify memory allocation

resource "aws_lambda_function" "lambda_platform_engine" {
    # If the file is not in the current working directory you will need to include a
    # path.module in the filename
    filename        = var.platform_engine_file
    function_name   = var.platform_engine_function_name
    role            = var.platform_engine_iam_role
    handler         = var.platform_engine_handler
    runtime         = var.platform_engine_runtime
    timeout         = var.platform_engine_timeout
    source_code_hash= filebase64sha256(var.platform_engine_file)
    layers           = [for s in var.plaform_engine_lambda_layers: local.lambda_layers_lookup[s].arn]
    
    vpc_config       {
        security_group_ids  = var.platform_engine_lambda_security_group_ids
        subnet_ids          = var.platform_engine_lambda_subnet_ids
    }

    environment {
      variables = var.platform_engine_lambda_env_variables
    }
}

resource "aws_lambda_function" "lambda_data_agent" {
    for_each        = var.data_agent_lambda_functions
    filename        = each.value.filename
    function_name   = each.value.lambda_function_name
    role            = each.value.iam_role_for_lambda
    handler         = each.value.lambda_handler
    runtime         = each.value.runtime
    timeout         = each.value.timeout
    source_code_hash= filebase64sha256(each.value.filename)
    layers           = [for s in each.value.layers: local.lambda_layers_lookup[s].arn]
    
    vpc_config       {
        security_group_ids  = each.value.security_group_ids
        subnet_ids          = each.value.subnet_ids
    }

    environment {
      variables = each.value.environment_variables
    }

    
}

// Cloudwatch Event Triggers
resource "aws_cloudwatch_event_rule" "cloudwatch_event_rule" {
  for_each        = var.cloud_watch_lambda_event_triggers
  name            = each.value.name
  description     = each.value.description
  schedule_expression = each.value.schedule_expression
}

resource "aws_cloudwatch_event_target" "cloudwatch_event_target" {
  for_each    = tomap({for target in local.event_targets: "${target.event_key}.${target.event_target}" => target})
  rule        = each.value.event_rule
  arn         = local.lambda_functions[each.value.event_target].arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  for_each              = tomap({for target in local.event_targets: "${target.event_key}.${target.event_target}" => target})
  statement_id_prefix   = "AllowExecutionFromCloudWatch"
  action                = "lambda:InvokeFunction"
  principal             = "events.amazonaws.com"
  source_arn            = aws_cloudwatch_event_rule.cloudwatch_event_rule[each.value.event_key].arn

  function_name         = local.lambda_functions[each.value.event_target].function_name
}


data "aws_s3_bucket" "platform_engine_s3_bucket" {
  bucket = var.platformengine_s3_bucket_notification_trigger.bucket_name
}

resource "aws_s3_bucket_notification" "platform_engine_s3_trigger" {
  bucket = data.aws_s3_bucket.platform_engine_s3_bucket.id
  lambda_function {
    events = lookup(var.platformengine_s3_bucket_notification_trigger, "events")
    lambda_function_arn = aws_lambda_function.lambda_platform_engine.arn
    filter_suffix = lookup(var.platformengine_s3_bucket_notification_trigger, "filter_suffix", null)
    filter_prefix = lookup(var.platformengine_s3_bucket_notification_trigger, "filter_prefix", null)
  }
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id_prefix   = "AllowExecutionFromS3Bucket"
  action                = "lambda:InvokeFunction"
  principal             = "s3.amazonaws.com"
  source_arn            = data.aws_s3_bucket.platform_engine_s3_bucket.arn
  source_account        = lookup(var.platformengine_s3_bucket_notification_trigger, "source_account")
  function_name         = aws_lambda_function.lambda_platform_engine.arn
}

# Athena database has to be created as a pre-requisite since we are not able to create through Terraform
resource "aws_glue_catalog_table" "aws_glue_catalog_table" {
  for_each        = var.athena_external_tables

  name            = each.value.name
  database_name   = each.value.database_name

  table_type = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL  = "TRUE"
  }

  storage_descriptor {
    location      = each.value.s3_location
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.IgnoreKeyTextOutputFormat"
    
    ser_de_info {
      name                  = "json-stream"
      serialization_library = "org.openx.data.jsonserde.JsonSerDe"

      parameters = {
        "serialization.format"  = 1
        "ignore.malformed.json" = true
      }      
    }

    dynamic "columns" {
      for_each = each.value.columns
      content {
        name    = columns.key
        type    = columns.value
      }
    }
  }
}

resource "aws_redshiftserverless_namespace" "serverless_namespace" {
  count = var.redshift_serverless != null ? 1 : 0 
  namespace_name = lookup(var.redshift_serverless, "namespace")
  admin_username = var.redshift_admin_username
  db_name        = var.redshift_database_name
  iam_roles      = var.redshift_iam_roles 
  manage_admin_password = true
}

resource "aws_redshiftserverless_workgroup" "serverless_wg" {
  count = var.redshift_serverless != null ? 1 : 0 
  depends_on          = [aws_redshiftserverless_namespace.serverless_namespace[0]]
  namespace_name      = lookup(var.redshift_serverless, "namespace")
  workgroup_name      = lookup(var.redshift_serverless.workgroup, "name")
  base_capacity       = lookup(var.redshift_serverless.workgroup, "base_capacity", null)
  subnet_ids          = lookup(var.redshift_serverless.workgroup, "subnets")
  security_group_ids  = lookup(var.redshift_serverless.workgroup, "security_groups")
  max_capacity         = lookup(var.redshift_serverless.workgroup, "max_capacity", null)
}

resource "aws_redshiftserverless_usage_limit" "serverless_usage_limits" {
  count             = var.redshift_serverless != null ? (var.redshift_serverless.usage_limits ? 1 : 0) : 0
  resource_arn      = aws_redshiftserverless_workgroup.serverless_wg[0].arn
  amount            = lookup(var.redshift_serverless.usage_limits, "amount")
  period            = lookup(var.redshift_serverless.usage_limits, "period", null)
  usage_type        = lookup(var.redshift_serverless.usage_limits, "usage_type", null)
  breach_action     = lookup(var.redshift_serverless.usage_limits, "breach_action", null)
}

module "redshift" {
  count           = var.redshift != null ? 1 : 0
  source          = "terraform-aws-modules/redshift/aws"
  cluster_identifier  = var.redshift.cluster_identifier
  iam_role_arns   = var.redshift_iam_roles
  manage_master_password = true
  master_username = var.redshift_admin_username
  database_name   = var.redshift_database_name
  number_of_nodes = var.redshift.number_of_nodes
  node_type       = var.redshift.node_type
  vpc_security_group_ids = var.redshift.security_groups
  subnet_ids      = var.redshift.subnets
  encrypted       = var.redshift.encrypted

  allow_version_upgrade = var.redshift.allow_version_upgrade
  automated_snapshot_retention_period = var.redshift.automated_snapshot_retention_period
  cluster_version = var.redshift.cluster_version
  manual_snapshot_retention_period = var.redshift.manual_snapshot_retention_period
  multi_az = var.redshift.multi_az
  availability_zone = var.redshift.availability_zone
  availability_zone_relocation_enabled = var.redshift.availability_zone_relocation_enabled
  snapshot_copy = var.redshift.snapshot_copy
  snapshot_schedule_definitions = var.redshift.snapshot_schedule_definitions

  usage_limits = var.redshift.usage_limits
}