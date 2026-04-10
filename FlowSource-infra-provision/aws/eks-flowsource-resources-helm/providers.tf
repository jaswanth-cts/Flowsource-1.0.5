provider "aws" {
  region = var.region
}

provider "kubernetes" {
}

terraform {
  required_version = ">= 0.12.20"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.67.0"
      #version = ">= 5.40.0"
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