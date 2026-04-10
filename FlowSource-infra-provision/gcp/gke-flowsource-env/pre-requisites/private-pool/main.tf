data "google_compute_network" "flowsource-vpc" {
  name = var.source_network_name
}

data "google_compute_network" "flowsource-private-pool-peering-vpc" {
  name = var.peering_network_name
}

resource "google_compute_ha_vpn_gateway" "flowsource-vpc-vpn-gw" {
  region  = var.region
  name    = var.source_vpn_gateway_name
  network = data.google_compute_network.flowsource-vpc.id
}

resource "google_compute_ha_vpn_gateway" "flowsource-private-pool-peering-vpc-vpn-gw" {
  region  = var.region
  name    = var.peering_vpn_gateway_name
  network = data.google_compute_network.flowsource-private-pool-peering-vpc.id
}

resource "google_compute_router" "flowsource-vpc-vpn-router" {
  name    = var.source_router_name
  region  = var.region
  network = data.google_compute_network.flowsource-vpc.name
  bgp {
    asn = 64514
  }
}

resource "google_compute_router" "flowsource-private-pool-peering-vpc-vpn-router" {
  name    = var.peering_router_name
  region  = var.region
  network = data.google_compute_network.flowsource-private-pool-peering-vpc.name
  bgp {
    asn = 64515
  }
}

resource "google_compute_vpn_tunnel" "tunnel1" {
  name                  = var.source_tunnel1
  region                = var.region
  vpn_gateway           = google_compute_ha_vpn_gateway.flowsource-vpc-vpn-gw.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.flowsource-private-pool-peering-vpc-vpn-gw.id
  shared_secret         = "a secret message"
  router                = google_compute_router.flowsource-vpc-vpn-router.id
  vpn_gateway_interface = 0
}

resource "google_compute_vpn_tunnel" "tunnel2" {
  name                  = var.source_tunnel2
  region                = var.region
  vpn_gateway           = google_compute_ha_vpn_gateway.flowsource-vpc-vpn-gw.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.flowsource-private-pool-peering-vpc-vpn-gw.id
  shared_secret         = "a secret message"
  router                = google_compute_router.flowsource-vpc-vpn-router.id
  vpn_gateway_interface = 1
}

resource "google_compute_vpn_tunnel" "tunnel3" {
  name                  = var.peering_tunnel1
  region                = var.region
  vpn_gateway           = google_compute_ha_vpn_gateway.flowsource-private-pool-peering-vpc-vpn-gw.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.flowsource-vpc-vpn-gw.id
  shared_secret         = "a secret message"
  router                = google_compute_router.flowsource-private-pool-peering-vpc-vpn-router.id
  vpn_gateway_interface = 0
}

resource "google_compute_vpn_tunnel" "tunnel4" {
  name                  = var.peering_tunnel2
  region                = var.region
  vpn_gateway           = google_compute_ha_vpn_gateway.flowsource-private-pool-peering-vpc-vpn-gw.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.flowsource-vpc-vpn-gw.id
  shared_secret         = "a secret message"
  router                = google_compute_router.flowsource-private-pool-peering-vpc-vpn-router.id
  vpn_gateway_interface = 1
}

resource "google_compute_router_interface" "flowsource-vpc-vpn-router_interface1" {
  name       = var.source_vpn_router_interface1
  router     = google_compute_router.flowsource-vpc-vpn-router.name
  region     = var.region
  ip_range   = var.source_router_interface_ip_address1
  vpn_tunnel = google_compute_vpn_tunnel.tunnel1.name
}

resource "google_compute_router_peer" "flowsource-vpc-vpn-router_peer1" {
  name                      = var.source_router_peer1
  router                    = google_compute_router.flowsource-vpc-vpn-router.name
  region                    = var.region
  peer_ip_address           = var.source_router_peer_ip_address1
  peer_asn                  = 64515
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.flowsource-vpc-vpn-router_interface1.name
}

resource "google_compute_router_interface" "flowsource-vpc-vpn-router_interface2" {
  name       = var.source_vpn_router_interface2
  router     = google_compute_router.flowsource-vpc-vpn-router.name
  region     = var.region
  ip_range   = var.source_router_interface_ip_address2
  vpn_tunnel = google_compute_vpn_tunnel.tunnel2.name
}

resource "google_compute_router_peer" "flowsource-vpc-vpn-router_peer2" {
  name                      = var.source_router_peer2
  router                    = google_compute_router.flowsource-vpc-vpn-router.name
  region                    = var.region
  peer_ip_address           = var.source_router_peer_ip_address2
  peer_asn                  = 64515
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.flowsource-vpc-vpn-router_interface2.name
}

resource "google_compute_router_interface" "flowsource-private-pool-peering-vpc-vpn-router_interface1" {
  name       = var.peering_vpn_router_interface1
  router     = google_compute_router.flowsource-private-pool-peering-vpc-vpn-router.name
  region     = var.region
  ip_range   = var.peering_router_interface_ip_address1
  vpn_tunnel = google_compute_vpn_tunnel.tunnel3.name
}

resource "google_compute_router_peer" "flowsource-private-pool-peering-vpc-vpn-router_peer1" {
  name                      = var.peering_router_peer1
  router                    = google_compute_router.flowsource-private-pool-peering-vpc-vpn-router.name
  region                    = var.region
  peer_ip_address           = var.peering_router_peer_ip_address1
  peer_asn                  = 64514
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.flowsource-private-pool-peering-vpc-vpn-router_interface1.name
}

resource "google_compute_router_interface" "flowsource-private-pool-peering-vpc-vpn-router_interface2" {
  name       = var.peering_vpn_router_interface2
  router     = google_compute_router.flowsource-private-pool-peering-vpc-vpn-router.name
  region     = var.region
  ip_range   = var.peering_router_interface_ip_address2
  vpn_tunnel = google_compute_vpn_tunnel.tunnel4.name
}

resource "google_compute_router_peer" "flowsource-private-pool-peering-vpc-vpn-router_peer2" {
  name                      = var.peering_router_peer2
  router                    = google_compute_router.flowsource-private-pool-peering-vpc-vpn-router.name
  region                    = var.region
  peer_ip_address           = var.peering_router_peer_ip_address2
  peer_asn                  = 64514
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.flowsource-private-pool-peering-vpc-vpn-router_interface2.name
}