subscription_id		  = "${{values.subscriptionId}}"

resource_group_name   = "${{values.resourceGroupName}}"
rg_location           = "${{values.resourceGroupLocation}}"
vnet                  = "${{values.vnetName}}"
subnet                = "${{values.subnetName}}"
pvt_link_subnet       = "Subnet-PDLC-Terraform"    
user_managed_identity = "${{values.userManagedIdentity}}"  

app_name              = "${{values.appName}}"
workload_profile_type = "${{values.workloadProfileType}}"
workload_profile_minimum_count = ${{values.workloadProfileMinimumCount}}
workload_profile_maximum_count = ${{values.workloadProfileMaximumCount}}

container_registry = "${{values.containerRegistry}}"

container_app = {
    azurepdlcassistant = {
        container_app_name = "ca-pdlcassistant"
        container_image    = "${{values.containerRegistry}}/${{values.azurePdlcAssistantContainerImage}}"
        container_cpu = "1"
        container_memory = "2Gi"
        container_min_replicas = 1
        container_max_replicas = 10
        container_target_port = 7036
        environment_var = [
            { name = "AZURE_KEYVAULT_ENDPOINT", value = "VALUE1" },
            { name = "AZURE_KEYVAULT_CLIENT_ID", value = "VALUE2" },
            { name = "AZURE_OPENAI_DEPLOYMENT", value = "VALUE3" },
            { name = "AZURE_OPENAI_API_VERSION", value = "VALUE4" },
            { name = "AZURE_OPENAI_EMBED_DEPLOYMENT", value = "VALUE5" },
            { name = "Max_Window_Size", value = "VALUE8" },
            { name = "PG-PORT", value = "VALUE9" },
            { name = "PG_HISTORY_LIMIT", value = "VALUE10" }
        ]
    },
    jira-mcp = {
        container_app_name = "ca-jira-mcp"
        container_image    = "${{values.containerRegistry}}/${{values.jiraMcpContainerImage}}"
        container_cpu = "1"
        container_memory = "2Gi"
        container_min_replicas = 1
        container_max_replicas = 10
        container_target_port = 7035
        environment_var = [
            { name = "JIRA_URL", value = "VALUE1" },
            { name = "JIRA_EMAIL", value = "VALUE2" },
            { name = "JIRA_API_TOKEN", value = "VALUE3" },
            { name = "JIRA_PROJECT_KEY", value = "VALUE4" },
            { name = "PORT", value = "VALUE5" }
        ]
    },
    github-mcp = {
        container_app_name = "ca-github-mcp"
        container_image    = "${{values.containerRegistry}}/${{values.githubMcpContainerImage}}"
        container_cpu = "1"
        container_memory = "2Gi"
        container_min_replicas = 1
        container_max_replicas = 10
        container_target_port = 7034
        environment_var = [
            { name = "GITHUB_PERSONAL_ACCESS_TOKEN", value = "VALUE1" },
            { name = "GITHUB_OWNER", value = "VALUE2" },
            { name = "GITHUB_DEFAULT_REPO", value = "VALUE3" },
            { name = "PORT", value = "VALUE4" }
        ]
    }
}