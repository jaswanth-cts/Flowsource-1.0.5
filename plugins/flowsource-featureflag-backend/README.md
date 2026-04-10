# flowsource-featureflag

Welcome to the flowsource-featureflag plugin backend provides feature flag management capabilities for FlowSource applications. It enables you to define, toggle, and evaluate feature flags across your services, allowing for controlled feature rollouts, A/B testing, and gradual deployments. This backend integrates seamlessly with FlowSource, offering APIs to manage flags and query their status programmatically.

## Installation

This plugin is installed via the `@flowsource/plugin-flowsource-featureflag-backend` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @flowsource/plugin-flowsource-featureflag-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:
```ts
const backend = createBackend();
// ...
backend.add(import('@flowsource/plugin-flowsource-featureflag-backend'));
```

## Configuration

To configure the plugin, add the following settings to your `app-config.yaml` file:

```yaml
unleash:
  unleashBaseUrl: ${UNLEASH_BASE_URL} # Unleash base URL
  unleashToken: ${UNLEASH_TOKEN} # Unleash API token
```
Replace `${UNLEASH_BASE_URL}` and `${UNLEASH_TOKEN}` with the appropriate values for your environment.

## Source Code Changes

Add the following code in `packages/backend/src/index.ts`:
```typescript
backend.add(import('@flowsource/plugin-flowsource-featureflag-backend'));
```
Add the following in `packages/backend/package.json`:

```json
"@flowsource/plugin-flowsource-featureflag-backend": "PLUGIN_VERSION"
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn dev` from the root directory.
