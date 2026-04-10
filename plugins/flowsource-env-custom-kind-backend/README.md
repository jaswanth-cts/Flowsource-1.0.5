# flowsource-catalog-backend-module-custom-kind

This is a custom backstage component that has been created. The type of this component is `Enviroment`.

## Setup:  
In these steps we will address how we can create a catalog.yaml with `kind: Environment`, integrate the `Enviroment Component` with `Flowsource` and `supported plugins`.   

## STEP 1:  `CATALOG CREATION`  
To create a catalog of type `Environment`. In a `catalog.yaml` file,
```
    apiVersion: flowsource/v1
    kind: Environment
    metadata:
        name: Flowsource-Dev
        appid: Flowsource
        description: Catalog for Flowsource
        tags:
            - backstage
        annotations:

    spec:
        type: dev
        system: SDLC
        owner: group:catalog-admin
        dependsOn:
            - resource:default/Flowsource-DB
        subcomponentOf: component:default/Flowsource
```
```
STEP 1: Set apiVersion: flowsource/v1
STEP 2: Set kind: Environment
STEP 3: Set spec with below supported catagories
    - type: Refers to the type of environment. Ex: ["QA", "Dev", "Prod"].
    - owner: An entity reference to the owner of the environment. Ex: ["artist-relations-team", "user:john.johnson", "group:catalog-admin"].
    - system: An entity reference to the system that the environment belongs to.
    - subenvironmentOf: An entity reference to another environment of which the environment is a part.
    - dependsOn: An array of references to other entities that the environment depends on to function.  
```
The `annotation and other values` can be set like we do for other component types in the catalog.yaml file.

## STEP 2:  `ENVIRONMENT COMPONENT INTEGRATION`  
We will have to integrate the custom component `Enviroment` with `Flowsource`. 

## Changes to be made to the source code to include Environment Component
```
    1.Add the below in packages/backend/src/index.ts
        - backend.add(import('@flowsource/plugin-flowsource-env-custom-kind-backend'));
    
    2. We need to create the below in packages/app/src/components/catalog/EntityPage.tsx
        - Below component needs to be created. Within this, we will add our tabs & plugin endpoints
            
            const environmentEntityPage = ( );  
        
        - Then the environmentEntityPage component must be register in entityPage component as per below example. We should only add this one line for environmentEntityPage without modifiying anything in entityPage component.

            <EntitySwitch.Case if={isKind('Environment')} children={environmentEntityPage} />
        
        Ex:
            export const entityPage = (
                <EntitySwitch>
                    ...
                    <EntitySwitch.Case if={isKind('Environment')} children={environmentEntityPage} />
                    ...
                </EntitySwitch>
            );
```

## STEP 3:  `PLUGINS INTEGRATION`    
Once catalog is created and registered in `Flowsource`, we can then configure plugins that support Environment component by configuring them as per the documentation provided by each plugin. Below mentioned plugins are supported,   
    
1. `Serivce Now`: Will render the `TASK Tab`, `ITSM Tab` & `InfraProvisioning Page`.  
    - `plugins/flowsource-service-now/README.md`  
    - `plugins/flowsource-service-now-backend/README.md`  
    - `plugins/flowsource-infra-provision/README.md`
2. `Jenkins CICD`: Will render the `CICD Tab`.  
    - `plugins/flowsource-cicd-jenkins/README.md`  
    - `plugins/flowsource-cicd-jenkins-backend/README.md`  
3. `Reservations`: Will render the `RESERVATIONS Tab`.  
    - `plugins/flowsource-environment-reservation/README.md`  
    - `plugins/flowsource-environment-reservation-backend/README.md`  
4. `Finops`: Will render the `FINOPS Tab`.  
    - `plugins/flowsource-cloudability-frontend/README.md`  
    - `plugins/flowsource-cloudability-backend/README.md`  