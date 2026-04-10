variable "region" {
  description = "The region in which to create the resources"
  type        = string
}

variable "adb_cluster_name" {
  description = "Name of the AlloyDB Cluster"
  type        = string
}

variable "cluster_labels" {
  description = "Cluster/Instance labels"
  type        = map(string)
}

variable "cluster_initial_user" {
  description = "Alloy DB cluster initial user"
  type = object({
    user     = string
    password = string
  })
}

variable "primary_db_cluster_zones" {
  description = "The zones where the cluster will be deployed"
  type        = string
}

variable "primary_db_node_count" {
  description = "The Primary DB Node count"
  type        = number
}

variable "primary_machine_cpu_count" {
  description = "The Primary DB machine CPU count"
  type        = number
}

variable "read_pool_node_count" {
  description = "The read pool node count"
  type        = number
}

variable "read_pool_machine_cpu_count" {
  description = "The read pool machine CPU count"
  type        = number
}

variable "read_pool_cluster_zones" {
  description = "The zones where the cluster will be deployed"
  type        = string
}

variable "read_pool_availability_type" {
  description = "The read pool availability type"
  type        = string
}

variable "source_subnetwork_ip_ranges_to_nat" {
  description = "(Optional) Defaults to ALL_SUBNETWORKS_ALL_IP_RANGES. How NAT should be configured per Subnetwork. Valid values include: ALL_SUBNETWORKS_ALL_IP_RANGES, ALL_SUBNETWORKS_ALL_PRIMARY_IP_RANGES, LIST_OF_SUBNETWORKS. Changing this forces a new NAT to be created."
}

variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network"
  type        = string
}

variable "gke_cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
}