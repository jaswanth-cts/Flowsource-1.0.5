provider "aws" {
  region = var.region
}

terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.40.0"
    }
    local      = ">= 1.4"
  }
}