#Uncomment and add the relevant backend to store state in AWS S3 Storage

# terraform {
#   required_version = "~> 1.3"
#
#   backend "s3" {
#     # Replace this with your bucket name!
#     bucket = ""
#     key    = ""
#     region = "us-east-1"
#
#     # Replace this with your DynamoDB table name!
#     # dynamodb_table = ""
#     # encrypt        = true
#   }
# }