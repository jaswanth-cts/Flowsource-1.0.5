# Flowsource Code Quality Frontend

This plugin displays details about the Sonar scan analysis for a project from the SonarQube.

## UI Descrption

Contains 7 Cards and 2 trend charts
1. The cards displays the quality gate status, bugs, coverage, vulnerabilities, code smells, duplications, hotspots reviewed values.
2. Quality trend chart - Displays overall passed/failed results per month
3. Bugs-codesmells-vulnerabilities trend chart - Chart for bugs codesmells and vulnerabilities per month


## Source Code Changes

To make the plugin work, you need to make the following changes in the source code:

1. In `packages/app/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-code-quality": "^1.0.0"
``` 
to the dependencies section.
2. In `packages/app/src/App.tsx`, add import 
```tsx
import { FlowsourceCodeQualityPage } from '@flowsource/plugin-flowsource-code-quality';
```
 and add route 
 ```tsx
 <Route path="/code-quality" element={<FlowsourceCodeQualityPage />} />
 ```
3. In `packages/app/src/components/catalog/EntityPage.tsx`

- Add the import 
```tsx
import { FlowsourceCodeQualityPage } from '@flowsource/plugin-flowsource-code-quality';
```
- Add the page content:
```tsx
const CODE_QUALITY_ANNOTATION = 'flowsource/sonarqube-project-key';
const isCodeQualityAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CODE_QUALITY_ANNOTATION]);

const codeQualityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={ (entity, _) => isCodeQualityAnnotationAvailable(entity)}>
    <FlowsourceCodeQualityPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      <EmptyState
        title="No Code Quality page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to see Code Quality page."
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);
```
- Update the constant “serviceEntityPage” and “websiteEntityPage”:
```tsx
const serviceEntityPage = (
	 <EntityLayout.Route path="/sonarqube" title="Code quality">
      {codeQualityPage}
    </EntityLayout.Route>
);
const websiteEntityPage = (
	 <EntityLayout.Route path="/sonarqube" title="Code quality">
      <FlowsourceCodeQualityPage />
    </EntityLayout.Route>
);
```

## Catalog Configuration

In the `catalog-info.yaml` file, add the annotation 
```yaml
"flowsource/sonarqube-project-key: <project-key>"
```
 under the annotations field.

 ## Release Notes

### Version 1.0.1
- Add labels Reliability, Maintainability and Security instead of  Bugs, Code Smells and Vulnerabilities respectively if the version of sonarqube is >= 10.4.0
