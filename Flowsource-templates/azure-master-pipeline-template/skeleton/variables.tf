variable "org_service_url" {
  description = "The Devops URL for the Organization"
  sensitive = true
}

variable "devops-project-id" {
  description = "The DevOps project Id or Name to be used"
  type = string
}

variable "pipeline-name" {
  description = "The name of the pipeline"
  type = string
}

variable "repo_type" {
  description = "The type of repo. Valid values: GitHub or TfsGit or Bitbucket or GithubEnterprise."
  type = string
  default = "GitHub"
}

variable "repo_id" {
  description = "The repository id. For Github repos, this will take the form of <GitHub Org>/<Repo Name>"
  type = string
}

variable "service_connection_name" {
  description = "The service connection name to use"
  type = string
  default = ""
}

variable "service_connection_id" {
  description = "The service connection id to use. If both id and name are specified then id will be used"
  type = string
  default = ""
}

variable "github_enterprise_url" {
  description = "The GitHub Enterprise URL. Used if repo_type is GithubEnterprise"
  type = string
  default = ""
}


variable "branch_name" {
  description = "The branch name for which builds are triggered. Defaults to master"
  type = string
  default = ""
}

variable "pipeline_yaml_path" {
  description = "The path of the Pipeline YAML which describes the build definition" 
  type = string
  default = "azure-pipelines.yml"
}

variable "pipeline_variable_groups" {
  type = list(string)
  default = []
  description = "List of variable group names to be associated with the pipeline"
}

variable "pipeline_variables" {
  type = list(object({
    name  = string # required attribute
    equalto = optional(string)
    is_secret = optional(bool, false)
    allow_override = optional(bool, true)
  }))
  default = []
  description = <<-_EOT
  {
    List of variables with the following attributes =>
    name : (Required) Variable Name
    equalto = (Optional) Variable Value
    is_secret = (Optional) true if the variable is sensitive. Default value is false
    allow_override = (Optional) true if the variable value can be overriden. Default value is true
  }
  _EOT
}