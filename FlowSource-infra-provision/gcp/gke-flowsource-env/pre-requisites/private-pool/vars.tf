# General
variable "region" {
  description = "The region in which to create the resources"
  type        = string
}

variable "project_id" {
  description = "The ID of the project in which to create the resources"
  type        = string
}

# Private Pool 
variable "private_pool_name" {
  description = "Name of the Private pool"
  type        = string
}

# Network
variable "source_network_name" {
  description = "Name of the source network"
  type        = string
}

variable "peering_network_name" {
  description = "name of the peering network"
  type        = string
}

variable "source_vpn_gateway_name" {
  description = "name of the source VPN Gateway"
  type        = string
}

variable "peering_vpn_gateway_name" {
  description = "name of the peering VPN Gateway"
  type        = string
}

variable "source_router_name" {
  description = "name of the source router"
  type        = string
}

variable "peering_router_name" {
  description = "name of the peering router"
  type        = string
}

variable "source_tunnel1" {
  description = "name of the source tunnel 1"
  type        = string
}

variable "source_tunnel2" {
  description = "name of the source tunnel 2"
  type        = string
}

variable "peering_tunnel1" {
  description = "name of the peering tunnel 1"
  type        = string
}

variable "peering_tunnel2" {
  description = "name of the peering tunnel 2"
  type        = string
}

variable "source_vpn_router_interface1" {
  description = "name of the source vpn router interface 1"
  type        = string
}

variable "source_router_interface_ip_address1" {
  description = "ip address of the source vpn router interface 1"
  type        = string
}

variable "source_router_peer1" {
  description = "name of the source router peer 1"
  type        = string
}

variable "source_router_peer_ip_address1" {
  description = "ip address of the source router peer 1"
  type        = string
}

variable "source_vpn_router_interface2" {
  description = "name of the source vpn router interface 2"
  type        = string
}

variable "source_router_interface_ip_address2" {
  description = "ip address of the source vpn router interface 2"
  type        = string
}

variable "source_router_peer2" {
  description = "name of the source router peer 2"
  type        = string
}

variable "source_router_peer_ip_address2" {
  description = "ip address of the source router peer 2"
  type        = string
}

variable "peering_vpn_router_interface1" {
  description = "name of the peering vpn router interface 1"
  type        = string
}

variable "peering_router_interface_ip_address1" {
  description = "ip address of the peering vpn router interface 1"
  type        = string
}

variable "peering_router_peer1" {
  description = "name of the peering router peer 1"
  type        = string
}

variable "peering_router_peer_ip_address1" {
  description = "ip address of the peering router peer 1"
  type        = string
}

variable "peering_vpn_router_interface2" {
  description = "name of the peering vpn router interface 2"
  type        = string
}

variable "peering_router_interface_ip_address2" {
  description = "ip address of the peering vpn router interface 2"
  type        = string
}

variable "peering_router_peer2" {
  description = "name of the peering router peer 2"
  type        = string
}

variable "peering_router_peer_ip_address2" {
  description = "ip address of the peering router peer 2"
  type        = string
}