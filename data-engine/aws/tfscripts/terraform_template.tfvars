###### List of Variables to confgure in script
#<CFG_IAM_REDSHIFT_RUN_COMMAND_ACCESS_ROLE> 	 Access for executing Redshift Command from Lambda
#<CFG_ATHENA_WORKGROUP_NAME>	
#<CFG_AWS_REGION>                              Region name
#<CFG_STORAGE_NAME>		                         S3 bucket name
#<CFG_CREDENTIAL_MANAGER_ENDPOINT>   	         https://secretsmanager.<CFG_AWS_REGION>.amazonaws.com
#<CFG_IAM_LAMBDA_EXECUTION_ROLE> 	             Access for executing for Lambda execution
#<CFG_SUBNETID> 	                             Subnet IT
#<CFG_LAMBDA_SGID> 	                           Security Group ID
#<CFG_AWS_LAYER_ARN> 	                         Need to check if needed
#<CFG_CHECKMARX_BASEURL>	                     Checkmarx Server URL
#<CFG_DATADOG_BASEURL>	                       Datadog Server URL
#<CFG_DYNATRACE_BASEURL>                       Dynatrace Server URL
#<CFG_JENKINS_BASEURL>                         Jenkins Server URL
#<CFG_JIRA_BASEURL> 	                         Jira Server URL
#<CFG_SERVICENOW_BASEURL>	                     Snow Server URL
#<CFG_AZUREBOARDS_BASEURL>                     Azureboards Server URL
#<CFG_GITHUBACTIONS_BASEURL>                   Githubactions Server URl
#<CFG_RESILIENCEHUB_REGION>	                   Resiliencehub region name
#<CFG_APPDYNAMICS_BASEURL>                     Appdynamics Server URL
#<CFG_SONARQUBE_BASEURL>                       Sonarqube Server URL
#<CFG_AZUREPIPELINE_BASEURL>                   Azurepipeline Server URL
#<CFG_BITBUCKET_BASEURL>                       Bitbucket Server URL
#<CFG_BLACKDUCK_BASEURL>                       Blackduck Server URL
#<CFG_VERACODE_BASEURL>                        Veracode Server URL
#<CFG_CLOUDABILITY_BASEURL>                    Cloudability Server URL
#<CFG_DAYS_TO_COLLECT>                         Start collecting data from past days (+ve number)
#<CFG_AWS_ACCOUNTID>  	
#<CFG_REDSHIFT_SGID>	
#<CFG_AUTH_PROVIDER_X509_CERT_URL>	           Google Auth provider url for x509 cert
#<CFG_AUTH_URI>                                Google Auth Uri
#<CFG_CLIENT_X509_CERT_URL>                    Client x509 cert url
#<CFG_TOKEN_URI>                               Google token url
#############


platform_engine_function_name = "fs-data-engine"
platform_engine_handler       = "lambda_function.lambda_handler"
platform_engine_runtime       = "python3.12"
platform_engine_file          = "../agents/data-engine.zip"
platform_engine_timeout       = 900

platform_engine_lambda_env_variables = {
  "ARN_ROLE"                     = "<CFG_IAM_REDSHIFT_RUN_COMMAND_ACCESS_ROLE>",
  "ATHENA_DATABASE_NAME"         = "gluedb-flowsource-catalog",
  "ATHENA_S3_DATA_CATALOG"       = "AwsDataCatalog",
  "ATHENA_WORKGROUP"             = "<CFG_ATHENA_WORKGROUP_NAME>",
  "STORAGE_NAME"                 = "<CFG_STORAGE_NAME>",
  "DATABASE_NAME"                = "flowsourcedb",
  "REDSHIFT_SECRET_MANAGER_NAME" = "fs_redshift_config",
  "CREDENTIAL_MANAGER_ENDPOINT"  = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>"
}

#ARN of the IAM role to be assumed for Lambda Execution
platform_engine_iam_role = "<CFG_IAM_LAMBDA_EXECUTION_ROLE>"

