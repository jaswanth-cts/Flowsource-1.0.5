# flowsource-devops-guru-backend

Welcome to the flowsource-devops-guru-backend plugin!


## About

AWS DevOps is categorised as part of Well Architected Framework/Ops Insights.

Amazon DevOps Guru is a fully managed operations service that uses machine learning to make it easier for developers to  
improve application availability by automatically detecting operational issues and recommending fixes.

This plugin provides all the reactive and proactive insights from DevOps Guru.

The page displays the following information for the application from AWS DevOps Guru service:
- Reactive Insights
    - Reactive Insights Name, Status, Severity, Created Time, Affected Applications, Affected Services
- Proactive Insights
    - Proactive Insights Name, status, Severity, Created Time, Affected Applications, Affected Services, Predicted Impact Time

## Pre-requisites

Plugin needs to access the <u>AWS DevOps Guru Service</u>, hence would need the following permissions in AWS account:
1. devops-guru:ListInsights

### Configuration to be updated in app-config.yaml:
```yaml
    devops-guru:
      statusFilter:
        startTimeRange:
          fromTime: ${DEVOPS_GURU_FILTER_FROM_TIME}
      aws:
        access_key_id: ${DEVOPS_GURU_AWS_ACCESS_KEY_ID}
        secret_access_key: ${DEVOPS_GURU_AWS_SECRET_ACCESS_KEY}
```

`DEVOPS_GURU_FILTER_FROM_TIME` is used in AWS api call for fetching insights.  
This denotes the starting time of the time range, within which all the insights would be fetched.

## Source Code Changes
To make the plugin work, you need to make the following changes in the source code:
1. In `packages/backend/package.json`, add the plugin ID
```json
"@flowsource/plugin-flowsource-devops-guru-backend": "^1.0.0"
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet
```typescript
"backend.add(import('@flowsource/plugin-flowsource-devops-guru-backend'));"
```
after the `createBackend()` function.