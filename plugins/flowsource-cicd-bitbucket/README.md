# flowsource-bitbucket

Welcome to the flowsource-bitbucket backend plugin!

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-bitbucket](http://localhost:3000/flowsource-bitbucket).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

_This plugin was created through the Backstage CLI_

The plugin shows the details for workflow from bitbucket for a particular repository or project or workspace. 

The plugin shows a list of pipline names, by expanding the each pipeline will list workflow runs details of the pipeline include id, title, duration. Also the title of each workitem in the list is a link which will directly take the user to the Bitbucket dashboards page.

## Pre-requisites: 

1. In `packages/app/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-cicd-bitbucket"
``` 
to the dependencies section.
2. In `packages/app/src/App.tsx`, add import 
```tsx
import { FlowsourceBitbucketPage } from '@flowsource/plugin-flowsource-cicd-bitbucket';
```
 and add route 
 ```tsx
     <Route path="/flowsource-cicd-bitbucket" element={<FlowsourceCicdBitbucketPage/>} />
 ```
3. In `packages/app/src/components/catalog/EntityPage.tsx`

- Add the import 
```tsx
 import { FlowsourceBitbucketPage } from '@flowsource/plugin-flowsource-cicd-bitbucket';
```
- Add the page content:
```tsx
const BITBUCKET_REPO_NAME = 'flowsource/bitbucket-repo-name';
const BITBUCKET_REPO_OWNER = 'flowsource/bitbucket-repo-owner';
const isShowBitbucketRepoPage = (entity: any) => Boolean(entity.metadata.annotations?.[BITBUCKET_REPO_NAME] && entity.metadata.annotations?.[BITBUCKET_REPO_OWNER]);

const cicdContent = (
<EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isBitbucketCicdAnnotationAvailable(entity)}>
      <FlowsourceCicdBitbucketPage />
    </EntitySwitch.Case>
</EntitySwitch>
);
```
- Update the constant “serviceEntityPage” and “websiteEntityPage”:
```tsx
<EntityLayout.Route path="/ci-cd" title="CI/CD">
      <>
         <Grid container>
          <Grid item alignItems="stretch" md={12}>
            {cicdContent}
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>
const websiteEntityPage = (
<EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>
);
```

## Catalog Configuration

In the `catalog-info.yaml` file, add the annotation 
```yaml
flowsource/bitbucket-repo-owner: ${PROJECTNAME} #### Name of the project
flowsource/bitbucket-repo-name: ${REPONAME} #### repository under the the project
flowsource/bitbucket-host:  BITBUCKET_URL (optional) by default it uses the url from app-config.
```
 under the annotations field.

## Release Notes
### Release version : 1.0.1
- Updated the UI to show build failure reasons and commit message.