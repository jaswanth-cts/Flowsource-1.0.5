# flowsource-resilience-hub

Welcome to the flowsource-resilience-hub backend plugin!


## About

Resilience hub Dashboard is categorised as part of Well Architected Framework. 
It provides a centralized location to view and manage resilience information for your applications, configured in AWS Resilience Hub.
It helps you to understand the resilience of your applications and provides recommendations to improve the resilience of your applications.
The page displays the following information for the application from AWS Resilience Hub:
    - Policy Name
    - Resiliency Score
    - Operational Recommendations
    - Resiliency Recommendations

## Pre-requisites

In <b>catalog-info.yaml</b>, add the following annotations (this is a must for frontend plugin to work) :
```yaml
    flowsource/aws-resiliencehub-appname: Theatre-Booking
    flowsource/aws-resiliencehub-region: ap-southeast-1
```

Plugin needs to access the <u>AWS Resilience Hub</u>, hence would need the following permissions in AWS account:  
        1. resiliencehub:ListTestRecommendations    
        2. resiliencehub:ListAppCoponentCompliances    
        3. resiliencehub:ListSopRecommendations  
        4. resiliencehub:ListApps  
        5. resiliencehub:DescribeResiliencyPolicy    
        6. resiliencehub:ListAppAssesments  
        7. resiliencehub:ListResiliencyPolicies  
        8. resiliencehub:DescribeApp  
        9. resiliencehub:ListSuggestedResiliencyPolicies  
        10. resiliencehub:DescribeAppAssessment  
        11. resiliencehub:ListAppComponentRecommendations  
        12. resiliencehub:ListAlarmRecommendations  
        
### Configuration to be updated in app-config.yaml:
```yaml
     resilience-hub:
       aws:
         access_key_id: ${WELL_ARCHITECTED_AWS_ACCESS_KEY}
         secret_access_key: ${WELL_ARCHITECTED_AWS_SECRET_KEY}
```

## Source Code Changes
To make the plugin work, you need to make the following changes in the source code:
1. In `packages/backend/package.json`, add the plugin ID
```json
"@flowsource/plugin-flowsource-resilience-hub-backend": "^1.0.0"
```
to the dependencies section.
2. In `packages/backend/src/index.ts`, add this snippet
```typescript
"backend.add(import('@flowsource/plugin-flowsource-resilience-hub-backend'));"
```
after the `createBackend()` function.