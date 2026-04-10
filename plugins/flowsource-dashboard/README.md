# flowsource-dashboard
Welcome to the flowsource-dashboard plugin! <br>
This plugin helps to display the dashboard within the Flowsource application, at the root level. 

## To use flowsource-dashboard plugin in a plain backstage(v1.26) instance

1. Copy the flowsource-dashboard plugin code into backstage instance.

2. In, packages/app/package.json, add 
      ```
      "@flowsource/plugin-flowsource-dashboard": "^1.0.1"
      ```

2. In packages/app/src/App.tsx, add the following code 
      ```
      import { FlowsourceDashboardPage } from '@flowsource/plugin-flowsource-dashboard';
      <Route path="/flowsource-dashboard" element={<FlowsourceDashboardPage />} />
      ```

3. In packages/app/src/components/Root/Root.tsx, add the following code

      ```
      import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';

      return(
        <SidebarPage>
            <SidebarGroup label="Menu" icon={<MenuIcon />}>
              ...
              <SidebarItem icon={DashboardRoundedIcon} to="flowsource-dashboard" text="Dashboard" />
            </SidebarGroup>
        </SidebarPage>
        );
      ```  


## Pre-requisites
- To access the Dashboard on Flowsource, you need the necessary permissions.
- You’ll also need to provide the Dashboard Domain and the Dashboard Embed URL for configuring in Flowsource.
- These details are to be provided in the app-config.yaml file, as shown below:

```yaml
  csp:
    connect-src: ["'self'", 'http:', 'https:']
    frame-src: ["'self'",  '${DASHBOARD_DOMAIN}']

  dashboard:
    baseUrl: ${DASHBOARD_EMBED_URL}
```

## Dashboard Domain and Dashboard Embed URL.
`${DASHBOARD_DOMAIN}` - use the dashboard’s domain as the value, ensuring there are no trailing slashes.

Refer below documentations for getting the embed url for various dashboard platforms:
- AWS Quicksight - https://docs.aws.amazon.com/quicksight/latest/user/embedded-analytics-1-click.html
- Microsoft PowerBI - https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-embed-secure
- GCP looker studio - https://support.google.com/looker-studio/answer/7450249?hl=en#embed-via-html-iframe&zippy=%2Cin-this-article
  
Additionally, we may need to whitelist the Flowsource application URL on the respective dashboard website, particularly for AWS QuickSight. For more details, refer to the documentation: https://docs.aws.amazon.com/quicksight/latest/user/manage-qs-domains-and-embedding.html

#### Notes
_This plugin was created through the Backstage CLI._
