# Outputs
output "invoke_url" {
  description = "URL to invoke the API pointing to the stage"
  value       = aws_api_gateway_stage.restapi.invoke_url 
}