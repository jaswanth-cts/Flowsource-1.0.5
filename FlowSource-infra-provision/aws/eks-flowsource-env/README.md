# Flowsource Setup on EKS
## Overview
The repository contains the Terraform scripts required to setup an AKS cluster along with the RDS for PostgreSQL on AWS for Flowsource.

The scripts are created in the form of reusable modules which are assembled in main.tf. Modules provided for creating EKS and RDS for PostgreSQL database. The use of modules allows the flexibility 

#### General Note:
Update the terraform.tfvars with the appropriate values for VPC, Subnets, Cluster name, eks minimum and max instances and instance types, bastion details, role ARNs etc.
[Example tfvars](terraform.exampletfvars) can be used as a reference.

Update the variable 'bastion-cidr' with the IP address of the bastion server for accessing the Kubernetes cluster and database.

The Terraform script does not create the VPC and subnets or any IAM user roles and these need to be created separately by the Admininstrators. The relvant values need to be provided in the tfvars file.

### Permissions Required
In order for the Terraform script to create the various resoutrces, the user executing the Terraform needs to have the relevant permissions for creation of EKS cluster and RDS. 
Some of the permissions that might be needed are provided below. Please note that there might be additional permissions/policies needed as well depending on the environment.

-  autoscaling:CancelInstanceRefresh`
-  autoscaling:CreateAutoScalingGroup`
-  autoscaling:CreateOrUpdateTags`
-  autoscaling:DeleteAutoScalingGroup`
-  autoscaling:DeleteTags`
-  autoscaling:StartInstanceRefresh`
-  autoscaling:UpdateAutoScalingGroup`
-  EC2:CreateLaunchTemplate`
-  EC2:CreateLaunchTemplateVersion`
-  EC2:CreateSecurityGroup`
-  EC2:CreateTags`
-  EC2:DeleteLaunchTemplate`
-  EC2:DeleteSecurityGroup`
-  EC2:DeleteTags`
-  EC2:DescribeImages`
-  EC2:DescribeInstances`
-  EC2:DescribeInstanceStatus`
-  EC2:DescribeInternetGateways`
-  EC2:DescribeKeyPairs`
-  EC2:DescribeLaunchTemplates`
-  EC2:DescribeNatGateways`
-  EC2:DescribeNetworkAcls`
-  EC2:DescribeNetworkInterfaces`
-  EC2:DescribeRouteTables`
-  EC2:DescribeSecurityGroupRules`
-  EC2:DescribeSecurityGroups`
-  EC2:DescribeSubnets`
-  EC2:DescribeTags`
-  EC2:DescribeVpcEndpointConnections`
-  EC2:DescribeVpcEndpoints`
-  EC2:DescribeVpcs`
-  EC2:ModifyLaunchTemplate`
-  EC2:RunInstances`
-  EKS:AccessKubernetesApi`
-  EKS:AssociateAccessPolicy`
-  EKS:CreateAccessEntry`
-  EKS:CreateAddon`
-  EKS:CreateCluster`
-  EKS:CreateNodegroup`
-  EKS:CreatePodIdentityAssociation`
-  EKS:DeleteAccessEntry`
-  EKS:DeleteAddon`
-  EKS:DeleteCluster`
-  EKS:DescribeAccessEntry`
-  EKS:DescribeAddon`
-  EKS:DescribeAddonConfiguration`
-  EKS:DescribeAddonVersions`
-  EKS:DescribeCluster`
-  EKS:DescribeNodegroup`
-  EKS:DescribePodIdentityAssociation`
-  EKS:DescribeUpdate`
-  EKS:DisassociateAccessPolicy`
-  EKS:ListAccessEntries`
-  EKS:ListAccessPolicies`
-  EKS:ListAddons`
-  EKS:ListAssociatedAccessPolicies`
-  EKS:ListClusters`
-  EKS:ListFargateProfiles`
-  EKS:ListIdentityProviderConfigs`
-  EKS:ListNodegroups`
-  EKS:ListPodIdentityAssociations`
-  EKS:ListUpdates`
-  EKS:TagResource`
-  EKS:UntagResource`
-  EKS:UpdateAccessEntry`
-  EKS:UpdateAddon`
-  EKS:UpdateNodegroupConfig`
-  iam:GetRole`
-  iam:ListAttachedRolePolicies`
-  iam:ListEntitiesForPolicy`
-  iam:ListRoles`
-  iam:ListUsers`
-  iam:PassRole`
-  kms:CreateAlias`
-  kms:CreateKey`
-  kms:DeleteAlias`
-  kms:ListAliases`
-  kms:TagResource`
-  logs:CreateLogGroup`
-  logs:DescribeLogStreams`
-  EC2:RevokeSecurityGroupIngress`
-  rds:CreateDBInstance`
-  iam:CreateServiceLinkedRole`
-  EKS:DeleteNodegroup`
-  rds:DeleteDBInstance`
-  rds:CreateDBParameterGroup`
-  rds:CreateDBSubnetGroup`
-  rds:DeleteDBParameterGroup`
-  rds:DeleteDBSubnetGroup`
-  rds:DescribeDBParameterGroups`
-  rds:DescribeDBParameters`
-  rds:ListTagsForResource`
-  rds:ModifyDBINstance`
-  rds:ModifyDBParameterGroup`
-  rds:ModifyDBSubnetGroup`
-  rds:describe`
-  EKS:list`
-  iam:list`
-  ssm:describe`
-  GET:SSM`
-  ssm:list`

## Running the Templates
Use Terraform Plan to view the resources which will be created/updated.
```
terraform plan -var-file <tfvars file>
```

Use Terraform Apply to create the resources
```
terraform apply -var-file <tfvars file>
```

The variables to be supplied can be referred from variables.tf

## Managing State
By default when executing the Terraform scripts, the terraform state will be stored locally. It is recommended to manage state at a shared location in cloud storage.
The configuration can be found in [backend.tf](backend.tf). Update the required details as per your execution environment

## Pre-Requisites
Following are pre-requisites required before executing the scripts:
-   A VPC with at least the following subnets
    * (Atleast) Two Private Subnets for EKS Worker Nodes across availability zones with NAT gateway (for Outbound traffic). The subnet created should meet [Amazon EKS Subnet Requirements](https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html#network-requirements-subnets)
    * (Atleast) Two Private Subnets across Availability Zones for RDS
    * Bastion host within the VPC which can be accessed via the Fleet Manager in order to access the K8s control plane and RDS if required
-   Elastic Container Registry - Amazon Elastic Container Registry is required which contains the Flowsource Container Image.
-   EKS Cluster will use AWS Secrets Manager for secrets
-   EKS Cluster Role with [AmazonEKSClusterPolic](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html#AmazonEKSClusterPolicy-json) or equivalent custom policy attached.
-   [EKS Worker Node Role](https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html) to allow the kubelet daemon to make calls to AWS APIs. The Node IAM role should have the following permissions:
      * [AmazonEKSWorkerNodePolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html)
      * [AmazonEC2ContainerRegistryReadOnly](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html)
      * [AmazonEKS_CNI_Policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html)

## AWS Services Used
| Service | Description | Part of Terraform | Comments |
| --------| ------------| ------------------|----------|
| ECR | Required to push and pull Flowsource container images | N | Is Considered  Pre-Requisite |
| VPC | The VPC within which the Cluster and RDS database is created. | N | Is Pre-Requisite. The VPC should have the required public and private subnets |
| RDS for PostgreSQL | Managed databse for Flowsource. | Y | The database will be setup in its own sub-nets(s) within the same VPC as EKS Cluster. Flowsource application will be configured to point to this database. The Terraform script will also confifure the Security Group to allow access from the EKS nodes |
| Secrets Manager | EKS cluster will use AWS Secrets Manager as the secrets provider. The Secrets Manager would have the required secrets for Flwosource | N | AWS Secrets and Configuration Provider (ASCP) uses IRSA to access the secrets. The required roles with permission need to be associated with the (K8s) service account |
| Application Load Balancer | To be used as the public facing layer for routing external traffic to the application. | N | Public facing Application Load Balancer should be created in the public subnet with Authentication check in place. |
| EKS | EKS cluster which will host the Flowsource application. EKS Cluster is set up in Private Subnet through Terraform script as per the inputs provided. Post set up of the cluster, the ALB Ingress Controller and Secrets Store CSI driver need to be installed using Helm with the help of scripts present in [eks-flowsource-resources-helm](../eks-flowsource-resources-helm). These scripts need to be executed from the bastion or a host within the VPC in order to be able to acess the EKS Cliuster endpoint whihc is private. | Y | All secrets required by Flowsource will be present in AWS Secrets Manager. Application Load Balancer Controller when setup can create/update Application Load Balancer to route traffic to the applicaiton |

### Install latest Software in Bastion server

	1. AWS Cli
	2. Helm
	3. kubectl 

### Configure kubectl to Connect AWS EKS cluster
   aws eks update-kubeconfig --region <us-east-1> --name <CLUSTERNAME>



# AWS Secrets Store CSI Provider Setup
To enable the injection of secret as environment variable, need to install the CSI drivers for AWS Secrets Secret Manager using Helm. The Helm chart takes care of creating the required cluster roles required for the CSI driver.
The Terraform scripts present in [eks-flowsource-resources-helm](../eks-flowsource-resources-helm) will install the charts for CSI drivers. These need to be exeucted from a host (within VPC) which can access the private EKS Cluster endpoint.

## Aws
  Remove Main.tf file from the terraform script
  Rename the Main.tFwas to Main.tf and run the Terraform script.



IAM Role for Service Account (IRSA) needs to configured as documented [here]
(https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_csi_driver.html)
The default service account for the namespace that Flowsource is running in should be configured to be able to use the Role.

Check for documentation on enabling secrets manager for eks https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_csi_driver.html. Secret provider class uses Jmespath for converting secret to Kubernetes secret. Please refer https://jmespath.org/. Ensure that the keys for the Secret in Secrets Manager adhere to the JmesPath naming conventions (e.g. Should not contain hyphen)

A SecretProviderClass is required to be created in the application namespace for accessing thw secrets which further needed to be mounted in the applicaiton. The Helm charts for Installing Flowsource create these necessary artifacts when installing Flowsource.

## Configure Service Account Role

  ###Pre-requisites(AWS Console):- 
      Create Secret Manager<secret Manager Name> for adding the secret keys for the flowsource app and create secrets object Ref file (Flowsource-Charts-main\docs\example-values.yaml
	     under the section  SecreteObject & secrets)
      
     

   
	https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html

	Create a permissions policy that grants secretsmanager:GetSecretValue and secretsmanager:DescribeSecret
	The role that we assign service account should have 
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"

create a role with OIDC providers as Trust Policy and added permissions for the role to access secrets from <Secret Manager Name>.
      Get the Role ARN details Ex rn:aws:iam::<Account id>:role/<My-role>
  Verify the Trust policy 
     Trust Policy Action:E

"Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "oidc.eks.us-east-1.amazonaws.com/id/510FF4AA99890C15C2BCF5B1480:sub": "system:serviceaccount:flowsource:default",
                    "oidc.eks.us-east-1.amazonaws.com/id/510FF4AA99890C15C2BCF5B1480:aud": "sts.amazonaws.com"
                }
            }



### Configure a k8s service account to assume an IAM role


1. Set your AWS account ID to an environment variable with the following command
account_id=$(aws sts get-caller-identity --query "Account" --output text)

2. Set your cluster's OIDC identity provider to an environment variable with the following command. Replace my-cluster with the name of your cluster.
oidc_provider=$(aws eks describe-cluster --name flowsourcezdlc --region us-east-1 --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")

3. Create an IAM OIDC identity provider for your cluster with the following command.
Determine if OIDC provider with clusters ID exists
oidc_id=$(aws eks describe-cluster --region us-east-1 --name <fstestm> --query "cluster.identity.oidc.issuer" --output text | cut -d '/' -f 5)
echo $oidc_id


##eksctl utils associate-iam-oidc-provider --cluster <Cluster Name> --approve --region us-east-1

4. Set variables for the namespace and name of the service account.
export namespace=flowsource
export service_account=default


5. Run the following command to create a trust policy file for the IAM role
cat >trust-relationship.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$account_id:oidc-provider/$oidc_provider"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "$oidc_provider:aud": "sts.amazonaws.com",
          "$oidc_provider:sub": "system:serviceaccount:$namespace:$service_account"
        }
      }
    }
  ]
}
EOF

6. Annotate Service account with ARN of the IAM role
kubectl annotate serviceaccount -n $namespace $service_account eks.amazonaws.com/role-arn=arn:aws:iam::$account_id:role/<my-role>

aws iam get-role --role-name <Role-secretsmanager-Flowsource-EKS> --query Role.AssumeRolePolicyDocument --region us-east-1

Verify the OIDC provider
aws iam get-open-id-connect-provider --open-id-connect-provider-arn arn:aws:iam::ACCOUNT_ID:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/5D62E8DB2A659F468C2E58F4EFDECC3D --region us-east-1




# Application Load Balancer Controller Setup
The Terraform scripts present in [eks-flowsource-resources-helm](../eks-flowsource-resources-helm) will install the charts for Application Load Balancer Controller. These need to be exeucted from a host (within VPC) which can access the private EKS Cluster endpoint.
Please refer [documentation](https://docs.aws.amazon.com/eks/latest/userguide/lbc-helm.html) which provides details on the installation using Helm and the pre-requisites.

IAM Role for Service Account (IRSA) needs to configured. Refer  [Policy_ALB-Role-1](./Policy_ALB-Role-1.json) and [Policy_ALB-Role-2](./Policy_ALB-Role-2.json) for the permissions that need to be attached to the roles.



## Flowsource Install
Flowsource can be installed on the EKS Cluster using Helm Charts. The helm charts are available at FlowSource-Package_version_x/FlowSourceInstaller/helm-chart

Unzip the release package and install the Helm charts using Terraform scripts in FlowSource-Package_version_x/FlowSourceInstaller/terraform-scripts -
```
terraform apply --var-file <tfvars file>
```

### Create ALB Ingress for Flowsource
The flowsource service is of type ClusterIP and can be exposed externally using ALB LoadBalancer Ingress


The Flowsource Ingress should automatically be created through the Helm chart if the Ingress option is specified as true and configured with the required values.

If the Ingress is not created through the Helm chart then this can be created using the kubectl command and configurations as below

Create an Ingress for Flowsource with the following command:
```
cat <<EOF | kubectl apply  -f -
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flowsource-ingress
  namespace: <Namespace for the ingress controller>
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internal
    alb.ingress.kubernetes.io/load-balancer-name: <Load Balancer Name>
    alb.ingress.kubernetes.io/group.name: <Ingress Group Name>
    alb.ingress.kubernetes.io/subnets: <List of subnets to create LB in eg. sn-1,sn2,sn-3>
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb  
  rules:
    - http:
        paths:
        - backend:
            service:
              name: <Flowsource Service Name>
              port:
                number: <Flowsource Service Port>
          path: /
          pathType: Prefix
