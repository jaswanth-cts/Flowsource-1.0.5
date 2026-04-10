# flowsource-core

Welcome to the flowsource-core plugin!

_This plugin was created through the Backstage CLI_


## Plugin Info

This Download plugin is mainly used for downloading the promptlibrary for VS code in the Zip file format.
Authentication settings enable the admin user to grant permissions to accessing the required pages and configure the details of authentication providers.


## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-core](http://localhost:3000/flowsource-core).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Authentication settings
The Authentication settings includes four tabs to configure flowsourceGroup, AuthProvider, GroupMappings and Email-To-Group mappings.
### Group Mapping
Group Mapping has 2 tabs: one for listing the configured flowsourceGroup mappings and another for adding or deleting the configured flowsource groups.

### Email to Group Mapping
Email to Group Mapping has 2 tabs: one for listing the configured 
Email to group mappings and another for adding or deleting the configured Email to groups.

### FlowsourceGroup and Auth Provider tabs
Tabs has feature to add the Master list of flowsourceGroup and AuthProviders.

### Integration
    To Integrate Authentication with setting menu following details has to be updated in package-core components

1. update `packages/app/src/App.tsx`, add SettingsLayout 
```tsx
    
    import { UserSettingsPage, SettingsLayout } from '@backstage/plugin-user-settings';
    import { FlowsourceCorePage, FlowsourceCoreAuthSettingsPage } from '@flowsource/plugin-flowsource-core/';
```
 and update the  settings Route
 ```tsx
    <Route path="/settings" element={<UserSettingsPage />}>
      <SettingsLayout.Route path="/auth-settings" title="Authentication Settings">
         <FlowsourceCoreAuthSettingsPage />
      </SettingsLayout.Route>
    </Route>;
    <Route path="/flowsource-core" element={<FlowsourceCorePage />} />
 ```




