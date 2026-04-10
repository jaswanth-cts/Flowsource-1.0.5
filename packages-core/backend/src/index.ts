import { createBackend } from '@backstage/backend-defaults';
import { customAuthProvidersModule } from './plugins/auth';
import { customCatalogAdminPermissionPolicyBackendModule } from './plugins/permission';
import { scaffolderModuleCustomExtensions } from './plugins/scaffolder';
import 'global-agent/bootstrap';
import { setGlobalDispatcher, ProxyAgent, Agent, Dispatcher } from 'undici';
import { scaffoldertriggerCodepipeline } from "../../../plugins/scaffolder-backend-module-custom-action-aws-using-github/src/module";
import { scaffolderGcpCiTriggerPipeline } from '../../../plugins/scaffolder-backend-module-gcp-ci-pipeline-trigger/src/actions/triggerGcpCiPipelineAction/module';


const proxyEnv =
  process.env.GLOBAL_AGENT_HTTP_PROXY ||
  process.env.GLOBAL_AGENT_HTTPS_PROXY;
 
 
if (proxyEnv) {
  const noProxyList = (process.env.GLOBAL_AGENT_NO_PROXY && process.env.GLOBAL_AGENT_NO_PROXY.split(',')) || [];
  
  const proxyUrl = new URL(proxyEnv);
    // Create an access token if the proxy requires authentication
    const token = proxyUrl.username && proxyUrl.password ?
        `Basic ${Buffer.from(`${proxyUrl.username}:${proxyUrl.password}`).toString('base64')}` : undefined;
 
    // Create a default agent that will be used for no_proxy origins
    const defaultAgent = new Agent();
  
    // Create an interceptor that will use the appropriate agent based on the origin and the no_proxy
    // environment variable.
    const noProxyInterceptor = (dispatch: Dispatcher['dispatch']): Dispatcher['dispatch'] => {
        return (opts, handler) => {
            let noProxy = false;
 
            for (const exclusion of noProxyList) {
                if (opts.origin?.toString().search(exclusion) != -1) {
                    noProxy = true;
                    break;
                }
            }
 
            return noProxy ?
                defaultAgent.dispatch(opts, handler) :
                dispatch(opts, handler);
        }
    };
  
    // Create a proxy agent that will send all requests through the configured proxy, unless the
    // noProxyInterceptor bypasses it.
    const proxyAgent = new ProxyAgent({
        uri: proxyUrl.protocol + proxyUrl.host,
        token,
        interceptors: {
        Client: [noProxyInterceptor]
        }
    });
 
    // Make sure our configured proxy agent is used for all `fetch()` requests globally.
    setGlobalDispatcher(proxyAgent);
 
}

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
// backend.add(import('@backstage/plugin-proxy-backend'));

backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));
backend.add(scaffolderModuleCustomExtensions);
backend.add(scaffoldertriggerCodepipeline);
backend.add(scaffolderGcpCiTriggerPipeline);
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(customAuthProvidersModule);

backend.add(import('@backstage/plugin-permission-backend'));
backend.add(customCatalogAdminPermissionPolicyBackendModule);

backend.add(import('@backstage/plugin-techdocs-backend'));

backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

backend.add(import('@flowsource/plugin-flowsource-aws-fault-injection-backend'));
backend.add(import('@flowsource/plugin-flowsource-azure-devops-workitems-backend'));
backend.add(import('@flowsource/plugin-flowsource-azure-pipeline-backend'));
backend.add(import('@flowsource/plugin-flowsource-azure-repo-backend'));
backend.add(import('@flowsource/plugin-flowsource-bitbucket-backend'));
backend.add(import('@flowsource/plugin-flowsource-catalog-backend'));
backend.add(import('@flowsource/plugin-flowsource-cicd-aws-backend'));
backend.add(import('@flowsource/plugin-flowsource-cicd-gcp-backend'));
backend.add(import('@flowsource/plugin-flowsource-chatbot-backend'));
backend.add(import('@flowsource/plugin-flowsource-checkmarx-backend'));
backend.add(import('@flowsource/plugin-flowsource-cicd-bitbucket-backend'));
backend.add(import('@flowsource/plugin-flowsource-cicd-github-backend'));
backend.add(import('@flowsource/plugin-flowsource-cicd-jenkins-backend'));
backend.add(import('@flowsource/plugin-flowsource-cloudability-backend'));
backend.add(import('@flowsource/plugin-flowsource-code-quality-backend'));
backend.add(import('@flowsource/plugin-flowsource-core-backend'));
backend.add(import('@flowsource/plugin-flowsource-datadog-backend'));
backend.add(import('@flowsource/plugin-flowsource-devops-guru-backend'));
backend.add(import('@flowsource/plugin-flowsource-dora-metrics-backend'));
backend.add(import('@flowsource/plugin-flowsource-github-backend'));
backend.add(import('@flowsource/plugin-flowsource-github-copilot-backend'));
backend.add(import('@flowsource/plugin-flowsource-jira-backend'));
backend.add(import('@flowsource/plugin-flowsource-morpheus-backend'));
backend.add(import('@flowsource/plugin-flowsource-prismacloud-backend'));
backend.add(import('@flowsource/plugin-flowsource-resilience-hub-backend'));
backend.add(import('@flowsource/plugin-flowsource-resilience4j-backend'));
backend.add(import('@flowsource/plugin-flowsource-service-now-backend'));
backend.add(import('@backstage/plugin-kubernetes-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-azure'));
backend.add(import('@flowsource/plugin-flowsource-veracode-backend'));
backend.add(import('@flowsource/plugin-flowsource-dynatrace-backend'));
backend.add(import('@flowsource/plugin-flowsource-cctp-backend'));
backend.add(import('@flowsource/plugin-flowsource-appdynamics-backend'));
backend.add(import('@flowsource/plugin-flowsource-zephyr-backend'));
backend.add(import('@flowsource/plugin-flowsource-playwright-backend'));
backend.add(import('@flowsource/plugin-flowsource-selenium-backend'));
backend.add(import('@flowsource/plugin-flowsource-blackduck-backend'));
backend.add(import('@flowsource/plugin-flowsource-prompt-library-metrics-backend'));
backend.add(import('@flowsource/plugin-flowsource-featureflag-backend'));
backend.add(import('@flowsource/plugin-flowsource-azure-release-backend'));
backend.add(import('@flowsource/plugin-flowsource-pdlc-backend'));
backend.add(import('@flowsource/plugin-environment-reservation-backend'));
backend.add(import('@flowsource/plugin-flowsource-env-custom-kind-backend'));
backend.start();
