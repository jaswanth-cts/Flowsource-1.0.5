# Flowsource AppDynamics Frontend

The Flowsource AppDynamics Frontend plugin provides a interface to display application error logs from AppDynamics. This plugin helps you monitor and analyze error logs efficiently.

## Features

- **Error Logs Display**: View application error logs along with their respective date and time, making it easy to track when errors occurred.
- **Detailed StackTrace**: The Details column provides the complete StackTrace of the error logs, allowing for in-depth analysis and debugging.
- **Error Count Visualization**: A bar graph displays the error count for each day, giving a clear visual representation of error trends over time.

### Source code changes:

1. Add the following dependencies in /packages/app/package.json under dependencies section: 
```json
"@flowsource/plugin-flowsource-appdynamics" : "^1.0.0"
```
2. Add the below entries to  ./packages/app/src/App.tsx: 

#### Import Statement: 

```tsx
import { FlowsourceAppdynamicsPage } from '@flowsource/plugin-flowsource-appdynamics';
```

#### Update the route in router path:

```tsx
<Route path="/flowsource-appdynamics" element={<FlowsourceAppdynamicsPage />} />
```

## Catalog Configuration

In the `catalog-info.yaml` file, add the following annotations 
```yaml
flowsource/appdynamics-application-name: <application-name>
```
under the annotations field.

For example, 
```yaml
flowsource/appdynamics-application-name: demo
