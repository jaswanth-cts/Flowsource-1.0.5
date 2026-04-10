###### List of Variables to confgure in script
#<CFG_SERVICE_PLAN_NAME>
#<CFG_RESOURCE_GROUP_NAME> 	 
#<CFG_RESOURCE_GROUP_LOCATION>	
#<CFG_AZ_STORAGE_ACCOUNT_NAME> 
#<CFG_VIRTUAL_NETWORK_NAME>		
#<CFG_SUB_NEWTWORK_NAME>   	
#<CFG_SUB_NEWTWORK_FUNC_NAME>
#<CFG_MANAGED_IDENITITY_NAME> 
#<CFG_SERVICE_PLAN_OS_TYPE> 	      (Linux)
#<CFG_AZURE_CLIENT-ID>
#<CFG_KEY_VAULT_URL>
#<CFG_SERVICE_PLAN>
#<CFG_STORAGE_ACCOUNT_NAME>         Azure storage acc name
#<CFG_STORAGE_CONTAINER_NAME>       Azure storage acc container name
#<CFG_CHECKMARX_BASEURL>            Checkmarx Server URL
#<CFG_DATADOG_BASEURL>              Datadog Server URL
#<CFG_DYNATRACE_BASEURL>            Dynatrace Server URL
#<CFG_JENKINS_BASEURL>              Jenkins Server URL
#<CFG_JIRA_BASEURL> 	              Jira Server URL
#<CFG_RESILIENCEHUB_REGION_NAME>    Resiliencehub region name
#<CFG_SERVICENOW_BASEURL>	          SNOW Server URL
#<CFG_AZUREBOARDS_BASEURL>          Azureboards Server URL
#<CFG_GITHUBACTIONS_BASEURL>        Githubactions Server URL
#<CFG_APPDYNAMICS_BASEURL>          Appdynamics Server URL
#<CFG_SONARQUBE_BASEURL>            Sonarqube Server URL
#<CFG_CLOUDABILITY_BASEURL>         Cloudability Server URL
#<CFG_DAYS_TO_COLLECT>              Start collecting data from past days (+ve number)
#<CFG_AUTH_PROVIDER_X509_CERT_URL>	Google Auth provider url for x509 cert
#<CFG_AUTH_URI>                     Google Auth Uri
#<CFG_CLIENT_X509_CERT_URL>         Client x509 cert url
#<CFG_TOKEN_URI>                    Google token url
#<CFG_AZUREPIPELINE_BASEURL>        Azurepipeline Server URL
#<CFG_BITBUCKET_BASEURL>            Bitbucket Server URL
#<CFG_BLACKDUCK_BASEURL>            Blackduck Server URL
#<CFG_VERACODE_BASEURL>             Veracode Server URL
#############

service_plan_name         = "<CFG_SERVICE_PLAN_NAME>"
resource_group_name       = "<CFG_RESOURCE_GROUP_NAME>"
managed_identity          = "<CFG_MANAGED_IDENITITY_NAME>"
location                  = "<CFG_RESOURCE_GROUP_LOCATION>"
storage_acct_name         = "<CFG_STORAGE_ACCOUNT_NAME>"
service_plan_name_os_type = "<CFG_SERVICE_PLAN_OS_TYPE> "
vnet_name                 = "<CFG_VIRTUAL_NETWORK_NAME>"
subnet_fun_name           = "<CFG_SUB_NEWTWORK_FUNC_NAME>"
subnet_name               = "<CFG_SUB_NEWTWORK_NAME>"

