variable "subscription_id" {
  type = string
}

variable "resource_group_name" {
  type        = string
  description = "Specifies the name of the resource group the Storage Account is located in."
}

variable "rg_location" {
  type        = string
  description = "Specifies the supported Azure location where the resource exists"
}

variable "apim_name" {
  description = "Name of the API Management instance"
  type        = string
}

variable "publisher_name" {
  description = "Publisher name for APIM"
  type        = string
}

variable "publisher_email" {
  description = "Publisher email for APIM"
  type        = string
}

variable "sku_name" {
  description = " is a string consisting of two parts separated by an underscore(_). The first part is the name. The second part is the capacity, which must be a positive integer"
  type        = string
}

variable "api_name" {
  description = "The name of the API Management API"
  type        = string
}

variable "container_app_name" {
  description = "The name for this Container App"
  type        = string
}

variable "vnet" {
  description = "Specifies the name of the Virtual Network  "
  type        = string
}

variable "subnet" {
  type        = string
  description = "Specifies the name of the Subnet."
}