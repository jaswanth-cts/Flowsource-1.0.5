resource "helm_release" "metrics_agent" {
  name       = "metrics-agent"
  chart      = "metrics-agent"
  repository = "https://cloudability.github.io/metrics-agent"
  version    = "2.11.19"
  namespace  = "cloudability"
  create_namespace = true

  set_sensitive {
    name  = "apiKey"
    value = var.metrics_agent_apiKey
  }

  set {
    name  = "clusterName"
    value = var.cluster_name
  } 
}