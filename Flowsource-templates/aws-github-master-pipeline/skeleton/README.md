# AWS Master Pipeline Template

# Description

This AWS Master Pipeline Template provides a comprehensive solution for setting up a master pipeline using AWS CodeBuild and CodePipeline. With this template, you can automate the creation of CI pipelines for your applications, ensuring faster and more reliable software delivery.

By leveraging AWS CodeBuild, you can set up a repository that can be used to create CI pipelines. These CI pipelines will then handle the build, test, and packaging phases for your application code. CodePipeline orchestrates the entire release process, allowing you to define the stages and actions required to deploy your application to various environments.

## Contents / Final output

The aws-github-master-pipeline generally creates a repository which can be used in a CodePipeline to set up the master pipeline for any application. This master pipeline can then be used to create CI pipelines for new repositories.

## Pre-requisites

Before you begin, ensure you have the following:

1. Create Service Roles for CodeBuild and CodePipeline with below permissions.
2. CodeBuild-Service-Role-Policy
```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AssumeRole",
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": "arn:aws:iam::${AWS::AccountId}:role/codebuild-service-role"
            },
            {
                "Sid": "EKS",
                "Effect": "Allow",
                "Action": [
                    "eks:Describe*"
                ],
                "Resource": "*"
            },
            {
                "Sid": "ECR",
                "Effect": "Allow",
                "Action": [
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:BatchGetImage",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:DescribeRepositories",
                    "ecr:ListImages",
                    "ecr:DescribeImages",
                    "ecr:DescribeImageScanFindings",
                    "ecr:GetRepositoryPolicy",
                    "ecr:GetLifecyclePolicy",
                    "ecr:GetLifecyclePolicyPreview",
                    "ecr:ListTagsForResource",
                    "ecr:PutImage",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload",
                    "ecr:PutLifecyclePolicy",
                    "ecr-public:*"
                ],
                "Resource": "arn:aws:ecr:us-east-1:${AWS::AccountId}:repository/demo-aws-ecr"
            },
            {
                "Sid": "ECRAuthorizationToken",
                "Effect": "Allow",
                "Action": "ecr:GetAuthorizationToken",
                "Resource": "*"
            },
            {
                "Sid": "CloudWatch",
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": [
                    "arn:aws:logs:us-east-1:${AWS::AccountId}:log-group:aws/codebuild/*",
                    "arn:aws:logs:us-east-1:${AWS::AccountId}:log-group:/aws/codebuild/*:log-stream:*"
                ]
            },
            {
                "Sid": "SecretsManager",
                "Effect": "Allow",
                "Action": [
                    "secretsmanager:GetSecretValue",
                    "secretsmanager:DescribeSecret"
                ],
                "Resource": "arn:aws:secretsmanager:us-east-1:${AWS::AccountId}:secret:*"
            },
            {
                "Sid": "CodeBuild",
                "Effect": "Allow",
                "Action": [
                    "codebuild:CreateReportGroup",
                    "codebuild:CreateReport",
                    "codebuild:DeleteReportGroup",
                    "codebuild:UpdateReportGroup",
                    "codebuild:BatchGetReportGroups",
                    "codebuild:ListReportGroups",
                    "codebuild:BatchGetReports",
                    "codebuild:DeleteReport",
                    "codebuild:UpdateReport",
                    "codebuild:ListReports",
                    "codebuild:ListReportsForReportGroup",
                    "codebuild:CreateProject",
                    "codebuild:BatchGetProjects",
                    "codebuild:DeleteProject",
                    "codebuild:ListProjects",
                    "codebuild:UpdateProject",
                    "codebuild:StartBuild",
                    "codebuild:BatchGetBuilds",
                    "codebuild:ListBuilds",
                    "codebuild:StopBuild",
                    "iam:PassRole"
                ],
                "Resource": "arn:aws:codebuild:us-east-1:${AWS::AccountId}:project/*"
            },
            {
                "Sid": "CodePipeline",
                "Effect": "Allow",
                "Action": [
                    "codepipeline:CreatePipeline",
                    "codepipeline:ListPipelines",
                    "codepipeline:GetPipeline",
                    "codepipeline:UpdatePipeline",
                    "codepipeline:DeletePipeline",
                    "codepipeline:ListTagsForResource"
                ],
                "Resource": "arn:aws:codepipeline:us-east-1:${AWS::AccountId}:*"
            },
            {
                "Sid": "S3CloudBuild",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:ListBucket"
                ],
                "Resource": "*"
            },
            {
                "Sid": "Terraform",
                "Effect": "Allow",
                "Action": [
                    "eks:*",
                    "ec2:DescribeInstances",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DescribeRouteTables",
                    "ec2:DescribeSecurityGroups",
                    "ec2:DescribeSubnets",
                    "ec2:DescribeVpcs",
                    "ec2:CreateSecurityGroup",
                    "ec2:AuthorizeSecurityGroupIngress",
                    "ec2:RevokeSecurityGroupIngress",
                    "ec2:AuthorizeSecurityGroupEgress",
                    "ec2:RevokeSecurityGroupEgress",
                    "ec2:DeleteSecurityGroup",
                    "elasticloadbalancing:*",
                    "iam:CreateRole",
                    "iam:PutRolePolicy",
                    "iam:AttachRolePolicy",
                    "iam:DetachRolePolicy",
                    "iam:DeleteRolePolicy",
                    "iam:DeleteRole",
                    "autoscaling:*",
                    "cloudwatch:*",
                    "logs:*",
                    "ssm:*",
                    "ec2:DeleteNetworkInterface",
                    "ec2:CreateNetworkInterface",
                    "ec2:CreateNetworkInterfacePermission",
                    "ec2:DescribeDhcpOptions"
                ],
                "Resource": "*"
            },
            {
                "Sid": "DynamoDB",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:DeleteItem"
                ],
                "Resource": "*"
            },
            {
                "Sid": "IAMCreatePolicy",
                "Effect": "Allow",
                "Action": [
                    "iam:CreatePolicy",
                    "iam:TagPolicy"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateNetworkInterfacePermission",
                    "ec2:DescribeDhcpOptions",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DeleteNetworkInterface",
                    "ec2:DescribeSubnets",
                    "ec2:DescribeSecurityGroups",
                    "ec2:DescribeVpcs"
                ],
                "Resource": "arn:aws:ec2:us-east-1:${AWS::AccountId}:network-interface/*",
                "Condition": {
                    "StringEquals": {
                        "ec2:AuthorizedService": "codebuild.amazonaws.com"
                    },
                    "ArnEquals": {
                        "ec2:Subnet": [
                            "arn:aws:ec2:us-east-1:${AWS::AccountId}:subnet/subnet-046b20ce41dbdd427",
                            "arn:aws:ec2:us-east-1:${AWS::AccountId}:subnet/subnet-004d6ab500ba9634c",
                            "arn:aws:ec2:us-east-1:${AWS::AccountId}:subnet/subnet-0445fdb7cf2294dbe",
                            "arn:aws:ec2:us-east-1:${AWS::AccountId}:subnet/subnet-0984629ab6f1058d3"
                        ]
                    }
                }
            }
        ]
    }
```

