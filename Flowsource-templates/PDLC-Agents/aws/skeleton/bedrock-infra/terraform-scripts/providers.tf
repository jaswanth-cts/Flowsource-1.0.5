provider "aws" {
  region = var.region
}

terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.77.0"
    }
    opensearch = {
      source = "opensearch-project/opensearch"
      version = "2.3.1"
    }
    local      = ">= 1.4"
  }
}
