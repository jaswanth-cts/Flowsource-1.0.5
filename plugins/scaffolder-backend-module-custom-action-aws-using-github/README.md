# @flowsource/plugin-scaffolder-backend-module-custom-action-aws-using-github

The trigger-codepipeline-action module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

```markdown
_This plugin was created through the Backstage CLI_
```

## About

The `trigger-codepipeline-action` module for @backstage/plugin-scaffolder-backend is designed to create and start an AWS CodePipeline. This action can be used within Backstage scaffolder workflows to automate the creation and execution of AWS CodePipelines based on provided input parameters.

## Type of access token

To use this plugin, you will need an AWS Access Key ID, Secret Access Key, and Role ARN when running locally or on a non-EKS (AWS) instance. If running on an AWS EKS instance, you can utilize a Role ARN to access the required AWS services. Ensure the necessary permissions are granted to trigger CodePipeline. Additionally you need to have `AWS Region`, `AWS Master Pipeline`, `GitHub Connection ARN`.

- **AWS Region**: The region where the pipeline will be created and executed.
- **AWS Master Pipeline**: The name of the master pipeline to trigger. "AWS Master Pipeline Using GitHub" scaffolding template provides the source code to set this up.
- **GitHub Connection ARN**: The ARN of the GitHub connection in AWS.

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

Store the following in your `app-config.yaml`:

```yaml
scaffolder:
  actions:
    aws:
      - accessKeyId: ${CODEPIPELINE_ACCESS_KEY} #Optional
        secretAccessKey: ${CODEPIPELINE_SECRET} #Optional
        roleArn: ${CODEPIPELINE_ROLE_ARN} #Required
        region: ${CODEPIPELINE_REGION} #Required
        masterPipeline: ${AWS_MASTER_PIPELINE} #Required
        githubConnectionArn: ${CODEPIPELINE_GITHUB_ORG_CONNECTION_ARN} #Required
```

**Note** - Alternatively, when running on an AWS EKS instance, you do not need to provide `accessKeyId` and `secretAccessKey`. The plugin utilizes the `roleArn` provided to access necessary AWS services.

## Changes to be made to the source code to include the plugin

Add the below in `packages/backend/package.json`.

```json
"@flowsource/plugin-scaffolder-backend-module-custom-action-aws-using-github" : PLUGIN_VERSION
```

Add the below in `packages/backend/src/index.ts`.

```typescript
import { scaffoldertriggerCodepipeline } from '../../../plugins/scaffolder-backend-module-custom-action-aws-using-github/src/module';

backend.add(scaffoldertriggerCodepipeline);
```

## Release Notes

### Version 1.0.1

- Made `accessKeyId`, `secretAccessKey` and `role arn` as optional.
