# flowsource-prompt-library-metrics

Welcome to the flowsource-prompt-library-metrics plugin!

- Displays prompt usage metrics with interactive charts and tables.
- Shows total number of prompts and users for selected time ranges (30/60/120 days).
- Displays top 5 prompt categories by usage for selected time ranges (30/60/120 days).
- Allows filtering by type (editor, category) for Prompt usage count over time.

## Description (Dropdown - type)

- Editor - Displays prompt usage within code editors by querying metrics tagged with type:editor.
Helps understand usage patterns in environments like VS Code, IntelliJ, JupyterLab, or even browser-based editors like StackBlitz.

- Category - Groups prompt usage by custom-defined categories using the type:category tag.
Ideal for analyzing usage across logical groupings like "translation", "summarization", "code generation", "data analysis", or any team-defined category.

## Source Code Changes

Add the following to `packages/app/package.json`:

```json
"@flowsource/plugin-flowsource-prompt-library-metrics":"PLUGIN_VERSION"
```

Import and use the plugin in `packages/app/src/App.tsx`

```typescript
import { FlowsourcePromptLibraryMetricsPage } from '@flowsource/plugin-flowsource-prompt-library-metrics';

<Route path="/flowsource-prompt-library-metrics" element={<FlowsourcePromptLibraryMetricsPage />} />
```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-prompt-library-metrics](http://localhost:3000/flowsource-prompt-library-metrics).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.


## Release Notes

### Version 1.0.0
- Added new plugin
