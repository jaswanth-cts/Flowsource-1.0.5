# @flowsource/plugin-scaffolder-backend-module-aws-pipeline-trigger

The aws-pipeline-trigger module for [@flowsource/backstage-plugin-scaffolder-backend].

## About

The `aws-pipeline-trigger` module for @flowsource/backstage-plugin-scaffolder-backend is designed to automate the creation and execution of pipelines in AWS CodePipeline for AWS related scaffolding templates.

## Type of access token

To use this plugin, you need

- **AWS Access Key ID**: The AWS access key ID.
- **AWS Secret Access Key**: The AWS secret access key.
- **AWS Role ARN**: Required to assume a role for executing the pipeline.
- **AWS Region**: The region where the pipeline will be created and executed.
- **AWS Master Pipeline**: The name of the master pipeline to trigger. "AWS Master Pipeline" template provides the source code to set this up.

## Permissions to be given

The CodePipeline service account or role must have the following permissions:

**Permission of the Role ARN**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CodePipeline",
      "Effect": "Allow",
      "Action": [
        "codepipeline:ListPipelines",
        "codepipeline:GetPipelineState",
        "codepipeline:ListPipelineExecutions",
        "codepipeline:StartPipelineExecution",
        "codepipeline:GetPipeline",
        "codepipeline:GetPipelineExecution",
        "codepipeline:GetPipelineState",
        "codepipeline:ListActionExecutions",
        "codepipeline:RetryStageExecution",
        "codepipeline:StopPipelineExecution"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CodeBuild",
      "Effect": "Allow",
      "Action": ["codebuild:Batch*", "codebuild:List*"],
      "Resource": "*"
    }
  ]
}
```

**Permission of the Service Account Role**:

```json
{
  "Sid": "FlowsourceAwsIntegration",
  "Effect": "Allow",
  "Action": "sts:AssumeRole",
  "Resource": "arn:aws:iam::<aws-account-id>:role/<flowsource-aws-integration-role>"
}
```

**Trust Relationship**:

To enable the execution of FlowSource deployed code in an AWS instance, the Service Account needs to be granted AssumeRole permission.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::<aws-account-id>:role/<flowsource-app-service-account-role>"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## Configuration

Add the following configuration to your `app-config.yaml`:

```yaml
scaffolder:
  actions:
    aws:
      - accessKeyId: ${CODECOMMIT_ACCESS_KEY}
        secretAccessKey: ${CODECOMMIT_SECRET}
        roleArn: ${CODECOMMIT_ROLE_ARN}
        region: ${CODECOMMIT_REGION}
        masterPipeline: ${AWS_MASTER_PIPELINE}
```

### Description of Attributes

- **accessKeyId**: (Required) The AWS Access Key ID.
- **secretAccessKey**: (Required) The AWS Secret Access Key.
- **roleArn**: (Required) The ARN of the role to assume for executing the pipeline.
- **region**: (Required) The AWS region where the pipeline will be created and executed.
- **masterPipeline**: (Required) The name of the master pipeline to be used.

## Changes to be made to the source code to include the plugin

Add the below in `packages/backend/package.json`.

```json
"@flowsource/backstage-plugin-scaffolder-backend-module-aws-pipeline-trigger" : PLUGIN_VERSION
```

Add the below in `packages/backend/src/plugins/scaffolder.ts`.

```typescript
import { triggerAwsCodePipelineAction } from '@flowsource backstage-plugin-scaffolder-backend-module-aws-pipeline-trigger';

// Add this line to scaffolderModuleCustomExtensions()
scaffolder.addActions(triggerAwsCodePipelineAction({ config, logger }));

```
