# Azure Master Pipeline Template

# Description

This Azure Master Pipeline Template provides a comprehensive solution for setting up a master pipeline using Azure Pipelines. With this template, you can automate the creation of CI pipelines for your applications, ensuring faster and more reliable software delivery.

By leveraging Azure Pipelines, you can set up a repository that can be used to create CI pipelines. These CI pipelines will then handle the build, test, and packaging phases for your application code. Azure Pipelines orchestrates the entire release process, allowing you to define the stages and actions required to deploy your application to various environments.

## Contents / Final output

The azure-master-pipeline generally creates a repository which can be used in an Azure Pipeline to set up the master pipeline for any application. This master pipeline can then be used to create CI pipelines for new repositories.

## Prerequisites

Before using this repository, make sure you have the following:

- Permissions Required For Azure Pipeline

        -Access to Azure Devops Organization
        -Access to Azure Devops Project
        -Access to Azure Devops Pipeline

### Azure Repos Integration

1. **Configure Azure Repos Connection**: Establish a connection between Azure Pipelines and your Azure Repos account to enable automated builds from your repositories.
   - For instructions, visit: [Connecting Azure Repos with Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git?view=azure-devops&tabs=yaml).
   - **Note**: In version 2, repository linking is automated through the Master Pipeline's Trigger.

2. **Service Connection Setup**: Create a service connection in Azure DevOps to run the builds. You'll need to provide the service connection name to the pipeline configuration.

## Creating an Azure Pipelines Project

1. **Access Azure DevOps Portal**: Sign in to Azure DevOps and navigate to the Pipelines section.
2. **Create Build Pipeline**:
   - **Project Name**: Choose a unique name.
   - **Region**: Specify the deployment region.
   - **Description**: Provide a brief description.
   - **Tags**: (Optional) Add relevant tags.
   - **Events**: Define trigger events.
   - **Source**: Select the source repository and branch.
   - **Configuration**: Point to the `azure-pipelines.yml` file and its location.

3. **Advanced Settings**:
   - **Substitution Variables**: Add any required variables (e.g., `_SERVICE_CONNECTION_NAME`, `_AZURE_REPO_NAME`).

        | Name                      | Value                                                                 |
        |---------------------------|-----------------------------------------------------------------------|
        | _PIPELINE_NAME            | Pipeline Name                                                        |    
        | _REPO_ID                  | Repo ID                                                              |    
        | _BRANCH_NAME              | Branch name                                                          |
        | _PIPELINE_YAML_PATH       | yaml file path                                                       |
        | _AZURE_CONNECTION_NAME    | The name of the Azure connection used for the build.                 |
        | _AZURE_REPO_NAME          | The name of the Azure DevOps repository.                             |
        | _AZURE_REPO_OWNER         | The owner of the Azure DevOps repository.                            |
        | _REGION                   | The region where the build is executed.                              |
        | _SERVICE_CONNECTION_NAME  | The name of the service connection used for the build.               |
        | _TRIGGER_NAME             | The name of the trigger that initiates the build.                    |
        | _ORG_SERVICE_URL          | Organisation URL                                                     |
        | _DEVOPS_PROJECT_ID        | Devops ProjectID                                                     |
        | _REPO_TYPE                | repo type                                                            |
        | _PIPELINE_VARIABLE_GROUP  | Variable group                                                       |

   - **Approval and Logs**: Configure options for build approvals and logging.

4. **Service Connection**: Select a service connection with the necessary permissions.

5. **Create Trigger**: Finalize and create your build trigger.

## Using the Pipeline

- **Triggering Builds**: Manually trigger the build or configure automatic triggers based on source code changes.
- **Monitoring**: Keep track of build progress, and access logs and artifacts for each build stage.

This guide simplifies the setup process for an Azure Master CI Pipeline, ensuring you have a robust CI/CD workflow in place.
