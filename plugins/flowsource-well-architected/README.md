# flowsource-well-architected

Welcome to the flowsource-well-architected plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-well-architected](http://localhost:3000/flowsource-well-architected).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

To configure your plugins, add pluginNames in app-config.yaml like below :

      wellArchitectedPlugins:
        plugins: "AWS Resilience Hub,DevopsGuru"
