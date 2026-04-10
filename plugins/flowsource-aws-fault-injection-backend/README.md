# flowsource-aws-fault-injection-backend

Welcome to the flowsource-aws-fault-injection-backend plugin!


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

## Source Code Changes
To make the plugin work, you need to make the following changes in the source code:
1. In `packages/backend/package.json`, add the plugin ID
```json
"@flowsource/plugin-flowsource-aws-fault-injection-backend": "^1.0.0"
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet
```typescript
"backend.add(import('@flowsource/plugin-flowsource-aws-fault-injection-backend'));"
```
after the `createBackend()` function.