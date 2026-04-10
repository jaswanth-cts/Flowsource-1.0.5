cluster-name   = "${{values.clusterName}}"
region         = "${{values.regionName}}"
chart          = "../../Charts"
values-files   = ["values.yaml"]
namespace      = "${{values.namespaceName}}-prod"
deploymentname = "${{values.appName}}-prod"
