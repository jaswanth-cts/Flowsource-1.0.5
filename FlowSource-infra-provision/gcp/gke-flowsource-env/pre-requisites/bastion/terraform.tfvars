### General
project_id = "cog01hy0xaqm3kfh4mr4t3em9ex2m"
region     = "us-east1"

### Network
network_name = "flowsource-vpc"

### Bastion Host
vm_template_name              = "flowsource-bastion-template"
bastion_host_name             = "flowsource-bastion-host"
image                         = ""
image_family                  = "debian-12"
image_project                 = "debian-cloud"
create_instance_from_template = true
tags                          = []
labels                        = {}
machine_type                  = "e2-micro"
members                       = ["group:cstudiodevops@cognizant.com"]
network                       = "flowsource-vpc"
scopes                        = ["cloud-platform"]
service_account_roles = [
  "roles/logging.logWriter",
  "roles/monitoring.metricWriter",
  "roles/monitoring.viewer",
  "roles/compute.osLogin",
]
service_account_roles_supplemental = []
service_account_name               = "flowsource-bastion"
service_account_email              = "flowsource-bastion@cog01hy0xaqm3kfh4mr4t3em9ex2m.iam.gserviceaccount.com"
shielded_vm                        = true
startup_script                     = "bastion-vm-startup-script.sh"
subnet                             = "flowsource-public-subnet-1"
zone                               = "us-east1-b"
random_role_id                     = true
fw_name_allow_ssh_from_iap         = "flowsource-allow-ssh-from-iap-to-tunnel"
additional_ports                   = ["443", "3389", "80", "8080"]
disk_size_gb                       = 30
disk_type                          = "pd-standard"
disk_labels                        = {}
metadata                           = {}
external_ip                        = true
preemptible                        = false
access_config = [
  {
    "nat_ip"                 = "",
    "network_tier"           = "PREMIUM",
    "public_ptr_domain_name" = ""
  }
]
create_firewall_rule  = true
can_ip_forward        = false
bastion_firewall_name = "flowsource-allow-bastion-to-gke"