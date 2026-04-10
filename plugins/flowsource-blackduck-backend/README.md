# flowsource-blackduck

Welcome to the flowsource-blackduck backend plugin!

_This plugin was created through the Backstage CLI_

## Description

This plugin displays details about the summary report of Blackduck scans.  
The scan summary page provides insights into vulnerabilities and other related information from Blackduck scans. It includes the following features:
- **Issue Distribution**: Displays issues categorized as High, Medium, and Low in a **pie chart** format.
- **Risk Aging**: Categorizes components based on their risk profiles and aging buckets in a **grouped bar chart** format.
- **High Vulnerabilities**: Highlights components with high and critical vulnerabilities.

## Prerequisites

To access this plugin, you need the following:
- **Blackduck Base URL**: The base URL of your Blackduck instance.

## Type of Access Token:
Bearer Token

## Permissions to be Given:
The Blackduck authentication token (`blackduck_auth_token`) must have the following minimum privileges to ensure all APIs used by this plugin work correctly:

- **Project View**: Permission to view project details.
- **Version View**: Permission to view version details for projects.
- **Component View**: Permission to view components and their details.
- **Vulnerability View**: Permission to view vulnerabilities and related reports.
- **Report Generation**: Permission to generate and download reports (including SBOM and summary reports).

> **Note:** The token should be associated with a user or service account that has at least "Read" access to all relevant projects and versions in Blackduck.  
> If you plan to use report generation features, ensure the token also has permission to create and download reports.

If you are unsure about the permissions, contact your Blackduck administrator to ensure the token has the above privileges.

## Configuration
Update the following values in the app-config.yaml file: You have to connect with blackduck support team to collect the required config items.
    
    blackduckAuthToken: <BLACKDUCK_AUTH_TOKEN>
    blackduckBaseUrl: <BLACKDUCK_BASE_URL>
    
## Source Code Changes
To make the plugin work, you need to make the following changes in the source code:

1. In packages/backend/package.json, add the plugin ID "@flowsource/plugin-flowsource-blackduck" "^1.0.0" to the dependencies section.
```json
  "@flowsource/plugin-flowsource-blackduck-backend": "^1.0.0",
```
2. In packages/backend/src/index.ts, add this snippet "backend.add(import('@flowsource/plugin-flowsource-blackduck-backend'));" after the createBackend() function.

```ts
    backend.add(import('@flowsource/plugin-flowsource-blackduck-backend'));
```

## Catalog Configuration

In the catalog-info.yaml file, add the annotation "flowsource/blackduck-project-id: <app_name>" under the annotations field.

#### Plugin Configuration
following details  need to be provided in app-config.yaml.

### app-config.yaml
Update the following values in your `app-config.yaml` file:

```yaml
blackduck:
  blackduckAuthToken: <BLACKDUCK_AUTH_TOKEN>
  blackduckBaseUrl: <BLACKDUCK_BASE_URL>
```

### catalog-info.yaml
In your `catalog-info.yaml` file, add the following properties under the `annotations` section:

```yaml
annotations:
  flowsource/blackduck-project-id: <project-name>
```

## Plugin Features

1. **Project Overview**  
   Displays details about the project, including:
   - Project Name
   - Latest Version Name
   - Last Scan Date
   - Version Phase
   - Version Distribution
   - Total BOM Entries

2. **Issue Distribution**  
   Displays the distribution of issues categorized as:
   - High
   - Medium
   - Low  

   This data is visualized in a **pie chart** format, providing a clear overview of the severity of issues in the project.

3. **High Vulnerabilities**  
   Highlights components with high and critical vulnerabilities, including:
   - Component Name
   - Component Version
   - Vulnerability Name
   - Severity

4. **Risk Aging**  
   Categorizes components based on their risk profiles and aging buckets:
   - 0-15 days
   - 15-30 days
   - 1-3 months
   - Greater than 3 months  
5. **Security Risk Details**
   Displayed component details
   - Displayed Identifier details

   This data is displayed in a **grouped bar chart** format.

## Release Notes
### Version 1.0.2
- Implemented new API endpoints to retrieve the components and identifier details 

### Version 1.0.3
- Implemented new API endpoints to fetch graph data
- Clicking an identifier opens the report in a new tab
- Added a dropdown to choose different versions
- By default, displays data from the latest scan
- Selecting a version automatically updates project details, pie charts, risk Aging and table data