3. CodeBuild-Service-Role-Trust-Relationship

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::${AWS::AccountId}:root"
                ]
            },
            "Action": "sts:AssumeRole"
        },
        {
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "eks.amazonaws.com",
                    "codebuild.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

*Note* - Replace `${AWS::AccountId}` & `${AWS::Region}` with your own accountId & region.

4. CodePipeline-Service-Role-Policy
```json
    {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AssumeRole",
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::${AWS::AccountId}:role/codebuild-service-role"
        },
        {
            "Action": [
                "iam:PassRole"
            ],
            "Resource": "*",
            "Effect": "Allow",
            "Condition": {
                "StringEqualsIfExists": {
                    "iam:PassedToService": [
                        "cloudformation.amazonaws.com",
                        "elasticbeanstalk.amazonaws.com",
                        "ec2.amazonaws.com",
                        "ecs-tasks.amazonaws.com"
                    ]
                }
            }
        },
        {
            "Action": [
                "codecommit:CancelUploadArchive",
                "codecommit:GetBranch",
                "codecommit:GetCommit",
                "codecommit:GetRepository",
                "codecommit:GetUploadArchiveStatus",
                "codecommit:UploadArchive"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "codedeploy:CreateDeployment",
                "codedeploy:GetApplication",
                "codedeploy:GetApplicationRevision",
                "codedeploy:GetDeployment",
                "codedeploy:GetDeploymentConfig",
                "codedeploy:RegisterApplicationRevision"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "codestar-connections:UseConnection"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "elasticbeanstalk:*",
                "ec2:*",
                "elasticloadbalancing:*",
                "autoscaling:*",
                "cloudwatch:*",
                "s3:*",
                "sns:*",
                "cloudformation:*",
                "rds:*",
                "sqs:*",
                "ecs:*"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "lambda:InvokeFunction",
                "lambda:ListFunctions"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "opsworks:CreateDeployment",
                "opsworks:DescribeApps",
                "opsworks:DescribeCommands",
                "opsworks:DescribeDeployments",
                "opsworks:DescribeInstances",
                "opsworks:DescribeStacks",
                "opsworks:UpdateApp",
                "opsworks:UpdateStack"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "cloudformation:CreateStack",
                "cloudformation:DeleteStack",
                "cloudformation:DescribeStacks",
                "cloudformation:UpdateStack",
                "cloudformation:CreateChangeSet",
                "cloudformation:DeleteChangeSet",
                "cloudformation:DescribeChangeSet",
                "cloudformation:ExecuteChangeSet",
                "cloudformation:SetStackPolicy",
                "cloudformation:ValidateTemplate"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "codebuild:BatchGetBuilds",
                "codebuild:StartBuild",
                "codebuild:BatchGetBuildBatches",
                "codebuild:StartBuildBatch"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Effect": "Allow",
            "Action": [
                "devicefarm:ListProjects",
                "devicefarm:ListDevicePools",
                "devicefarm:GetRun",
                "devicefarm:GetUpload",
                "devicefarm:CreateUpload",
                "devicefarm:ScheduleRun"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "servicecatalog:ListProvisioningArtifacts",
                "servicecatalog:CreateProvisioningArtifact",
                "servicecatalog:DescribeProvisioningArtifact",
                "servicecatalog:DeleteProvisioningArtifact",
                "servicecatalog:UpdateProduct",
                "ec2:DeleteNetworkInterface"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:ValidateTemplate"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecr:DescribeImages"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "states:DescribeExecution",
                "states:DescribeStateMachine",
                "states:StartExecution"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "appconfig:StartDeployment",
                "appconfig:StopDeployment",
                "appconfig:GetDeployment"
            ],
            "Resource": "*"
        }
    ]
}
```

5. CodePipeline-Service-Role-Trust-Relationship

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CodePipelineServiceRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "codepipeline.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

*Note* - Replace `${AWS::AccountId}` & `${AWS::Region}` with your own accountId & region.

## Getting Started

### Steps

#### 1. Create a CodeBuild Project

1. **Sign in to the AWS Management Console** and open the CodeBuild console at AWS CodeBuild Console.
2. **Choose** "Create build project".
3. **Configure the project**:
   - **Project name**: Enter a unique name for your project.
   - **Source provider**: Choose GitHub.
   - Choose the repository & branch name where you have pushed your source code.
   - **Environment**: Choose the environment image and compute type. You can use a managed image or a custom image.
   - **Service Role**: Under the service role, select "Choose an existing service role" option and select the service role created as per pre-requisites. 
   - **VPC & SubNet**: Under additional configuration add the VPC and subnet for your CodeBuild project, select the desired VPC from the dropdown menu. Choose the appropriate subnets from the available options. If needed, specify additional network settings such as security groups and validate VPC settings.
   - **Environment Variables**: Under the "Environment" section specify the environment variables by clicking on "Add environment variable". Enter the variable name and its value.
   Ex:-

        CodeBuild Variables

        | Name              | Value                        | Type      |
        |-------------------|------------------------------|-----------|
        | REGION            | #{variables.REGION}          | PLAINTEXT |
        | PIPELINE_NAME     | #{variables.PIPELINE_NAME}   | PLAINTEXT |
        | PROJECT_NAME      | #{variables.PROJECT_NAME}    | PLAINTEXT |
        | REPOSITORY_NAME   | #{variables.REPOSITORY_NAME} | PLAINTEXT |
        | BRANCH_NAME       | #{variables.BRANCH_NAME}     | PLAINTEXT |
        | BUILDSPEC         | #{variables.BUILDSPEC}       | PLAINTEXT |
        | USE_VPC           | #{variables.USE_VPC}         | PLAINTEXT |
        | VPC_ID            | #{variables.VPC_ID}          | PLAINTEXT |
        | SUBNET1           | #{variables.SUBNET1}         | PLAINTEXT |
        | SUBNET2           | #{variables.SUBNET2}         | PLAINTEXT | 
        | SECURITY_GROUP_ID | #{variables.SECURITY_GROUP_ID} | PLAINTEXT |
        | ECR_REPO_NAME | #{variables.ECR_REPO_NAME} | PLAINTEXT |

   - **Buildspec**: provide path to the `buildspec.yml` file. 
   - **Logs**: Optionally, configure logging to Amazon CloudWatch.
4. **Click** "Create build project" to save your settings.

#### 2. Configure AWS CodePipeline
1. **Sign in to the AWS Management Console** and open the CodePipeline console at AWS CodePipeline Console.
2. **Choose** "Create pipeline".
3. **Configure the pipeline**:
    - **Pipeline name**: Enter a unique name for your pipeline.
    - **Exection mode**: Choose the execution mode for your pipeline. This determines how the pipeline is run.
    - **Pipeline Type**: Select V2.
    - **Service Role**: Under the service role, select  "Choose an existing service role" option and select the created Service Role as per pre-requisites.
    - **Variables**: Add below variables.

      CodePipeline Variables

        | Name              | Default value | Description                                      | Usage              |
        |-------------------|---------------|--------------------------------------------------|--------------------|
        | REGION            | us-east-1     | Region where you would need to setup pipeline    | CI & CD pipelines  |
        | PIPELINE_NAME     |               | Name of the CodePipeline you need to create      | CI & CD pipelines  |
        | PROJECT_NAME      |               | Name of the CodeBuild project you need to create | CI & CD pipelines  |
        | REPOSITORY_NAME   |               | Repository for which the pipeline to be created  | CI & CD pipelines  |
        | BRANCH_NAME       |               | Branch to be used to configure pipeline          | CI & CD pipelines  |
        | BUILDSPEC         |               | buildspec file path to configure pipeline        | CI & CD pipelines  |
        | USE_VPC           | FALSE         | Mark it as True if you need setup a CD pipeline  | CD pipeline only   |
        | VPC_ID            | VPC_ID        | Provide VPC ID for the deployment via CD pipeline| CD pipeline only   |
        | SUBNET1           | SUBNET1       | Provide SUBNET1 for the deployment via CD pipeline| CD pipeline only  |
        | SUBNET2           | SUBNET2       | Provide SUBNET2 for the deployment via CD pipeline| CD pipeline only  |
        | SECURITY_GROUP_ID | SECURITY_GROUP_ID | Provide SECURITY_GROUP_ID for the deployment via CD pipeline | CD pipeline only |

   - **Source provider**: Choose GitHub.
   - Choose the repository & branch name where you have pushed your source code.
   - **Build provider**: Choose AWS CodeBuild as the build provider. Choose the build project that you have already created in previous step.
   - Specify these environment variables for the build project.

        CodeBuild Variables

        | Name              | Value                        | Type      |
        |-------------------|------------------------------|-----------|
        | REGION            | #{variables.REGION}          | PLAINTEXT |
        | PIPELINE_NAME     | #{variables.PIPELINE_NAME}   | PLAINTEXT |
        | PROJECT_NAME      | #{variables.PROJECT_NAME}    | PLAINTEXT |
        | REPOSITORY_NAME   | #{variables.REPOSITORY_NAME} | PLAINTEXT |
        | BRANCH_NAME       | #{variables.BRANCH_NAME}     | PLAINTEXT |
        | BUILDSPEC         | #{variables.BUILDSPEC}       | PLAINTEXT |
        | USE_VPC           | #{variables.USE_VPC}         | PLAINTEXT |
        | VPC_ID            | #{variables.VPC_ID}          | PLAINTEXT |
        | SUBNET1           | #{variables.SUBNET1}         | PLAINTEXT |
        | SUBNET2           | #{variables.SUBNET2}         | PLAINTEXT |
        | SECURITY_GROUP_ID | #{variables.SECURITY_GROUP_ID} | PLAINTEXT |

    - **Deployment provider**: Skip this step.
    - **Pipeline Review**: Review your selections for the pipeline to be created. The stages and action providers in each stage are shown in the order that they will be created.
4. **Click** "Create pipeline" to create your pipeline.
5. **Trigger the pipeline**: Keep this manual.
6. **Monitor the pipeline**: Monitor the progress of your pipeline and view the logs generated by each stage.
