provider "aws" {
  region = var.region
}

provider "aws" {
  region = var.replica_region 
  alias = "replica"
}

terraform {
  #required_version = ">= 0.12.20"
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      #version = ">= 4.67.0"
      version = ">= 5.40.0"
      configuration_aliases = [ aws.replica ]
    }
    local      = ">= 1.4"
    random     = ">= 2.1"
    kubernetes = ">= 2.10"
  }

  #backend "s3" {
  #  # Replace this with your bucket name!
  #  bucket = "terraform-state-s3"
  #  key    = "global/s3/terraform.tfstate"
  #  region = "us-east-1"
  #  # Replace this with your DynamoDB table name!
  #  dynamodb_table = "terraform-locks"
  #  encrypt        = true
  #}
}

provider "http" {
}
