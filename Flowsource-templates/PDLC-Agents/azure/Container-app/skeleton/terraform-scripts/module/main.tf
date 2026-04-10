data "azurerm_user_assigned_identity" "managed_identity" {
  name                = var.user_managed_identity
  resource_group_name = var.resource_group_name
}

resource "azurerm_container_app" "pdlc_app" {
    name                         = var.container_app_name
    container_app_environment_id = var.container_app_environment_id
    resource_group_name          = var.resource_group_name
    revision_mode                = "Single"
    workload_profile_name        = var.workload_profile_name

    registry {
        server = var.container_registry
        identity = data.azurerm_user_assigned_identity.managed_identity.id
    }

    template {
        container {
            name   = var.container_app_name
            image  = var.container_image
            cpu    = var.container_cpu
            memory = var.container_memory
            dynamic "env" {
                for_each = var.environment_var
                    content {
                        name = env.value["name"]
                        value = env.value["value"]
                    }
            }
        }
        http_scale_rule {
            name                = "http-scaler"
            concurrent_requests = 10
        }
        min_replicas = var.container_min_replicas
        max_replicas = var.container_max_replicas
    }

    identity {
        type         = "UserAssigned"
        identity_ids = [data.azurerm_user_assigned_identity.managed_identity.id]
    }

    ingress {
        allow_insecure_connections = false
        external_enabled           = true
        target_port                = var.container_target_port
        traffic_weight {
            latest_revision = true
            percentage      = 100
        }
    }
}