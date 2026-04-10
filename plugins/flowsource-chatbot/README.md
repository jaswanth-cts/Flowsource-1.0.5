# flowsource-chatbot

Welcome to the flowsource-chatbot backend plugin!

## Getting started

_This plugin was created through the Backstage CLI_

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-chatbot](http://localhost:3000/flowsource-chatbot).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## About

Chatbot plugin enables the user to ask questions on the documentation and get it answered.

## Pre-requisites: 
To access this plugin, you need to set the CHATBOT_URL, CHATBOT_ENABLED and CHATBOT_TOKEN in the app-config file.

## Changes to be made to the source code to include the plugin
```tsx
Add the below in EntityPage.tsx
- import { ChatbotComponent } from '@flowsource/plugin-flowsource-chatbot/src/components/ChatbotComponent/ChatbotComponent';
- under serviceEntityPage & websiteEntityPage
  typescript
const techdocsContent = (

  <Grid container>
    <Grid item>
      <EntityTechdocsContent>
        <TechDocsAddons>
          <ReportIssue />
          <Mermaid config={{ theme: 'forest', themeVariables: { lineColor: '#000000' } }} />
        </TechDocsAddons>
      </EntityTechdocsContent>
    </Grid>
    <Grid item>
      <Grid container justifyContent="flex-end">
        <Grid item style={{ position: 'fixed', bottom: '0px', right: '0px' }}>
          <ChatbotComponent />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);


1. In `packages/app/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-chatbot": "^1.0.0" 
```
to the dependencies section.
2. In `packages/app/src/App.tsx`, add import 
```tsx
import { FlowsourceChatbotPage } from '@flowsource/plugin-flowsource-chatbot';
```
and add route
```tsx 
<Route path="/chatbot" element={<FlowsourceChatbotPage />} />
```
3. In `packages/app/src/components/catalog/EntityPage.tsx`

- Add the import 
```tsx
import { ChatbotComponent } from '@flowsource/plugin-flowsource-chatbot/src/components/ChatbotComponent/ChatbotComponent';
```
- Under techdocs content add the following
```tsx
   const techdocsContent = (

  <Grid container>
    <Grid item>
      <EntityTechdocsContent>
        <TechDocsAddons>
          <ReportIssue />
          <Mermaid config={{ theme: 'forest', themeVariables: { lineColor: '#000000' } }} />
        </TechDocsAddons>
      </EntityTechdocsContent>
    </Grid>
    <Grid item>
      <Grid container justifyContent="flex-end">
        <Grid item style={{ position: 'fixed', bottom: '0px', right: '0px' }}>
          <ChatbotComponent />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);
```
- Update the constant “serviceEntityPage” and “websiteEntityPage”:
```tsx
const defaultEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

const serviceEntityPage = (
    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
);

const websiteEntityPage = (
  <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
);
```

## Catalog Configuration

In the `catalog-info.yaml` file, add the following annotations 
```yaml
flowsource/chatbot-project-id: TicketBooking  #### App Id
```
under the annotations field.