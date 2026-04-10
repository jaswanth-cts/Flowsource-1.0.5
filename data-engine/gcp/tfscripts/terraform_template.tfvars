###### List of Variables to confgure in script
#<CFG_GCP_PROJECT_ID>
#<CFG_PROJECT_NUMBER> 	 
#<CFG_GCP_REGION>	
#<CFG_SERVICE_ACCOUNT_EMAIL> 	
#<CFG_USER_ACCOUNT_EMAIL>
#<CFG_DATABASE_NAME>   	 	     
#<CFG_STORAGE_NAME>                 GCP storage acc name
#<CFG_CHECKMARX_BASEURL>            Checkmarx Server URL
#<CFG_DATADOG_BASEURL>              Datadog Server URL
#<CFG_DYNATRACE_BASEURL>            Dynatrace Server URL
#<CFG_JENKINS_BASEURL>              Jenkins Server URL
#<CFG_JIRA_BASEURL> 	              Jira Server URL
#<CFG_RESILIENCEHUB_REGION_NAME>    Resiliencehub region name
#<CFG_SERVICENOW_BASEURL>	          Snow Server URL
#<CFG_AZUREBOARDS_BASEURL>          Azureboards Server URL
#<CFG_GITHUBACTIONS_BASEURL>        Githubaction Server URL
#<CFG_APPDYNAMICS_BASEURL>          Appdynamics Server URL
#<CFG_SONARQUBE_BASEURL>            Sonarqube Server URL
#<CFG_CLOUDABILITY_BASEURL>         Cloudability Server URL
#<CFG_DAYS_TO_COLLECT>              Start collecting data from past days
#<CFG_AUTH_PROVIDER_X509_CERT_URL>	Google Auth provider url for x509 cert
#<CFG_AUTH_URI>                     Google Auth Uri
#<CFG_CLIENT_X509_CERT_URL>         Client x509 cert url
#<CFG_TOKEN_URI>                    Google token url
#<CFG_AZUREPIPELINE_BASEURL>        Azurepipeline Server URL
#<CFG_BITBUCKET_BASEURL>            Bitbucket Server URL
#<CFG_BLACKDUCK_BASEURL>            Blackduck Server URL
#<CFG_VERACODE_BASEURL>             Veracode Server URL
#############


project_id            = "<CFG_GCP_PROJECT_ID>"
project_number        = "<CFG_PROJECT_NUMBER>"
region                = "<CFG_GCP_REGION>"
service_account_email = "<CFG_SERVICE_ACCOUNT_EMAIL>"
user_account_email    = "<CFG_USER_ACCOUNT_EMAIL>"

big_query_dataset = "<CFG_DATABASE_NAME>"

platform_engine_cloud_function_name = "fs-data-engine"
platform_engine_filename            = "../agents/data-engine.zip"
platform_engine_entry_point         = "dataengine_gcs"
platform_engine_environment_variables = {
  "BIGQUERY_PROJECT_ID" = "<CFG_GCP_PROJECT_ID>",
  "DATABASE_NAME"       = "<CFG_DATABASE_NAME>",
  "STORAGE_NAME"        = "<CFG_STORAGE_NAME> "
}

data_agent_cloud_functions = {
  checkmarx : {
    filename : "../agents/checkmarx-agent.zip",
    cloud_function_name : "fs-checkmarx-agent",
    entry_point : "checkmarx_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_CHECKMARX_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  datadog : {
    filename : "../agents/datadog-agent.zip",
    cloud_function_name : "fs-datadog-agent",
    entry_point : "datadog_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_DATADOG_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  dynatrace : {
    filename : "../agents/dynatrace-agent.zip",
    cloud_function_name : "fs-dynatrace-agent",
    entry_point : "dynatrace_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_DYNATRACE_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  jenkins : {
    filename : "../agents/jenkins-agent.zip",
    cloud_function_name : "fs-jenkins-agent",
    entry_point : "jenkins_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_JENKINS_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  jira : {
    filename : "../agents/jira-agent.zip",
    cloud_function_name : "fs-jira-agent",
    entry_point : "jira_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_JIRA_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  resiliencehub : {
    filename : "../agents/resiliencehub-agent.zip",
    cloud_function_name : "fs-resiliencehub-agent",
    entry_point : "resilienceHub_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "NO_BASE_URL",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "REGION_NAME"                 = "<CFG_RESILIENCEHUB_REGION_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  snow : {
    filename : "../agents/snow-agent.zip",
    cloud_function_name : "fs-snow-agent",
    entry_point : "snow_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_SERVICENOW_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  azureboards : {
    filename : "../agents/azureboards-agent.zip",
    cloud_function_name : "fs-azureboards-agent",
    entry_point : "azureboards_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_AZUREBOARDS_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  githubactions : {
    filename : "../agents/githubactions-agent.zip",
    cloud_function_name : "fs-githubactions-agent",
    entry_point : "githubactions_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_GITHUBACTIONS_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  appdynamics : {
    filename : "../agents/appdynamics-agent.zip",
    cloud_function_name : "fs-appdynamics-agent",
    entry_point : "appdynamics_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_APPDYNAMICS_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  sonarqube : {
    filename : "../agents/sonarqube-agent.zip",
    cloud_function_name : "fs-sonarqube-agent",
    entry_point : "sonarqube_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_SONARQUBE_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  awscodepipeline : {
    filename : "../agents/awscodepipeline-agent.zip",
    cloud_function_name : "fs-awscodepipeline-agent",
    entry_point : "awscodepipeline_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "NO_BASE_URL",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  gcpcloudbuild : {
    filename : "../agents/gcpcloudbuild-agent.zip",
    cloud_function_name : "fs-gcpcloudbuild-agent",
    entry_point : "gcpcloudbuild_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "NO_BASE_URL",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>",
      "AUTH_PROVIDER_X509_CERT_URL"	= "<CFG_AUTH_PROVIDER_X509_CERT_URL>",
      "AUTH_URI"                    = "<CFG_AUTH_URI>",
      "CLIENT_X509_CERT_URL"       = "<CFG_CLIENT_X509_CERT_URL>",
      "TOKEN_URI"                   = "<CFG_TOKEN_URI>"
    }
  },
  azurepipeline : {
    filename : "../agents/azurepipeline-agent.zip",
    cloud_function_name : "fs-azurepipeline-agent",
    entry_point : "azurepipeline_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_AZUREPIPELINE_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  bitbucket : {
    filename : "../agents/bitbucket-agent.zip",
    cloud_function_name : "fs-bitbucket-agent",
    entry_point : "bitbucket_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_BITBUCKET_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  blackduck : {
    filename : "../agents/blackduck-agent.zip",
    cloud_function_name : "fs-blackduck-agent",
    entry_point : "blackduck_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_BLACKDUCK_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  veracode : {
    filename : "../agents/veracode-agent.zip",
    cloud_function_name : "fs-veracode-agent",
    entry_point : "veracode_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_VERACODE_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  },
  cloudability : {
    filename : "../agents/cloudability-agent.zip",
    cloud_function_name : "fs-cloudability-agent",
    entry_point : "cloudability_agent",
    cron_expression : "0 */2 * * *"
    environment_variables : {
      "BASE_URL"                    = "<CFG_CLOUDABILITY_BASEURL>",
      "DATABASE_NAME"               = "<CFG_DATABASE_NAME>",
      "STORAGE_NAME"                = "<CFG_STORAGE_NAME>",
      "CREDENTIAL_MANAGER_ENDPOINT" = "true",
      "DAYS_TO_COLLECT"             = "<CFG_DAYS_TO_COLLECT>"
    }
  }
}

