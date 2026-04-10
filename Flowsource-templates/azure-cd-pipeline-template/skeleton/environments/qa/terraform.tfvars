rg_name = "${{values.resourceGroupName}}"
cluster_name = "${{values.clusterName}}"

create_namespace    = true

helm_deployments = {
  "${{values.appName}}-qa" : {
    chart           : "../../Charts"
    namespace       : "${{values.namespaceName}}-qa"
    values-files    : ["values.yaml"]
  }
}