EOF

```

**Example**
```
cat <<EOF | kubectl apply  -f -
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flowsource-ingress
  namespace: flowsource
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internal
    alb.ingress.kubernetes.io/load-balancer-name: flowsource-lb
    alb.ingress.kubernetes.io/group.name: flowsource
    alb.ingress.kubernetes.io/subnets: subnet-0f29a3802c61057a7, subnet-0f3287fb033d9ee0b
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb  
  rules:
    - http:
        paths:
        - backend:
            service:
              name: flowsource
              port:
                number: 7007
          path: /
          pathType: Prefix
EOF
```

For Authentication at ALB (created through Ingress), additional annotations as below are required to be specified for the Ingress resource:
```      
alb.ingress.kubernetes.io/auth-type: oidc
alb.ingress.kubernetes.io/auth-idp-oidc: '{"issuer":"https://login.microsoftonline.com/<tenant id>/v2.0","authorizationEndpoint":"https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/authorize","tokenEndpoint":"https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/token","userInfoEndpoint":"https://graph.microsoft.com/oidc/userinfo","secretName":"flowsource-ingress-secret"}'
alb.ingress.kubernetes.io/auth-session-timeout: '900'
      
alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-southeast-1:<account id>:certificate/<unique Id>
alb.ingress.kubernetes.io/backend-protocol: HTTP
```


**Note:** Authentication is only supported for HTTPS Listeners
The secret should be in the same namespace as ingress and contains 
the Client Id and Secret. 

ALB Ingress controller should have permission to access the secret
Example role and role-binding for this purpose as below:
```
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
    name: example-role
    namespace: example-namespace
rules:
  - apiGroups:
       - ""
    resourceNames:
      - example-secret
    resources:
      - secrets
    verbs:
      - get
      - list
      - watch

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
    name: example-rolebinding
    namespace: example-namespace
roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: Role
    name: example-role
subjects:
  - kind: ServiceAccount
    name: aws-load-balancer-controller
    namespace: kube-system
```

All annotations supported by ALB Ingress are available at https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.7/guide/ingress/annotations/
