variable "resource_group_name" {
    description = "Specifies the name of the resource group the Storage Account is located in."
    type        = string
}

variable "container_image" {
    description = "The image to use to create the container"
    type        = string
}

variable "container_app_name"{
    description = "The name for this Container App."
    type        = string
}

variable "container_app_environment_id" {
    description = "The ID of the Container App Environment within which this Container App should exist."
    type        = string
}

variable "workload_profile_name" {
    description = "The name of the Workload Profile in the Container App Environment to place this Container App"
    type        = string
}

variable "user_managed_identity"{
    description = "The name of the User Assigned Identity."
    type        = string
}

variable "container_registry"{
    description = "The hostname for the Container Registry"
    type        = string
}

variable "container_cpu"{
    description = "The amount of vCPU to allocate to the container. Possible values include 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, and 2.0"
    type        = string
}

variable "container_memory"{
    description =   "The amount of memory to allocate to the container. Possible values are 0.5Gi, 1Gi, 1.5Gi, 2Gi, 2.5Gi, 3Gi, 3.5Gi and 4Gi"
    type        = string
}

variable "container_min_replicas"{
    description = "The minimum number of replicas for this container."
    type        = number
}

variable "container_max_replicas"{
    description = "The maximum number of replicas for this container."
    type        = number
}

variable "container_target_port"{
    description = "The target port on the container for the Ingress traffic."
    type        = string
}

variable "environment_var" {
    description = "List of environment variables for the container app"
    type = list(object({
            name  = string
            value = string
        }))
    default = []
}