# flowsource-github-copilot

Welcome to the flowsource-github-copilot plugin!

This plugin displays details about the summary of the usage metrics for Copilot completions (By Language & Editor), Chat acceptances and number of active users in the IDE across an organization

## Description of the graphs in the plugin UI

Contains 4 graphs
1. Metrics By Language -  stacked bar chart displays the breakdown of suggestions and acceptances by Language.
2. Metrics By Editor - stacked bar chart displays the breakdown of suggestions and acceptances by Editor.
3. Chat Usage Trend - line chart displays total Chat acceptances for the last 5 days.
4. User Trend - line chart displays the number active users and active chat users for the last 5 days.

## Pre-requisites

To use this plugin, you need either a GitHub personal access token or GitHub App credentials. These credentials are used to authenticate API requests to GitHub.

## Changes to be made to the source code to include the plugin

To make the plugin work, you need to make the following changes in the source code:

1. Add the below plugin ID to the dependencies section in `packages/app/package.json` 
    ```json
    "@flowsource/plugin-flowsource-github-copilot": "PLUGIN_VERSION"
    ```
2. Add the below import in `packages/app/src/App.tsx`
    ```typescript
    import { FlowsourceGithubCopilotPage } from '@flowsource/plugin-flowsource-github-copilot';
    ```
3. Add the below route in `packages/app/src/App.tsx`
    ```typescript
    <Route path="/flowsource-github-copilot" element={<FlowsourceGithubCopilotPage />} />
    ```
4. Add the below import in `packages/app/src/components/Root/Root.tsx`
    ```typescript
    import Github from '@material-ui/icons/GitHub';
    ```typescript
5. Add the below sidebar item in `packages/app/src/components/Root/Root.tsx`
    ```
        <SidebarItem icon={Github} to="flowsource-github-copilot" text="GitHub CoPilot" />
    ```

