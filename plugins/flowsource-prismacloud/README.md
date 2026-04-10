# flowsource-prismacloud

Welcome to the flowsource-prismacloud plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/flowsource-prismacloud](http://localhost:3000/flowsource-prismacloud).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

#### Plugin integration

Plugin Id: @flowsource/plugin-flowsource-prismacloud 
Plugin Type: Frontend 

Steps to merge plugins with Flowsource-core: 
    1. Add the below mentioned dependency to ./packages/app/package.json under ‘dependencies’ section: 
        "@flowsource/plugin-flowsource-prismacloud": "^0.1.0" 
    2. Add the below entries to ./packages/app/src/App.tsx: 
        a. Import Statement:  
            import { FlowsourcePrismacloudPage } from '@flowsource/plugin- flowsource-prismacloud; 

        b. Route Entries: 
        const routes = ( 
            <FlatRoutes> 
            {/* other route entries */} 
                <Route path="/flowsource-prismacloud" element={<FlowsourcePrismacloudPage />} /> 
            {/* other route entries */} 
            </FlatRoutes> 
        ); 
        

#### catalog-info.yaml
  
In your catalog-info.yaml file, you need to Add the following annotation under metadata -> annotations for this plugin to work:

```annotations:
    flowsource/prismacloud-scan-repo: <repo-name>#moviesapp
    flowsource/prismacloud-scan-branch: <branch-name>

    flowsource/prismacloud-container-images: <deplayed-image-list-separated-by-comma>cicd-prisma-testing

    flowsource/prismacloud-iac-scan-repo: <repo-name>
    flowsource/prismacloud-iac-scan-branch: <branch-name>
    
    #prisma cloud defender scan - hosts
    flowsource/prismacloud-defender-hosts: <host-name-list-separated-by-comma>
    #prisma cloud defender scan - container
    flowsource/prismacloud-defender-container-namespaces: <deplayed-namespace-list-separated-by-comma>
    flowsource/prismacloud-defender-cluster-name: <name-of-the-cluster> #only single cluster name allowed
    flowsource/prismacloud-defender-container-deployment-images:<deplayed-image-list-separated-by-comma> #sample docker.io/library/nginx:1.14.2
   

```
Replace <configuration_item_name> with the name of your configuration item.
