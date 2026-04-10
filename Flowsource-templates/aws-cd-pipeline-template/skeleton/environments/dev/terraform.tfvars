cluster-name   = "${{values.clusterName}}"
region         = "${{values.regionName}}"
chart          = "../../Charts"
values-files   = ["values.yaml"]
namespace      = "${{values.namespaceName}}-dev"
deploymentname = "${{values.appName}}-dev"

eks-min-instances = ${{values.min_count}}  # min number of instances can be 1
eks-max-instances = ${{values.max_count}}  # max number of instances can be 3

vpc_id         = "${{values.vpc}}"
eks_subnet_ids = ["${{values.eks_subnet_1}}", "${{values.eks_subnet_2}}"]
bastion-sg-id  = "${{values.bastion_id}}"
bastion-cidr   = "${{values.bastion_ci_dr}}"

namespaces       = ["${{values.namespaceName}}-qa", "${{values.namespaceName}}-prod", "${{values.namespaceName}}-dev"]
cluster_iam_role = "${{values.clusterName}}"
node_iam_role    = "${{values.clusterName}}-node"
clustertype      = "eks"
