# flowsource-prismacloud

Welcome to the flowsource-prismacloud backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/flowsource-prismacloud](http://localhost:3000/flowsource-prismacloud).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

### Compatibility
 
- Prismacloud version - 21.8
- Flowsource version - 0.2.31 or later

#### Plugin integration
Plugin Id: @flowsource/plugin-flowsource-prismacloud-backend 
Plugin Type: Backend 

Steps to Integrate plugins with Flowsource-core: 

1. Add the following dependencies in /packages/backend/package.json under dependencies section: 
"@flowsource/plugin-flowsource-prismacloud-backend": "^0.1.0" 

2. Copy file ‘codeSecurity.ts’  from ./packages-core/backend/src/plugins  to ./packages/backend/src/plugins. 

3. Add the following to the file /packages/backend/src/index.ts: 
	a. Import statements: 
		import codeSecurity from './plugins/codeSecurity'; 

 	b. Env constant: 

		//...other env entries 
		const devCodeSecurityEnv = useHotMemoize(module, () => createEnv('codeSecurity')); 
	
	c. apiRouter entry: 
		const apiRouter = Router(); 
		//..other apiRouter entries 
		apiRouter.use('/code-security', await codeSecurity(devCodeSecurityEnv)); 
        

#### App-config.<env>.yaml
  
In your App-config.yaml file, you need to Add the following config items for this plugin to work:

prisma-cloud:
    api_host: ${PRISMA_API_URL}
    access_key: ${PRISMA_ACCESS_ID}
    secret_access_key: ${PRISMA_ACCESS_KEY}
    twistlock_api_host: ${TWISTLOCK_API_HOST}
    token_ttl: '5'
    max_row_fetch: '500'
    packageTypes:
    - packageType:
       name: OS
       value: 46
    - packageType:
       name: JAR
       value: 47
    - packageType:
       name: GEM
       value: 48
    - packageType:
       name: NODEJS
       value: 49
    - packageType:
       name: PYTHON
       value: 410
    - packageType:
       name: BINARY
       value: 411
    - packageType:
       name: CUSTOM
       value: 412
    - packageType:
       name: NUGET
       value: 415
    - packageType:
       name: Go
       value: 412  
## service account Requirement
    valid api_host ${PRISMA_API_URL} should be updated in respective env.
    Service accound should be created in respective prisma-cloud portal ${PRISMA_API_URL}. 
    for your reference-example prisma cloud url be like below
    https://abc.prismacloud.io/ 

    twistlock_api_host: it is required for following components
        Image Scan
        Host Scan
        Container scan
    please refer prisma cloud documentaiton for twistlock API url.
    Service account Access key and security key should be updated in respective enviroment secrets
