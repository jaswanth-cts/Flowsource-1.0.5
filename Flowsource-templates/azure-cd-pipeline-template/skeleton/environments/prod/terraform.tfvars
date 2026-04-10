rg_name = "${{values.resourceGroupName}}"
cluster_name = "${{values.clusterName}}"

create_namespace    = true

helm_deployments = {
  "${{values.appName}}-prod" : {
    chart           : "../../Charts"
    namespace       : "${{values.namespaceName}}-prod"
    values-files    : ["values.yaml"]
  }
}