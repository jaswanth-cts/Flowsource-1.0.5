## General 
backend_bucket_name     = "${{values.bucketName}}"
gke_cluster_name        = "${{values.clusterName}}"
project_id              = "${{values.projectId}}"
region                  = "${{values.regionName}}"
network_name            = "${{values.vpc}}"

### sample_app-helm
chart          = "../../Charts"
values-files   = ["values-qa.yaml"]
namespace      = "${{values.namespaceName}}-qa"
deploymentname = "${{values.appName}}-qa"
clustertype    = "gke"

### Extra variable
namespaces = ["${{values.namespaceName}}-qa", "${{values.namespaceName}}-prod", "${{values.namespaceName}}-dev"]