platform_engine_lambda_subnet_ids         = ["<CFG_SUBNETID>"]
platform_engine_lambda_security_group_ids = ["<CFG_LAMBDA_SGID>"]

# The keys of the lambda layers. These refer to the new or exiting layer keys specified
plaform_engine_lambda_layers = ["dataagent", "aws-parameters-and-secrets"]

region = "<CFG_AWS_REGION>"

new_lamda_layers = {
  dataagent = {
    name                = "flowsource-dataagent_layer"
    filename            = "../agents/layer/data-layer.zip"
    compatible_runtimes = ["python3.12"]
  }
}

existing_lamda_layers = {
  aws-parameters-and-secrets : {
    arn = "<CFG_AWS_LAYER_ARN>"
  }
}

data_agent_lambda_functions = {
  checkmarx : {
    filename : "../agents/checkmarx-agent.zip",
    lambda_function_name : "fs-checkmarx-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_CHECKMARX_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  datadog : {
    filename : "../agents/datadog-agent.zip",
    lambda_function_name : "fs-datadog-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_DATADOG_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  dynatrace : {
    filename : "../agents/dynatrace-agent.zip",
    lambda_function_name : "fs-dynatrace-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_DYNATRACE_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_COLLECT_FROM_DAYS>"
    }
  },
  jenkins : {
    filename : "../agents/jenkins-agent.zip",
    lambda_function_name : "fs-jenkins-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_JENKINS_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  jira : {
    filename : "../agents/jira-agent.zip",
    lambda_function_name : "fs-jira-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_JIRA_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  resiliencehub : {
    filename : "../agents/resiliencehub-agent.zip",
    lambda_function_name : "fs-resiliencehub-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "NO_BASE_URL",
      "DATABASE_NAME"               = "flowsourcedb",
      "REGION_NAME"                 = "<CFG_RESILIENCEHUB_REGION>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  snow : {
    filename : "../agents/snow-agent.zip",
    lambda_function_name : "fs-snow-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_SERVICENOW_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  azureboards : {
    filename : "../agents/azureboards-agent.zip",
    lambda_function_name : "fs-azureboards-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_AZUREBOARDS_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  githubactions : {
    filename : "../agents/githubactions-agent.zip",
    lambda_function_name : "fs-githubactions-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_GITHUBACTIONS_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  appdynamics : {
    filename : "../agents/appdynamics-agent.zip",
    lambda_function_name : "fs-appdynamics-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_APPDYNAMICS_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  sonarqube : {
    filename : "../agents/sonarqube-agent.zip",
    lambda_function_name : "fs-sonarqube-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_SONARQUBE_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  awscodepipeline : {
    filename : "../agents/awscodepipeline-agent.zip",
    lambda_function_name : "fs-awscodepipeline-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "NO_BASE_URL",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  gcpcloudbuild : {
    filename : "../agents/gcpcloudbuild-agent.zip",
    lambda_function_name : "fs-gcpcloudbuild-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "NO_BASE_URL",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
      "AUTH_PROVIDER_X509_CERT_URL"	= "<CFG_AUTH_PROVIDER_X509_CERT_URL>",
      "AUTH_URI"                    =	"<CFG_AUTH_URI>",
      "CLIENT_X509_CERT_URL"        =	"<CFG_CLIENT_X509_CERT_URL>",
      "TOKEN_URI"                   =	"<CFG_TOKEN_URI>"
    }
  },
  azurepipeline : {
    filename : "../agents/azurepipeline-agent.zip",
    lambda_function_name : "fs-azurepipeline-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_AZUREPIPELINE_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  bitbucket : {
    filename : "../agents/bitbucket-agent.zip",
    lambda_function_name : "fs-bitbucket-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_BITBUCKET_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  blackduck : {
    filename : "../agents/blackduck-agent.zip",
    lambda_function_name : "fs-blackduck-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_BLACKDUCK_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  veracode : {
    filename : "../agents/veracode-agent.zip",
    lambda_function_name : "fs-veracode-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_VERACODE_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  cloudability : {
    filename : "../agents/cloudability-agent.zip",
    lambda_function_name : "fs-cloudability-agent",
    iam_role_for_lambda : "<CFG_IAM_LAMBDA_EXECUTION_ROLE>",
    lambda_handler : "lambda_function.lambda_handler",
    runtime : "python3.12",
    timeout : 900
    layers : ["dataagent"],
    security_group_ids : ["<CFG_LAMBDA_SGID>"]
    subnet_ids : ["<CFG_SUBNETID>"]
    environment_variables : {
      "BASE_URL"                    = "<CFG_CLOUDABILITY_BASEURL>",
      "DATABASE_NAME"               = "flowsourcedb",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "<CFG_CREDENTIAL_MANAGER_ENDPOINT>",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  }
}

