# flowsource-environment-reservation

Welcome to the flowsource-environment-reservation plugin!

The plugin shows the details for Reservations from bookings and maintenance-requests for a particular appId. 

The plugin shows two task:
- Booking request.
- Maintenance request.

Booking and Maintenance request shows its state, start time and end time


## Changes to be made to the source code to include the plugin

Add the below in EntityPage.tsx
- import { EnvironmentReservationPage } from '@flowsource/plugin-environment-reservation';
-   under environmentEntityPage
  ```typescript
    <EntityLayout.Route path="//flowsource-environment-reservation" title="Reservation">
        <FlowsourceJiraPage/>
    </EntityLayout.Route>


Add the below in packages/app/package.json
- "@flowsource/plugin-environment-reservation": PLUGIN_VERSION (eg: "^1.0.0")



## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-environment-reservation](http://localhost:3000/flowsource-jira).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

### Release 1.0.5
