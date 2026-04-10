project_id       = "cog01hy0xaqm3kfh4mr4t3em9ex2m"
region           = "us-east1"
gke_cluster_name = "flowsource-gke-cluster"
namespace        = "flowsource"
create_namespace = false
chart            = "authui-charts"
deploymentname   = "authui-deployment"
values-files     = ["./values-files/values.yaml"]