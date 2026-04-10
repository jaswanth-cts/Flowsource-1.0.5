module "project-factory_project_services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "15.0.1"

  project_id                  = var.project_id
  disable_services_on_destroy = false

  activate_apis = [
    "alloydb.googleapis.com",              # AlloyDB for PostgreSQL is an open source-compatible database service
    "cloudresourcemanager.googleapis.com", # Creates, reads, and updates metadata for Google Cloud Platform resource containers
    "compute.googleapis.com",              # Creates and runs virtual machines on Google Cloud Platform
    "container.googleapis.com",            # Builds and manages container-based applications, powered by the open source Kubernetes technology
    "containerregistry.googleapis.com",    # Google Container Registry provides secure, private Docker image storage on Google Cloud Platform
    "iap.googleapis.com",                  # Controls access to cloud applications running on Google Cloud Platform.
    "logging.googleapis.com",              # Writes log entries and manages your Cloud Logging configuration.
    "monitoring.googleapis.com",           # Manages your Cloud Monitoring data and configurations
    "secretmanager.googleapis.com",        # Stores sensitive data such as API keys, passwords, and certificates. Provides convenience while improving security
    "servicenetworking.googleapis.com",    # Provides automatic management of network configurations necessary for certain services
  ]
}