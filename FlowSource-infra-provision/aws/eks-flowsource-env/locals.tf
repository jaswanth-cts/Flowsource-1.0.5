locals {
  namespaces = {
    k8s_service_account_namespace = "kube-system",
    project_eks_namespace         = "flowsource"    
  }
  
  k8s_service_account_name      = "eks-cluster-autoscaler-sa"
  aws-load-balancer-controller  = "aws-load-balancer-controller"

  project_service_account_name  = "project-sa"
  
  # In case VPC & subnets being created in script use the module value, else use the value from variable
  #vpc_id                       = data.vpc.vpc_id
  #subnet_ids                   = data.vpc.private_subnets
  vpc_id                        = var.vpc_id
  eks_subnet_ids                = var.eks_subnet_ids
  cp_subnet_ids                 = var.cp_subnet_ids
  db_subnet_ids                 = var.db_subnet_ids
}
