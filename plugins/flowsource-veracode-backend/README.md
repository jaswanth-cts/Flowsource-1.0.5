# Flowsource Veracode Backend

This plugin displays details about the summary report of Static Analysis from the Veracode scan.

## Prerequisites

To access this plugin, you need to set the `Veracode-Api-Id` and `Veracode-Api-Key` in the `app-config` file. You can find more details about API credentials in the [Veracode Documentation](https://docs.veracode.com/r/c_api_credentials3).

Please note that the API key for this plugin requires the `Reviewer` role to function properly.

## Compatibility
 
- Veracode version - 23.3.19.0
- Flowsource version - 0.2.31 or later

## Configuration

Update the following values in the `app-config.yaml` file:

- `veracode.apiId`: The API ID obtained from the Veracode portal.
- `veracode.apiKey`: The API Key obtained from the Veracode portal.

## Source Code Changes

To make the plugin work, you need to make the following changes in the source code:

1. In `packages/backend/package.json`, add the plugin ID `"@flowsource/plugin-flowsource-veracode-backend": "^1.0.0"` to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet `"backend.add(import('@flowsource/plugin-flowsource-veracode-backend'));"` after the `createBackend()` function.

## Catalog Configuration

In the `catalog-info.yaml` file, add the annotation `"flowsource/veracode-app-name: <app_name>"` under the annotations field.
