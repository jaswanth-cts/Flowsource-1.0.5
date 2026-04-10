# flowsource-veracode

Welcome to the flowsource-veracode plugin!

This plugin displays details about the summary report of Static Analysis from the Veracode scan.


## UI Descrption

Contains 3 Cards
1. First card displays details such as app_name, policy_name, policy_compliance_status, and other related information from Veracode..
2. Second card shows flaw_status and flaws_by_severity in a pie chart, with the percentages of each flaw .
3. Third card shows the top_5_categories, including the category name and count.

## Source Code Changes

To make the plugin work, you need to make the following changes in the source code:

1. In `packages/app/package.json`, add the plugin ID `"@flowsource/plugin-flowsource-veracode": "^1.0.0"` to the dependencies section.
2. In `packages/app/src/App.tsx`, add import `import { FlowsourceVeracodePage } from '@flowsource/plugin-flowsource-veracode';` and add route `<Route path="/flowsource-veracode" element={<FlowsourceVeracodePage />} />`
3. In `plugins/flowsource-well-architected/src/components/WellArchitectedComponent/SecurityComponentMain.js`, add the `import VeracodeMain from '@flowsource/plugin-flowsource-veracode/src/components/Veracode/VeracodeMain';` and an annotation check like `const shouldRenderVeracode = !!annotations && 'flowsource/veracode-app-name' in annotations;`
4. Correspondingly Add an accordion `{shouldRenderVeracode ? (<VeracodeMain/>) : (Error Message)}`

## Catalog Configuration

In the `catalog-info.yaml` file, add the annotation `"flowsource/veracode-app-name: <app_name>"` under the annotations field.