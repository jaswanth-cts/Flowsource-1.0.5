# flowsource-blackduck

Welcome to the flowsource-blackduck plugin!

_This plugin was created through the Backstage CLI_


## UI Description
Scan summary page displays details of vulnerability and other related information from Blackduck scan in the pie chart format with  catergories of vulnerability high medium low for different risks Also, it shows top few files with high number of vulnerabilities

## Pre-requisites:

catalog-info.yaml
Annotations in catalog yaml for mentioning the specific tools to use:
```yaml
    flowsource/blackduck-project-id: Name of the project #new version of plugin required this entry
```
## Source Code Changes

1. In packages/app/package.json, add the plugin ID "@flowsource/plugin-flowsource-blackduck": "^1.0.0" to the dependencies section.
2. In packages/app/src/App.tsx, add import 
```tsx
    import { FlowsourceBlackduckPage } from '@flowsource/plugin-flowsource-blackduck'; 
```
and add route 
```tsx
    <Route path="/flowsource-blackduck" element={<FlowsourceBlackduckPage />} />  
```

3. In plugins/flowsource-well-architected/src/components/WellArchitectedComponent/SecurityComponentMain.js, add the import { BlackduckComponent } from '@flowsource/plugin-flowsource-blackduck/src/components/Blackduck-Component'; and an annotation check like const shouldRenderBlackduck = !!annotations && 'flowsource/blackduck-project-id' in annotations;     
4. Correspondingly Add an accordion {shouldRenderBlackduck ? (<BlackduckComponent/>) : (Error Message)}

    ```js
    //code to import the blackduck plugin.
    import { BlackduckComponent } from '@flowsource/plugin-flowsource-blackduck/src/components/Blackduck-Component';

      // Check if the specific annotation for SAST exists
    const shouldRenderBlackduck = !!annotations && 'flowsource/blackduck-project-id' in annotations;

    //Accordion tab section

   {shouldRenderBlackduck &&(
               <>
        { blackduckScanExpanded &&  <BlackduckComponent/>}
    </>
    ) : (
    <div className='mt-2 ms-1 me-1 mb-2'>
    <EntitySwitch>
    <EntitySwitch.Case>
    <EmptyState
        title="No Blackduck Scan page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to see Blackduck Scan page for it."
    />
    </EntitySwitch.Case>
    </EntitySwitch>
    </div>
    )}
    </Grid>
    </Grid>
    </Typography>
    </AccordionDetails>
    </Accordion>

```
## Catalog Configuration
In the catalog-info.yaml file, add the annotation "flowsource/blackduck-project-id: <project_id>" under the annotations field.

```yaml
flowsource/blackduck-project-id: <project_id>
```

## Release Notes
### Version 1.0.2
 Ui changes
  - Added table for components details
  - Added Dialog for identifier details
  - Added BOM entries

### Version 1.0.3
- Added accordion sections for BlackDuck summary and Security risk details
- Clicking an identifier opens the report in a new tab
- Improved the UI for the pie chart and risk aging section
- Added a dropdown to choose different versions
- By default, displays data from the latest scan
- Selecting a version automatically updates project details, pie charts, risk Aging and table data

## Getting started

This plugin displays details about the summary report of Static Analysis from the Blackduck scan.