# Custom Actions Implementation Guide

This guide explains how to implement custom actions for azure CI pipeline creation as part of flowsource.

## Steps

1. Add a dependency in `packages/backend/package.json`. The dependency should have the value of the newly added custom actions Id from the package.json of the corresponding folder.

2. In `packages/backend/src/plugins/scaffolder.ts` file add the below lines for registering the newly created custom actions.

        const actions = [ ...builtInActions, newlyCreatedCustomAction({params}) ];
        Corresponding import statement has to be added to the same ts file.

3. Run `yarn install`. This resolves the import errors in `packages/backend/*`.

4. Update `app-config.yaml` (might differ based on environment) with the values for keys `pipelineVariableGroup` and `masterPipelineName`.

5. Start the flowsource app as usual using the `yarn dev` command.

6. Create an Azure repo and CI pipeline using the template `springboot3-azure-ci-pipeline-template` or `springboot-github-azure-ci-pipeline-template`. This automatically triggers the custom action and creates a CI pipeline (using the master pipeline which already present in Azure) for the repo which is pushed.

         If the master pipeline does not exist in Azure, use the template `azure-master-pipeline-template` to create one. Run the pipeline once manually using the yaml file present in the repo.

By following these steps, the CI pipeline will be created. If you make some changes in the generated scaffolder code, the CI pipeline will auto-trigger, executing the build steps in the `azure-ci-pipeline.yaml`.
