cluster-name   = "${{values.clusterName}}"
region         = "${{values.regionName}}"
chart          = "../../Charts"
values-files   = ["values.yaml"]
namespace      = "${{values.namespaceName}}-qa"
deploymentname = "${{values.appName}}-qa"
