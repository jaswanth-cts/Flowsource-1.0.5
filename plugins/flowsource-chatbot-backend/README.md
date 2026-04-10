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

## Configuration

Update the following values in the `app-config.yaml` file:
```yaml
chatbot:
  url: ${CHATBOT_URL} #### Add the endpoint URL
  enabled: ${CHATBOT_ENABLED} #### enable the chatbot functionality
  accessToken: ${CHATBOT_TOKEN} #### Personal access token
  scheduler:
    refreshInterval:
      hours: ${CHATBOT_REFRESH_INTERVAL_HOURS}
      minutes: ${CHATBOT_REFRESH_INTERVAL_MINUTES}
      seconds: ${CHATBOT_REFRESH_INTERVAL_SECONDS}
    timeout:
      hours: ${CHATBOT_TIMEOUT_HOURS}
      minutes: ${CHATBOT_TIMEOUT_MINUTES}
      seconds: ${CHATBOT_TIMEOUT_SECONDS}
    initialDelay:
      hours: ${CHATBOT_INITIAL_DELAY_HOURS}
      minutes: ${CHATBOT_INITIAL_DELAY_MINUTES}
      seconds: ${CHATBOT_INITIAL_DELAY_SECONDS}
```
## Source Code Changes
To make the plugin work, you need to make the following changes in the source code:
1. In `packages/backend/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-chatbot-backend": "^1.0.0"
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet 
```typescript
"backend.add(import('@flowsource/plugin-flowsource-chatbot-backend'));"
```
 after the `createBackend()` function.

## Catalog Configuration

In the `catalog-info.yaml` file, add the following annotations 
```yaml
cognizant/chatbot-project-id: TicketBooking  #### app Id
```
under the annotations field.
