module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 9.1"
  # count   = terraform.workspace == "dev" ? 1 : 0
  project_id   = var.project_id
  network_name = "${var.envprefix}-vpc"
  routing_mode = var.routing_mode

  subnets = [
    {
      subnet_name               = "${var.envprefix}-public-subnet-1"
      subnet_ip                 = var.public_subnet_ip
      subnet_region             = var.region
      subnet_flow_logs          = "true"
      subnet_flow_logs_interval = "INTERVAL_10_MIN"
      description               = "${var.envprefix}-public-subnet-1"
      tags                      = var.tags
    },
    {
      subnet_name               = "${var.envprefix}-private-subnet-1"
      subnet_ip                 = var.private_subnet_ip_1
      subnet_region             = var.region
      subnet_private_access     = "true"
      subnet_flow_logs          = "true"
      subnet_flow_logs_interval = "INTERVAL_10_MIN"
      description               = "{var.envprefix}-private-subnet-1"
      tags                      = var.tags

    },
    {
      subnet_name               = "${var.envprefix}-private-subnet-2"
      subnet_ip                 = var.private_subnet_ip_2
      subnet_region             = var.region
      subnet_private_access     = "true"
      subnet_flow_logs          = "true"
      subnet_flow_logs_interval = "INTERVAL_10_MIN"
      description               = "{var.envprefix}-private-subnet-2"
      tags                      = var.tags
    },
    {
      subnet_name      = "${var.envprefix}-proxy-only-subnet"
      subnet_ip        = var.proxy_only_subnet_ip
      subnet_region    = var.region
      subnet_flow_logs = "false"
      description      = "{var.envprefix}-proxy-only-subnet"
      role             = "ACTIVE"
      purpose          = "REGIONAL_MANAGED_PROXY"
      tags             = var.tags
    }
  ]
  secondary_ranges = {
    "${var.envprefix}-private-subnet-1" = [
      {
        range_name    = "${var.envprefix}-private-subnet-1-pods"
        ip_cidr_range = var.secondary_ranges_pods
      },
      {
        range_name    = "${var.envprefix}-private-subnet-1-services"
        ip_cidr_range = var.secondary_ranges_services
      },
    ]
  }
}

resource "google_compute_network" "peering_network" {
  name                    = var.peering_network_name
  auto_create_subnetworks = var.auto_create_subnetworks
  routing_mode            = var.routing_mode
  project                 = var.project_id
}

resource "google_compute_address" "internal_with_subnet_and_address" {
  depends_on   = [module.vpc]
  name         = "${var.envprefix}-ingress-internal-address"
  subnetwork   = var.subnet
  address_type = "INTERNAL"
  region       = var.region
}

resource "google_compute_address" "app-_private_ip" {
  depends_on   = [module.vpc]
  name         = "${var.envprefix}-isp-flowsource-app"
  subnetwork   = var.private_subnet
  address_type = "INTERNAL"
  region       = var.region
}

module "cloud_router" {
  depends_on = [module.vpc]
  source     = "terraform-google-modules/cloud-router/google"
  version    = "~> 6.0"
  name       = "${var.envprefix}-router"
  project    = var.project_id
  network    = module.vpc.network_name
  region     = var.region

  nats = [{
    name                               = "${var.envprefix}-nat"
    source_subnetwork_ip_ranges_to_nat = var.source_subnetwork_ip_ranges_to_nat
    subnetworks = [
      {
        name                     = module.vpc.subnets_self_links[0]
        source_ip_ranges_to_nat  = ["ALL_IP_RANGES"]
        secondary_ip_range_names = []
      },
      {
        name                     = module.vpc.subnets_self_links[1]
        source_ip_ranges_to_nat  = ["ALL_IP_RANGES"]
        secondary_ip_range_names = []
      }
    ]
  }]
}