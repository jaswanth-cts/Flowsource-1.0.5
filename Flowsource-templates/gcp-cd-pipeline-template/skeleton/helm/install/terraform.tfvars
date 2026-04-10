## General 
backend_bucket_name     = "${{values.bucketName}}"
gke_cluster_name        = "${{values.clusterName}}"
project_id              = "${{values.projectId}}"
region                  = "${{values.regionName}}"
network_name            = "${{values.vpc}}"

### sample_app-helm
chart          = "../../Charts"
values-files   = ["values-dev.yaml"]
namespace      = "${{values.namespaceName}}-dev"
deploymentname = "${{values.appName}}-dev"
clustertype    = "gke"

### Extra variable
namespaces = ["${{values.namespaceName}}-qa", "${{values.namespaceName}}-prod", "${{values.namespaceName}}-dev"]
