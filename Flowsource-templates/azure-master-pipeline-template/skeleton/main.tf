data "azuredevops_project" "devops-project-id" {
  name = var.devops-project-id
}


data "azuredevops_git_repository" "azure-repo" {
  count = var.repo_type == "TfsGit" ? 1 : 0
  name       = var.repo_id
  project_id = data.azuredevops_project.devops-project-id.id
}

data "azuredevops_variable_group" "devops-pipeline" {
  for_each = toset(var.pipeline_variable_groups)
  name       = each.value
  project_id = data.azuredevops_project.devops-project-id.id
}

data "azuredevops_serviceendpoint_github" "serviceendpoint" {
  count = var.service_connection_id == "" ? (var.service_connection_name != "" ? 1 : 0) : 0
  project_id            = data.azuredevops_project.devops-project-id.id
  service_endpoint_name = var.service_connection_name
}

resource "azuredevops_build_definition" "devops-pipeline" {
  project_id = data.azuredevops_project.devops-project-id.id
  name       = var.pipeline-name

  repository {
    repo_type   = var.repo_type
    repo_id     = var.repo_type != "TfsGit" ? var.repo_id : data.azuredevops_git_repository.azure-repo[0].id
    branch_name = var.branch_name != "" ? var.branch_name : null
    yml_path    = var.pipeline_yaml_path
    service_connection_id = var.service_connection_id != "" ? var.service_connection_id : (var.service_connection_name != "" ? data.azuredevops_serviceendpoint_github.serviceendpoint[0].id : null)
  }

  ci_trigger {
    use_yaml = true
  }

  variable_groups = length(var.pipeline_variable_groups) != 0 ? [for variablegroup in data.azuredevops_variable_group.devops-pipeline : variablegroup.id] : null 
  
  dynamic "variable" {
    for_each = var.pipeline_variables
    content {
      name           = variable.value.name
      value          = variable.value.equalto
      is_secret      = variable.value.is_secret
      allow_override = variable.value.allow_override
    }
  }  
}