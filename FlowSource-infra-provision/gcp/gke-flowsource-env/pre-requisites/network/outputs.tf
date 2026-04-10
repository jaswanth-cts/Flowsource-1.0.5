output "network" {
  description = "The name of the VPC network."
  value       = module.vpc[*].network
}

output "network_id" {
  description = "VPC ID."
  value       = module.vpc[*].network_id
}

output "network_name" {
  description = "The name of the VPC network."
  value       = module.vpc[*].network_name
}

output "network_self_link" {
  description = "VPC Self Link"
  value       = module.vpc[*].network_self_link
}

output "project_id" {
  description = "VPC project id"
  value       = module.vpc[*].project_id
}

output "route_names" {
  description = "The route names associated with this VPC"
  value       = module.vpc[*].route_names
}

output "subnets" {
  description = "A map with keys of form subnet_region/subnet_name and values being the outputs of the google_compute_subnetwork resources used to create corresponding subnets"
  value       = module.vpc[*].subnets
}

output "subnets_flow_logs" {
  description = "Whether the subnets will have VPC flow logs enabled"
  value       = module.vpc[*].subnets_flow_logs
}

output "subnets_ids" {
  description = "The IDs of the subnets being created"
  value       = module.vpc[*].subnets_ids
}

output "subnets_ips" {
  description = "The IPs and CIDRs of the subnets being created"
  value       = module.vpc[*].subnets_ips
}

output "subnets_names" {
  description = "The names of the subnets being created"
  value       = module.vpc[*].subnets_names
}

output "subnets_private_access" {
  description = "Subnet private access"
  value       = module.vpc[*].subnets_private_access
}

output "subnets_regions" {
  description = "The region where the subnets will be created"
  value       = module.vpc[*].subnets_regions
}

output "subnets_secondary_ranges" {
  description = "The secondary ranges associated with these subnets"
  value       = module.vpc[*].subnets_secondary_ranges
}

output "subnet_self_link1" {
  description = "The self-links of subnets being created"
  value       = module.vpc[*].subnets_self_links[1]
}

output "subnet_self_link2" {
  description = "The self-links of subnets being created"
  value       = module.vpc[*].subnets_self_links[2]
}

output "router_name" {
  description = "The name of the created router"
  value       = module.cloud_router.router.name
}

output "nat_name" {
  description = "The name of the created nat"
  value       = module.cloud_router.nat
}

output "private_ip_alloc" {
  description = "Private IP allocation for VPC Peering"
  value       = google_compute_global_address.private_ip_alloc
}

output "private_service_access_adb" {
  description = "VPC Peering Network and service"
  value       = google_service_networking_connection.private_service_access_adb
}

output "private_service_access_cb" {
  description = "VPC Peering Network and service"
  value       = google_service_networking_connection.private_service_access_cb
}

output "peering_network" {
  value       = google_compute_network.peering_network
  description = "The VPC resource being created"
}

output "peering_network_name" {
  value       = google_compute_network.peering_network.name
  description = "The name of the VPC being created"
}

output "peering_network_id" {
  value       = google_compute_network.peering_network.id
  description = "The ID of the VPC being created"
}

output "peering_network_self_link" {
  value       = google_compute_network.peering_network.self_link
  description = "The URI of the VPC being created"
}