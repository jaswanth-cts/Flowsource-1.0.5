# flowsource-cicd-aws

Welcome to the flowsource-cicd-aws backend plugin!

The AWS CI/CD Plugin enables integration with AWS CodeBuild & CodePipeline for tracking of pipelines. This plugin offers an interface view the pipelines, displaying key details such as pipeline name, pipeline ID, status, duration and commit message.

## Type of access token

To use this plugin, you will need an AWS Access Key ID, Secret Access Key, and Role ARN when running locally or on a non-EKS (AWS) instance. If running on an AWS EKS instance, you can utilize a Role ARN to access the required AWS services. Ensure the necessary permissions are granted to access AWS CodeBuild & CodePipeline.

## Permissions to be given

The AWS Role Arn must have an IAM identity with the following policies:

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
        "codepipeline:GetPipeline",
        "codepipeline:GetPipelineExecution",
        "codepipeline:GetPipelineState",
        "codepipeline:ListActionExecutions",
        "codepipeline:StartPipelineExecution" // permission is required only if enableTrigger is set to "true".
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

## Configuration

Store the following in your `app-config.yaml`:

```yaml
aws:
  awsCodePipeline:
    accessKeyId: ${CODEPIPELINE_ACCESS_KEY} #Optional
    secretAccessKey: ${CODEPIPELINE_SECRET} #Optional
    roleArn: ${CODEPIPELINE_ROLE_ARN} #Required
    region: ${CODEPIPELINE_REGION} #Required
    enableTrigger: false # By default, it will be false, if you want to enable the trigger, set it to true. #Optinal
```

**Note** - Alternatively, when running on an AWS EKS instance, you do not need to provide `accessKeyId` and `secretAccessKey`. The plugin utilizes the `roleArn` provided to access necessary AWS services.

## Changes to be made to the source code to include the plugin

Add the below code in `packages/backend/src/index.ts`

```typescript
backend.add(import('@flowsource/plugin-flowsource-cicd-aws-backend'));
```

Add the below in `packages/backend/package.json`

```json
"@flowsource/plugin-flowsource-cicd-aws-backend": PLUGIN_VERSION

```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsourceCicdAwsPlugin/health](http://localhost:7007/api/flowsourceCicdAwsPlugin/health).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Release Notes

## Version 1.0.3

- We have introduced a new feature that allows you to trigger the pipeline directly from the CI/CD tab. Simply click the "Trigger Pipeline" button to start the pipeline execution.

- Introduced `enableTrigger` by default false and optional as well.
