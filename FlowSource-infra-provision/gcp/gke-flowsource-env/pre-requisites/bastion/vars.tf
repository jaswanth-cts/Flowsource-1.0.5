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

### Bastion Vars

variable "vm_template_name" {
  description = "Name of the VM Template for Bastion Host"
  type        = string
}

variable "bastion_host_name" {
  description = "Name of the Bastion Host"
  type        = string
}

variable "bastion_firewall_name" {
  description = "Name of the Firewall created for communication between bastion host & gke cluster"
  type        = string
}

variable "image" {
  type        = string
  description = "Source image for the Bastion. If image is not specified, image_family will be used (which is the default)."
}

variable "image_family" {
  type        = string
  description = "Source image family for the Bastion."
}

variable "image_project" {
  type        = string
  description = "Project where the source image for the Bastion comes from"
}

variable "create_instance_from_template" {
  type        = bool
  description = "Whether to create and instance from the template or not. If false, no instance is created, but the instance template is created and usable by a MIG"
}

variable "tags" {
  type        = list(string)
  description = "Network tags, provided as a list"
}

variable "labels" {
  type        = map(any)
  description = "Key-value map of labels to assign to the bastion host"
}

variable "machine_type" {
  type        = string
  description = "Instance type for the Bastion host"
}

variable "members" {
  description = "List of members in the standard GCP form: user:{email}, serviceAccount:{email}, group:{email}"
  type        = list(string)
}

variable "network" {
  type        = string
  description = "Self link for the network on which the Bastion should live"
}

variable "scopes" {
  type        = list(string)
  description = "List of scopes to attach to the bastion host"
}

variable "service_account_roles" {
  type        = list(string)
  description = "List of IAM roles to assign to the service account."
}

variable "service_account_roles_supplemental" {
  type        = list(string)
  description = "An additional list of roles to assign to the bastion if desired"
}

variable "service_account_name" {
  type        = string
  description = "Account ID for the service account"
}

variable "service_account_email" {
  type        = string
  description = "If set, the service account and its permissions will not be created. The service account being passed in should have at least the roles listed in the `service_account_roles` variable so that logging and OS Login work as expected."
}

variable "shielded_vm" {
  type        = bool
  description = "Enable shielded VM on the bastion host (recommended)"
}

variable "startup_script" {
  type        = string
  description = "Render a startup script with a template."
}

variable "subnet" {
  type        = string
  description = "Self link for the subnet on which the Bastion should live. Can be private when using IAP"
}

variable "zone" {
  type        = string
  description = "The primary zone where the bastion host will live"
}

variable "random_role_id" {
  type        = bool
  description = "Enables role random id generation."
}

variable "fw_name_allow_ssh_from_iap" {
  type        = string
  description = "Firewall rule name for allowing SSH from IAP"
}

variable "additional_ports" {
  description = "A list of additional ports/ranges to open access to on the instances from IAP."
  type        = list(string)
}

variable "disk_size_gb" {
  description = "Boot disk size in GB"
  type        = number
}

variable "disk_type" {
  description = "Boot disk type, can be either pd-ssd, local-ssd, or pd-standard"
  type        = string
}

variable "disk_labels" {
  type        = map(any)
  description = "Key-value map of labels to assign to the bastion host disk"
}

variable "metadata" {
  type        = map(string)
  description = "Key-value map of additional metadata to assign to the instances"
}

variable "external_ip" {
  type        = bool
  description = "Set to true if an ephemeral or static external IP/DNS is required, must also set access_config if true"
}

variable "preemptible" {
  type        = bool
  description = "Allow the instance to be preempted"
}

variable "access_config" {
  description = "Access configs for network, nat_ip and DNS"
  type = list(object({
    network_tier           = string
    nat_ip                 = string
    public_ptr_domain_name = string
  }))
}

variable "create_firewall_rule" {
  type        = bool
  description = "If we need to create the firewall rule or not."
}

variable "additional_networks" {
  description = "Additional network interface details for the instance template, if any."
  default     = []
  type = list(object({
    network            = string
    subnetwork         = string
    subnetwork_project = string
    network_ip         = string
    nic_type           = string
    stack_type         = string
    queue_count        = number
    access_config = list(object({
      nat_ip       = string
      network_tier = string
    }))
    ipv6_access_config = list(object({
      network_tier = string
    }))
    alias_ip_range = list(object({
      ip_cidr_range         = string
      subnetwork_range_name = string
    }))
  }))
}

variable "can_ip_forward" {
  type        = bool
  description = "Whether the bastion should allow IP forwarding."
}