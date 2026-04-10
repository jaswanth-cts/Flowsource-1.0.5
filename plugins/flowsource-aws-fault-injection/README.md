# flowsource-aws-fault-injection

Welcome to the flowsource-aws-fault-injection plugin!


## About

AWS Fault Injection is categorised as part of Well Architected Framework.
It provides a centralized location to view Experiments and Templates for the experiments configured in AWS Fault Injection service for  
testing the resilience of the application.
It helps you to understand the resilience of your applications by testing your applications by introducing faults.
The page displays the following information for the application from AWS Fault Injection service:
- Experiments
    - Experiment ID, Experiment Template ID, State, Error Description, Tags, Creation Time
- Templates
    - Experiment Template ID, Description, Tags, Creation Time, Last Updated

## Pre-requisites

In <b>catalog-info.yaml</b>, add the following annotations (this is a must for frontend plugin to work) :
```yaml
    flowsource/fis-aws-region: ap-southeast-1
    flowsource/fis-application-id: TicketBooking
```

Plugin needs to access the <u>AWS Fault Injection Service</u>, hence would need the following permissions in AWS account:
1. fis:ListExperimentTemplates
2. fis:ListExperiments

### Configuration to be updated in app-config.yaml:
```yaml
    aws-fault-injection:
      aws:
        access_key_id: ${WELL_ARCHITECTED_AWS_ACCESS_KEY}
        secret_access_key: ${WELL_ARCHITECTED_AWS_SECRET_KEY}     
```

## Changes to be made to the source code to include the plugin
1. In `packages/app/package.json`, add the plugin ID 
```json
"@flowsource/plugin-flowsource-aws-fault-injection": "^1.0.0", 
```
to the dependencies section.
2. In `packages/app/src/App.tsx`, add import
```tsx
import { FlowsourceAwsFaultInjectionPage } from '@flowsource/plugin-flowsource-aws-fault-injection';
```
and add the route as shown below
```tsx
<Route path="/flowsource-aws-fault-injection" element={<FlowsourceAwsFaultInjectionPage />} />
```