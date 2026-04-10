rg_name = "${{values.resourceGroupName}}"
cluster_name = "${{values.clusterName}}"

node_vm_size = "${{values.node_vm_size}}"
min_count = ${{values.min_count}}
max_count = ${{values.max_count}}
vnet = "${{values.vnet}}"
aks-subnet = "${{values.aks_subnet}}"

agic_enable_flag = ${{values.agic_enable_flag}}

user_managed_identity_cp = "${{values.user_managed_identity_cp}}"
user_managed_identity_kubelet = "${{values.user_managed_identity_kubelet}}"

rg_location         = "${{values.resourceGroupLocation}}"
cluster_version     = "${{values.clusterVersion}}"
node_vm_type        = "${{values.node_vm_type}}"
create_namespace    = true

helm_deployments = {
  "${{values.appName}}-dev" : {
    chart           : "../../Charts"
    namespace       : "${{values.namespaceName}}-dev"
    values-files    : ["values.yaml"]
  }
}