# flowsource-featureflag
Welcome to the flowsource-featureflag plugin!

## Description

The flowsource-featureflag plugin provides feature flag management capabilities for FlowSource applications. It enables you to toggle features on or off dynamically, allowing for controlled rollouts, A/B testing, and safer deployments. Easily integrate feature flags into your workflow to improve development agility and user experience.

## Pre-requisites

Add the following annotations to the `catalog.yaml` file: 
- `flowsource/featureflag-project-name`: Specifies the name of the project for which feature flags are managed.
- `flowsource/featureflag-app-name`: Specifies the name of the application within the project that uses feature flags.

## Source Code Changes

Add the following to `packages/app/package.json`:
```json
"@flowsource/plugin-flowsource-featureflag": "PLUGIN_VERSION"
```
Import and use the plugin in `packages/app/src/App.tsx`:

```typescript
import { FlowsourceFeatureflagPage } from '@flowsource/plugin-flowsource-featureflag';
 <Route path="/flowsource-featureflag" element={<FlowsourceFeatureflagPage />} />  
```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-featureflag](http://localhost:3000/flowsource-featureflag).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