cloud_watch_lambda_event_triggers = {
  event1 : {
    name : "fs-dataagent1-every-2-hours"
    schedule_expression : "rate(2 hours)"
    description = "Trigger Lambda every 2 hours"
    targets : ["checkmarx", "datadog", "dynatrace"]
  },
  event2 : {
    name : "fs-dataagent2-every-2-hours"
    schedule_expression : "rate(2 hours)"
    description = "Trigger Lambda every 2 hours"
    targets : ["jenkins", "jira", "resiliencehub"]
  },
  event3 : {
    name : "fs-dataagent3-every-2-hours"
    schedule_expression : "rate(2 hours)"
    description = "Trigger Lambda every 2 hours"
    targets : ["snow", "azureboards", "githubactions"]
  },
  event4 : {
    name : "fs-dataagent4-every-2-hours"
    schedule_expression : "rate(2 hours)"
    description = "Trigger Lambda every 2 hours"
    targets : ["appdynamics", "sonarqube", "awscodepipeline"]
  },
  event5 : {
    name : "fs-dataagent5-every-2-hours"
    schedule_expression : "rate(2 hours)"
    description = "Trigger Lambda every 2 hours"
    targets : ["gcpcloudbuild", "azurepipeline", "bitbucket"]
  },
   event6 : {
    name : "fs-dataagent6-every-2-hours"
    schedule_expression : "rate(2 hours)"
    description = "Trigger Lambda every 2 hours"
    targets : ["blackduck", "veracode", "cloudability"]
  }
}


platformengine_s3_bucket_notification_trigger = {
  bucket_name : "<CFG_STORAGE_NAME>"
  events : ["s3:ObjectCreated:*"]
  filter_suffix : ".json"
  source_account : "<CFG_AWS_ACCOUNTID>"
}

