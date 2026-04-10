# flowsource-cctp

## Plugin Info

## CCTP Plugin

The CCTP Custom Page plugin is designed to integrate with display CCPT frontend components displaying test plan, execution status execution status. It provides a user interface to view testplan details, execution details data fetched from CCTP application. The plugin is built using React and integrates with Backstage's core plugin API.

## Features

The CCTP Custom Page plugin, built with React and integrated with Backstage's core plugin API, enhances the display of test plans and execution statuses. 
It offers features like live reporting, centralized reporting, failure causal analysis, duplicate defect detection, defect trend analysis, and single-user performance and accessibility issue tracking. 
Initially designed for the CCTP platform, it now integrates seamlessly, providing comprehensive data visualization in Flowsource.

### Testing Card Component

**Test Plan Tab**:
Displays a grid of cards, each representing a pipeline run. The cards show the pipeline name, status, ID, and duration.
 with the test plan name, expanding the accordian shows the test plan details.
**Reports**: 
The reports tab displays a loading message while data is being fetched for test execution. 
It also contains accordian with test results. It  displays the last executed test suite.
User can click on the arrow on the right to view the test cases in the test suite. User can also view the test steps under the test case by clicking on arrow against the test case.







