# Flowsource Jenkins Frontend

This plugin displays the pipelines and their runs from Jenkins.

## UI Descrption

- The plugin displays the pipelines in Accordions as title and the runs are displayed when the accordion of a pipeline is expanded. 
- The color of the Accordion denotes the status of the last build / run for that particular pipeline. 
- Green denotes success and red denotes failure

## Source Code Changes

To make the plugin work, you need to make the following changes in the source code:

1. In `packages/app/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-cicd-jenkins" : "^1.0.1" 
```
to the dependencies section.
2. In `packages/app/src/App.tsx`, add import 
```tsx
import { FlowsourceCicdJenkinsPage } from '@flowsource/plugin-flowsource-cicd-jenkins';
```
and add route
```tsx 
<Route path="/flowsource-cicd-jenkins" element={<FlowsourceCicdJenkinsPage />} />
```
3. In `packages/app/src/components/catalog/EntityPage.tsx`

- Add the import 
```tsx
import { FlowsourceCicdJenkinsPage } from '@flowsource/plugin-flowsource-cicd-jenkins'
```
- Add the following constants:
```tsx
    const CICD_JENKINS_ANNOTATION = "flowsource/jenkins-pipelines";
    const isCicdJenkinsAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CICD_JENKINS_ANNOTATION]);
```
- Under cicd content add the following
```tsx
   const cicdContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity) => isCicdJenkinsAnnotationAvailable(entity)}>
      <FlowsourceCicdJenkinsPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      <EmptyState
        title="No CI/CD page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable Jenkins for it."
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);
```
- Update the constant “serviceEntityPage” and “websiteEntityPage”:
```tsx
const serviceEntityPage = (
  <EntityLayout.Route path="/ci-cd" title="CI/CD">
    <>
      <Grid container>
        <Grid item alignItems="stretch" md={12}>
          {cicdContent}
        </Grid>
      </Grid>
    </>
  </EntityLayout.Route>
);

const websiteEntityPage = (
  <EntityLayout.Route path="/ci-cd" title="CI/CD">
    {cicdContent}
  </EntityLayout.Route>
);
```

## Catalog Configuration

In the `catalog-info.yaml` file, add the following annotations 
```yaml
"flowsource/jenkins-pipelines: <pipeline-name>"
"flowsource/durationInDays: 1"
"flowsource/jenkins-pipelines-trigger: <pipeline-name>"
```
under the annotations field.

You can also specify multiple pipeline names by separating them with commas (without spaces). 
For example, 
```yaml
flowsource/jenkins-pipelines: pipeline1,pipeline2
```
```yaml
flowsource/jenkins-pipelines-trigger: pipeline1,pipeline2,parent-pipeline-name >> branch-name
```
### For multibranch pipelines, you must specify both the parent pipeline and the branch name in the annotation, separated by >>.
  For example,
  ```yaml
  flowsource/jenkins-pipelines-trigger: ticket-booking-pipeline >> jenkins-demo
  ```
### Trigger Pipeline Button
The Trigger Pipeline button allows users to trigger Jenkins pipelines directly from the UI.

- Supported Pipeline Types:
 1. Pipeline (org.jenkinsci.plugins.workflow.job.WorkflowJob)
 2. Freestyle (hudson.model.FreeStyleProject)
 3. Multi-Config/Matrix (hudson.matrix.MatrixProject)
 4. MultiBranch 

- Supported Parameter Types (for parameterized pipelines):
1. StringParameterDefinition
2. BooleanParameterDefinition
3. ChoiceParameterDefinition

``` Pipelines with unsupported parameter types will display a message indicating that the parameter type is not supported.```

To access folder-type pipelines, include the path of the pipeline up to the pipeline name with job/.
For example, if the folder pipeline name is demo-folder and the pipeline you want to display is inside this folder, add:
```yaml
flowsource/jenkins-pipelines: demo-folder/job/pipelineName
```
