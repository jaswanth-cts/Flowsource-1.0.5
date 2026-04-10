resource "helm_release" "datadog_agent" {
  name       = "datadog-agent"
  chart      = "datadog"
  repository = "https://helm.datadoghq.com"
  version    = "3.50.2"
  create_namespace = true
  namespace  = "datadog-ns"


  set_sensitive {
    name  = "datadog.apiKey"
    value = "${var.api_key}"
  }

  set_sensitive {
    name  = "datadog.appKey"
    value = "${var.app_key}"
  }

  set {
    name  = "datadog.site"
    value = "${var.datadog_site}"
  }

  set {
    name  = "datadog.logs.enabled"
    value = true
  }

  set {
    name  = "datadog.logs.containerCollectAll"
    value = true
  }

  set {
    name  = "datadog.leaderElection"
    value = true
  }

  set {
    name  = "datadog.collectEvents"
    value = true
  }

  set {
    name  = "clusterAgent.enabled"
    value = true
  }

  set {
    name  = "clusterAgent.metricsProvider.enabled"
    value = true
  }

  set {
    name  = "networkMonitoring.enabled"
    value = true
  }

  set {
    name  = "systemProbe.enableTCPQueueLength"
    value = true
  }

  set {
    name  = "systemProbe.enableOOMKill"
    value = true
  }

  set {
    name  = "securityAgent.runtime.enabled"
    value = true
  }

  set {
    name  = "datadog.hostVolumeMountPropagation"
    value = "HostToContainer"
  }

  # Additional configurations added
  # Set tls verify to false, else the agent does not start
  set {
    name = "datadog.kubelet.tlsVerify"
    value = false
  }

  set {
    name = "clusterAgent.shareProcessNamespace"
    value = true
  }

  set {
    name = "datadog.apm.portEnabled"
    value = true
  }

  set {
    name = "datadog.apm.socketEnabled"
    value = false
  }

  set {
    name  = "datadog.logs.autoMultiLineDetection"
    value = true
  }  

    set {
    name = "datadog.otlp.receiver.protocols.grpc.enabled"
    value = true
  }

  set {
    name = "datadog.processAgent.processCollection"
    value = true
  }

  set {
    name = "datadog.serviceMonitoring.enabled"
    value = true
  }

  set {
    name = "datadog.dogstatsd.useSocketVolume"
    value = false
  }

  set {
    name = "providers.aks.enabled"
    value = true
  }
  
}