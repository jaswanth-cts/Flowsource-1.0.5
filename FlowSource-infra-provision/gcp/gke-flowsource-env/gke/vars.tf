variable "gke_cluster_name" {
  description = "Name of the GKE Cluster"
  type        = string
}

variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
}


variable "region" {
  description = "The region in which to create the resources"
  type        = string
}

variable "cluster_zones" {
  description = "The zones where the cluster will be deployed"
  type        = list(any)
}

variable "network_name" {
  description = "VPC name"
  type        = string
}

variable "gcp_private_subnet_name" {
  description = "Private Subnet name"
  type        = string
}

variable "ip_range_pods" {
  type        = string
  description = "ip range for pods"
}

variable "ip_range_services" {
  type        = string
  description = "ip range for services"
}

variable "master_cidr" {
  description = "The CIDR for the cluster"
  type        = string
}

variable "service_account" {
  description = "Cluster service account"
  type        = string
}

variable "master_authorized_networks" {
  type        = list(object({ cidr_block = string, display_name = string }))
  description = "List of master authorized networks. If none are provided, disallow external access (except the cluster node IPs, which GKE automatically whitelists)."
  default     = []
}

variable "gke_cluster_version" {
  description = "Cluster version"
  type        = string
}

variable "enable_private_endpoint" {
  description = "Cluster Private Endpoint"
  type        = bool
}

variable "enable_private_nodes" {
  description = "Cluster Private nodes"
  type        = bool
}

variable "cluster_resource_labels" {
  description = "Cluster resource labels"
  type        = map(string)
}

variable "node_pools" {
  type = object({
    name                      = string
    machine_type              = string
    node_locations            = list(string)
    default_max_pods_per_node = number
    max_node_count            = number
    min_node_count            = number
    autoscaling               = bool
    local_ssd_count           = number
    disk_size_gb              = number
    disk_type                 = string
    image_type                = string
    enable_gcfs               = bool
    enable_gvnic              = bool
    logging_variant           = string
    auto_repair               = bool
    preemptible               = bool
    initial_node_count        = number
    label                     = map(string)
  })
  description = "List of maps containing node pools"
}

variable "node_pools_labels" {
  type        = map(map(string))
  description = "Map of maps containing node labels by node-pool name"
  default = {
    "all" = {}
  }
}

variable "node_pools_metadata" {
  type        = map(map(string))
  description = "Map of maps containing node metadata by node-pool name"
  default = {
    "all" = {}
  }
}

variable "gar_repo" {
  description = "GAR Repository name"
  type        = string
}

variable "release_channel" {
  description = "(Optional) Configuration options for the Release channel feature, which provide more control over automatic upgrades of your GKE clusters."
  type        = string
  default     = "REGULAR"
}