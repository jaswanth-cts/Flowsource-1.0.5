### General
envprefix    = "flowsource"
project_id   = "cog01hy0xaqm3kfh4mr4t3em9ex2m"
region       = "us-east1"
routing_mode = "GLOBAL"

### Network
network_name                       = "flowsource-vpc"
source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
subnet                             = "flowsource-public-subnet-1"
private_subnet                     = "flowsource-private-subnet-1"
public_subnet_ip                   = "10.70.0.0/16"
private_subnet_ip_1                = "10.10.0.0/16"
private_subnet_ip_2                = "10.30.0.0/16"
proxy_only_subnet_ip               = "10.50.0.0/24"
secondary_ranges_pods              = "192.168.64.0/18"
secondary_ranges_services          = "192.168.128.0/18"
cb_peering_address                 = "192.168.0.0"
adb_peering_address                = "192.168.16.0"
subnetworks = [{
  name                     = "https://www.googleapis.com/compute/v1/projects/cog01hy0xaqm3kfh4mr4t3em9ex2m/regions/us-east1/subnetworks/flowsource-private-subnet-1"
  source_ip_ranges_to_nat  = ["ALL_IP_RANGES"]
  secondary_ip_range_names = []
  },
  {
    name                     = "https://www.googleapis.com/compute/v1/projects/cog01hy0xaqm3kfh4mr4t3em9ex2m/regions/us-east1/subnetworks/flowsource-private-subnet-2"
    source_ip_ranges_to_nat  = ["ALL_IP_RANGES"]
    secondary_ip_range_names = []
}, ]
tags = {
  Terraform   = "true"
  Environment = "dev"
  Project     = "flowsource"
}

# Peering Network
peering_network_name    = "flowsource-private-pool-peering-vpc"
auto_create_subnetworks = false