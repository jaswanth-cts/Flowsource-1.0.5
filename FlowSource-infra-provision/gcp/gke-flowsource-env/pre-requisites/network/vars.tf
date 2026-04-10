### Network vars
variable "envprefix" {
  description = "Environment Prefix"
  type        = string
}

variable "region" {
  description = "The region in which to create the resources"
  type        = string
}

variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network"
  type        = string
}

variable "public_subnet_ip" {
  type        = string
  description = "Public IP of the network"
}

variable "private_subnet_ip_1" {
  type        = string
  description = "Private subnet 1 of the network"
}

variable "private_subnet_ip_2" {
  type        = string
  description = "Private subnet 2 of the network"
}

variable "proxy_only_subnet_ip" {
  type        = string
  description = "Proxy only subnet of the network"
}

variable "secondary_ranges_pods" {
  type        = string
  description = "secondary range for private subnet 1 for pods"
}

variable "secondary_ranges_services" {
  type        = string
  description = "secondary range for private subnet 1 for services"
}

variable "nat_addresses" {
  default     = []
  type        = list(string)
  description = "The self_link of GCP Addresses to associate with the NAT"
}

variable "source_subnetwork_ip_ranges_to_nat" {
  description = "(Optional) Defaults to ALL_SUBNETWORKS_ALL_IP_RANGES. How NAT should be configured per Subnetwork. Valid values include: ALL_SUBNETWORKS_ALL_IP_RANGES, ALL_SUBNETWORKS_ALL_PRIMARY_IP_RANGES, LIST_OF_SUBNETWORKS. Changing this forces a new NAT to be created."
}

variable "subnetworks" {
  type = list(object({
    name                     = string,
    source_ip_ranges_to_nat  = list(string)
    secondary_ip_range_names = list(string)
  }))
}

variable "cb_peering_address" {
  type        = string
  description = "Private ip range for Cloud Build"
}

variable "adb_peering_address" {
  type        = string
  description = "Private ip range for AlloyDB"
}

variable "subnet" {
  type        = string
  description = "Self link for the subnet on which the Bastion should live. Can be private when using IAP"
}

variable "private_subnet" {
  type        = string
  description = "Self link for the subnet on which the private ip for the private ip is created"
}

variable "tags" {
  description = "Tags of the resource"
  type        = map(string)
}

# Peering Network
variable "peering_network_name" {
  description = "The name of the peering VPC network"
  type        = string
}

variable "routing_mode" {
  type        = string
  description = "The network routing mode (default 'GLOBAL')"
}

variable "auto_create_subnetworks" {
  type        = bool
  description = "When set to true, the network is created in 'auto subnet mode' and it will create a subnet for each region automatically across the 10.128.0.0/9 address range. When set to false, the network is created in 'custom subnet mode' so the user can explicitly connect subnetwork resources."
}