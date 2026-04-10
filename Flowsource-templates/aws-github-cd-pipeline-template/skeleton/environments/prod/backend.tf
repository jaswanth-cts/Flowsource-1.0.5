terraform {
  required_version = "~> 1.3"

  backend "s3" {
    # Replace this with your bucket name!
    bucket = "${{values.bucketName}}"
    key    = "terraform-states/${{values.appName}}/${{values.appName}}-prod.tfstate"
    region = "${{values.regionName}}"
    
    # Replace this with your DynamoDB table name!
    dynamodb_table = "${{values.dynamodbTableName}}"
    encrypt        = true
  }
}