athena_external_tables = {
  codequality_metrics_data : {
    name : "codequality_metrics_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Codequality Metrics data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/codequality-checkmarx/"

    columns : {
      id : "string"
      appid : "string"
      scanid : "string"
      highseverity : "int"
      mediumseverity : "int"
      lowseverity : "int"
      infoseverity : "int"
      scanfinishedon : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
    }
  },

  apm_datadog_data : {
    name : "apm_datadog_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Datadog data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/appmonitoring-datadog/"

    columns : {
      id : "string"
      appid : "string"
      eventid : "string"
      eventoccurdateepoch : "bigint"
      eventstatus : "string"
      toolname : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      recovertimeinsec : "int"
      environment : "string"
    }
  },

  apm_dynatrace_data : {
    name : "apm_dynatrace_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Dynatrace data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/appmonitoring-dynatrace/"

    columns : {
      id : "string"
      appid : "string"
      eventid : "string"
      eventoccurdateepoch : "bigint"
      eventstatus : "string"
      toolname : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      recovertimeinsec : "int"
      environment : "string"
    }
  },

  ci_jenkins_data : {
    name : "ci_jenkins_data"
    database_name : "gluedb-flowsource-catalog"
    description : "CI Jenking data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/ci-jenkins/"

    columns : {
      id : "string"
      appid : "string"
      buildnumber : "string"
      buildurl : "string"
      jobname : "string"
      result : "string"
      shortdescription : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      buildtimestamp : "bigint"
    }
  },

  alm_jira_data : {
    name : "alm_jira_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Jira data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/alm-jira/"

    columns : {
      id : "string"
      appid : "string"
      lastupdated : "bigint"
      projectkey : "string"
      key : "string"
      toolname : "string"
      summary : "string"
      creationdate : "string"
      priority : "string"
      commits : "array<struct<id:string,timestamp:bigint>>"
      projectname : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      status : "string"
    }
  },

  itsm_incident_data : {
    name : "itsm_incident_data"
    database_name : "gluedb-flowsource-catalog"
    description : "SNOW data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/itsm_snow/"

    columns : {
      id : "string"
      appid : "string"
      incidentnumber : "string"
      deploymentid : "string"
      priority : "string"
      openeddateepoch : "bigint"
      closeddateepoch : "bigint"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      state : "string"
    }
  },

  apm_resilience_data : {
    name : "apm_resilience_data"
    database_name : "gluedb-flowsource-catalog"
    description : "AWS Resilence Hub Metrics data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/appmonitoring-awsresiliencehub/"

    columns : {
      id : "string"
      appid : "string"
      assessmentname : "string"
      starttime : "bigint"
      resiliencyscore : "string"
      compliancestatus : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
    }
  },

  alm_azureboards_data : {
    name : "alm_azureboards_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Azureboards data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/alm-azureboards/"

    columns : {
      id : "string"
      appid : "string"
      lastupdatedepoch : "bigint"
      projectkey : "string"
      key : "string"
      toolname : "string"
      summary : "string"
      creationdate : "string"
      priority : "string"
      commits : "array<struct<id:string,timestamp:bigint>>"
      projectname : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      status : "string"
    }
  },

  ci_githubactions_data : {
    name : "ci_githubactions_data"
    database_name : "gluedb-flowsource-catalog"
    description : "CI Githubactions data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/ci-githubactions/"

    columns : {
      id : "string"
      appid : "string"
      runnumber : "string"
      jobsurl : "string"
      workflowname : "string"
      runstatus : "string"
      rundisplaytitle : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      runstartedat : "bigint"
    }
  },

  apm_appdynamics_data : {
    name : "apm_appdynamics_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Appdynamics data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/appmonitoring-appdynamics/"

    columns : {
      id : "string"
      appid : "string"
      eventid : "string"
      eventoccurdateepoch : "bigint"
      eventstatus : "string"
      toolname : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      recovertimeinsec : "int"
      environment : "string"
    }
  },
  
  codequality_sonarqube_data : {
    name : "codequality_sonarqube_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Codequality Sonarqube data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/codequality-sonarqube/"

    columns : {
      id : "string"
      appid : "string"
      scanid : "string"
      highseverity : "int"
      mediumseverity : "int"
      lowseverity : "int"
      infoseverity : "int"
      scanfinishedon : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
    }
  },

  ci_awscodepipeline_data : {
    name : "ci_awscodepipeline_data"
    database_name : "gluedb-flowsource-catalog"
    description : "CI Awscodepipeline data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/ci-awscodepipeline/"

    columns : {
      id : "string"
      appid : "string"
      build_number : "string"
      build_url : "string"
      deployment_job : "string"
      build_status : "string"
      short_description : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      build_timestamp : "bigint"
    }
  },

  ci_gcpcloudbuild_data : {
    name : "ci_gcpcloudbuild_data"
    database_name : "gluedb-flowsource-catalog"
    description : "CI Gcpcloudbuild data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/ci-gcpcloudbuild/"

    columns : {
      id : "string"
      appid : "string"
      buildnumber : "string"
      buildurl : "string"
      jobname : "string"
      result : "string"
      shortdescription : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      buildtimestamp : "bigint"
    }
  },
 
  ci_azurepipeline_data : {
    name : "ci_azurepipeline_data"
    database_name : "gluedb-flowsource-catalog"
    description : "CI azurepipeline data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/ci-azurepipeline/"

    columns : {
      id : "string"
      appid : "string"
      buildnumber : "string"
      buildurl : "string"
      jobname : "string"
      result : "string"
      shortdescription : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      buildtimestamp : "bigint"
    }
  },

  ci_bitbucket_data : {
    name : "ci_bitbucket_data"
    database_name : "gluedb-flowsource-catalog"
    description : "CI bitbucket data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/ci-bitbucket/"

    columns : {
      id : "string"
      appid : "string"
      buildnumber : "string"
      buildurl : "string"
      jobname : "string"
      result : "string"
      shortdescription : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
      buildtimestamp : "bigint"
    }
  },

  sca_blackduck_data : {
    name : "sca_blackduck_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Sca Blackduck data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/sca-blackduck/"

    columns : {
      id : "string"
      appid : "string"
      versionid : "string"
      highseverity : "int"
      criticalseverity : "int"
      mediumseverity : "int"
      lowseverity : "int"
      infoseverity : "int"
      scanfinishedon : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
    }
  },

  codequality_veracode_data : {
    name : "codequality_veracode_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Codequality Veracode data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/codequality-veracode/"

    columns : {
      id : "string"
      appid : "string"
      scanid : "string"
      highseverity : "int"
      mediumseverity : "int"
      lowseverity : "int"
      infoseverity : "int"
      scanfinishedon : "string"
      flowsourcetime : "bigint"
      flowsourcetimex : "string"
      toolname : "string"
    }
  },

  finops_cloudability_data : {
    name : "finops_cloudability_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Finops cloudability data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/finops-cloudability/"

    columns : {
      id : "string",
      appname : "string",
      cloudprovider : "string",
      costsavingdate : "string",
      thirtydayscost : "float",
      thirtydayscostsaving : "float",
      thirtydayscostsavingpercent : "int",
      resourcename : "string",
      resourcetype : "string",
      toolname : "string",
      flowsourcetime : "bigint",
      flowsourcetimex : "string"
    }
  },

  catalog_info_data : {
    name : "catalog_info_data"
    database_name : "gluedb-flowsource-catalog"
    description : "Catalog data table"
    s3_location : "s3://<CFG_STORAGE_NAME>/flowsource-agent-data/catalog-info/"

    columns : {
      appid : "string"
      app_name : "string"
      annotations : "string"
      lob : "string"
      is_critical : "string"
    }
  }
}

redshift_admin_username = "fsadmin"
redshift_database_name  = "flowsourcedb"
redshift_iam_roles      = ["<CFG_IAM_REDSHIFT_RUN_COMMAND_ACCESS_ROLE>"]

redshift = {
  cluster_identifier     = "flowsource"
  manage_master_password = true
  number_of_nodes        = 1
  availability_zone      = "<CFG_AWS_REGION>"

  availability_zone_relocation_enabled = false
  node_type                            = "dc2.large"
  security_groups                      = ["<CFG_REDSHIFT_SGID>"]
  subnets                              = ["<CFG_SUBNETID>"]
  encrypted                            = true
  allow_version_upgrade                = false
  multi_az                             = false
  snapshot_copy                        = {} # If no specific configuration required speciy as {}
  usage_limits                         = {} # If no specific configuration required speciy as {}

  /*
   usage_limits = {
    currency_scaling = {
      feature_type  = "concurrency-scaling"
      limit_type    = "time"
      amount        = 60
      breach_action = "emit-metric"
    }
    spectrum = {
      feature_type  = "spectrum"
      limit_type    = "data-scanned"
      amount        = 2
      breach_action = "disable"
      tags = {
        Additional = "CustomUsageLimits"
      }
    }
  }
  */
}
