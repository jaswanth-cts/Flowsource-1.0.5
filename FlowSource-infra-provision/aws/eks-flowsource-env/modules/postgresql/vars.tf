variable "db-name" {
  type = string
  description = "Name of the postgres database"
}

variable "db-identifier-name" {
  type = string
  description = "Postgres Database Server Identifier which is the RDS instance name"
}

variable "db-user" {
  description = "RDS root user"
  type        = string
}

variable "db-password" {
  description = "RDS root user password"
  type        = string
  sensitive   = true
  default     = "ChangeMe"
}

variable "db-instance-class" {
  description = "Instance class for the database"
  type = string
  default = "db.m5.large"
}

# Required if pre-created Subnet Ids is to be used for setting up DB
variable "db_subnet_ids" {
  description = "The subnet ids for the Postgresql database"
  type = list(string)
  default = []
}

variable "security_group_ids" {
  description = "Security group ids to associate with database"
  type = list(string)
  default = []
}

variable "backup_retention_period" {
  description = "The database backups retention period. If 0 automated backup is disabled"
  type = number
}

variable "skip_final_snapshot" {
  description = "Flag indiciating if final snapshot should be skipped before delete"
  type = bool
}

variable "multi_az" {
  description = "Whether multi-az DB to be created"
  type = bool
  default = false
} 

variable "maintenance_window" {
  description = "The window to perform maintenance in. Syntax: ddd:hh24:mi-ddd:hh24:mi. Eg: Mon:00:00-Mon:03:00."
  type = string
  default = ""
} 

variable "backup_window" {
  description = "The daily time range (in UTC) during which automated backups are created if they are enabled. Example: 09:46-10:16. Must not overlap with maintenance_window"
  type = string
  default = ""
}

variable "enable_read_replica" {
  description = "Whether read replica to be created"
  type = bool
  default = true
} 

variable "replica_security_group_ids" {
  description = "Security group ids to associate with read replica database"
  type = list(string)
  default = []
}

variable "replica_db_subnet_ids" {
  description = "The subnet ids for the read replica Postgresql database"
  type = list(string)
  default = []
}

variable "replica-multi-az" {
  description = "Whether multi-az DB to be created for replica"
  type = bool
  default = false
}

variable "replica_kms_key_arn" {
  description = "The kms key arn to encrypt/decrpyt the replica, the key must exist in the replica region"
  type    = string
  default = ""
}
