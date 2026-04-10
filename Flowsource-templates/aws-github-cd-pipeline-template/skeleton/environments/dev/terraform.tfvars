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
cluster_iam_role = "${{values.clusterIamRoleArn}}"
node_iam_role    = "${{values.nodeIamRoleArn}}"
clustertype      = "eks"

instance-types                      = ["${{values.instanceType}}"]
cluster-version                     = "${{values.clusterVersion}}"
create_iam_role                     = ${{values.createIamRole}}
cluster_endpoint_public_access      = ${{values.clusterEndpointPublicAccess}}
cluster_endpoint_private_access     = ${{values.clusterEndpointPrivateAccess}}
cluster_security_group_id           = "${{values.clusterSecurityGroupId}}"
ami_id                              = ""
create_launch_template              = ${{values.createClusterLaunchTemplate}}
use_custom_launch_template          = ${{values.useCustomLaunchTemplate}}
ami_release_version                 = "${{values.amiReleaseVersion}}" 
use_latest_ami_release_version      = ${{values.useLatestAmiReleaseVersion}}
ami_type                            = "${{values.amiType}}"