output "status" {
  value = helm_release.deployment.status
}

output "chart_details" {
  value = "Chart: ${helm_release.deployment.metadata[0].chart}\nChart Version:${helm_release.deployment.metadata[0].version}\nNamespace: ${helm_release.deployment.metadata[0].namespace}\nDeployment Name: ${helm_release.deployment.metadata[0].name}\nDeployment Version: ${helm_release.deployment.metadata[0].revision}\nApplication Version:  ${helm_release.deployment.metadata[0].app_version}"
}