az_func_asset = {
  dataengine = {
    az_fun_name     = "fs-data-engine"
    az_phy_file_zip = "../../agents/data-engine.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  checkmarx = {
    az_fun_name     = "fs-checkmarx-agent"
    az_phy_file_zip = "../../agents/checkmarx-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_CHECKMARX_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "0 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  datadog = {
    az_fun_name     = "fs-datadog-agent"
    az_phy_file_zip = "../../agents/datadog-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_DATADOG_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "5 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  jenkins = {
    az_fun_name     = "fs-jenkins-agent"
    az_phy_file_zip = "../../agents/jenkins-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_JENKINS_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "10 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  resiliencehub = {
    az_fun_name     = "fs-resiliencehub-agent"
    az_phy_file_zip = "../../agents/resiliencehub-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "NO_BASE_URL"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "15 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
      REGION_NAME                 = "<CFG_RESILIENCEHUB_REGION_NAME>"
    }
  },
  jira = {
    az_fun_name     = "fs-jira-agent"
    az_phy_file_zip = "../../agents/jira-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_JIRA_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "20 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  snow = {
    az_fun_name     = "fs-snow-agent"
    az_phy_file_zip = "../../agents/snow-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_SERVICENOW_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "25 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  dynatrace = {
    az_fun_name     = "fs-dynatrace-agent"
    az_phy_file_zip = "../../agents/dynatrace-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_DYNATRACE_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "30 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  azureboards = {
    az_fun_name     = "fs-azureboards-agent"
    az_phy_file_zip = "../../agents/azureboards-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_AZUREBOARDS_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "35 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  githubactions = {
    az_fun_name     = "fs-githubactions-agent"
    az_phy_file_zip = "../../agents/githubactions-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_GITHUBACTIONS_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "40 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  appdynamics = {
    az_fun_name     = "fs-appdynamics-agent"
    az_phy_file_zip = "../../agents/appdynamics-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_APPDYNAMICS_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "45 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  sonarqube = {
    az_fun_name     = "fs-sonarqube-agent"
    az_phy_file_zip = "../../agents/sonarqube-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_SONARQUBE_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "50 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  awscodepipeline = {
    az_fun_name     = "fs-awscodepipeline-agent"
    az_phy_file_zip = "../../agents/awscodepipeline-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "NO_BASE_URL"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "55 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  gcpcloudbuild = {
    az_fun_name     = "fs-gcpcloudbuild-agent"
    az_phy_file_zip = "../../agents/gcpcloudbuild-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "NO_BASE_URL"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "7 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
      AUTH_PROVIDER_X509_CERT_URL	= "<CFG_AUTH_PROVIDER_X509_CERT_URL>"
      AUTH_URI                    =	"<CFG_AUTH_URI>"
      CLIENT_X509_CERT_URL        =	"<CFG_CLIENT_X509_CERT_URL>"
      TOKEN_URI                   =	"<CFG_TOKEN_URI>"
    }
  },
  azurepipeline = {
    az_fun_name     = "fs-azurepipeline-agent"
    az_phy_file_zip = "../../agents/azurepipeline-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_AZUREPIPELINE_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "8 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  bitbucket = {
    az_fun_name     = "fs-bitbucket-agent"
    az_phy_file_zip = "../../agents/bitbucket-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_BITBUCKET_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "9 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  blackduck = {
    az_fun_name     = "fs-blackduck-agent"
    az_phy_file_zip = "../../agents/blackduck-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_BLACKDUCK_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "9 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  veracode = {
    az_fun_name     = "fs-veracode-agent"
    az_phy_file_zip = "../../agents/veracode-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_VERACODE_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "9 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  },
  cloudability = {
    az_fun_name     = "fs-cloudability-agent"
    az_phy_file_zip = "../../agents/cloudability-agent.zip"
    app_insight     = "<CFG_SERVICE_PLAN>"
    environment_var = {
      AZURE_CLIENT_ID             = "<CFG_AZURE_CLIENT-ID>"
      BASE_URL                    = "<CFG_CLOUDABILITY_BASEURL>"
      CREDENTIAL_MANAGER_ENDPOINT = "<CFG_KEY_VAULT_URL>"
      DATABASE_NAME               = "citus"
      FN_TRIGGER_TIMER            = "10 */2 * * *"
      DAYS_TO_COLLECT             = "<CFG_DAYS_TO_COLLECT>"
      STORAGE_NAME                = "<CFG_STORAGE_CONTAINER_NAME>"
    }
  }
}