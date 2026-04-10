# flowsource-checkmarx

Welcome to the flowsource-checkmarx plugin!

_This plugin was created through the Backstage CLI_


## UI Descrption
Scan summary page displays details of vulnerability and other related information from CheckMarx scan in the pie chart format with  catergories of vulnerability high medium low for old issues and new issues.
Also, it shows top few files with high number of vulnerabilities

## Pre-requisites:

catalog-info.yaml
Annotations in catalog yaml for mentioning the specific tools to use:
```yaml
    flowsource/checkmarx-project-id: TicketBooking #new version of plugin required this entry
    cognizant/checkmarx-project-id: TicketBooking #old version of plugin required this entry
```
## Source Code Changes

1. In packages/app/package.json, add the plugin ID "@flowsource/plugin-flowsource-checkmarx": "^1.0.0" to the dependencies section.
2. In packages/app/src/App.tsx, add import 
```tsx
    import { FlowsourceCheckmarxPage } from '@flowsource/plugin-flowsource-checkmarx'; 
```
and add route 
```tsx
    <Route path="/flowsource-checkmarx" element={<FlowsourceCheckmarxPage />} />   
```

3. In plugins/flowsource-well-architected/src/components/WellArchitectedComponent/SecurityComponentMain.js, add the import CheckmarxMain from '@flowsource/plugin-flowsource-checkmarx/src/components/Checkmarx/CheckmarxMain'; and an annotation check like const shouldRenderCheckmarx = !!annotations && 'cognizant/checkmarx-app-name' in annotations;     
4. Correspondingly Add an accordion {shouldRenderCheckmarx ? (<CheckmarxMain/>) : (Error Message)}

    ```js
    //code to import the checkmarx plugin.
    import CheckmarxMain from '@flowsource/plugin-flowsource-checkmarx/src/components/Checkmarx/CheckmarxMain';

      // Check if the specific annotation for SAST exists
    const shouldRenderCheckmarx = !!annotations && 'cognizant/checkmarx-project-id' in annotations;

    //Accordion tab section

   {shouldRenderCheckmarx &&(
            <Accordion >
                <AccordionSummary className={`bg-info`}
                    expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" >
                    <Typography>SAST</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        <Grid container>
                            <Grid item md={12}>
                            <CheckmarxMain />
                            </Grid>
                        </Grid>
                    </Typography>
                </AccordionDetails>
            </Accordion>

```
## Catalog Configuration
In the catalog-info.yaml file, add the annotation "cognizant/checkmarx-app-name: <app_name>" under the annotations field.

```yaml
cognizant/checkmarx-app-name: <app_name>
```
## Getting started

This plugin displays details about the summary report of Static Analysis from the CheckMark scan.