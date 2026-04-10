import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import { TechRadarPage } from '@backstage-community/plugin-tech-radar';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage, SettingsLayout } from '@backstage/plugin-user-settings';
import { apis, awsCognitoOIDCAuthApiRef, keycloakOIDCAuthApiRef } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';
import { AlertDisplay, OAuthRequestDialog , ProxiedSignInPage , SignInPage , SignInProviderConfig , AutoLogout } from '@backstage/core-components';


import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { FlowsourceWellArchitectedPage } from '@flowsource/plugin-flowsource-well-architected';
import { FlowsourceDevopsGuruPage } from '@flowsource/plugin-flowsource-devops-guru';
import { FlowsourceChatbotPage } from '@flowsource/plugin-flowsource-chatbot';
import { FlowsourceCodeQualityPage } from '@flowsource/plugin-flowsource-code-quality';
import { Mermaid } from 'backstage-plugin-techdocs-addon-mermaid';
import { FlowsourceAzureDevopsWorkitemsPage } from '@flowsource/plugin-flowsource-azure-devops-workitems';
import { FlowsourceGithubPage } from '@flowsource/plugin-flowsource-github';
import { FlowsourceBitbucketPage } from '@flowsource/plugin-flowsource-bitbucket';
import { FlowsourceCheckmarxPage } from '@flowsource/plugin-flowsource-checkmarx';
import { FlowsourceJiraPage } from '@flowsource/plugin-flowsource-jira';
import { FlowsourceCicdCustomFrontendPage } from '@flowsource/plugin-flowsource-cicd-github-frontend';
import { FlowsourceDoraMetricsPage } from '@flowsource/plugin-flowsource-dora-metrics';
import { FlowsourcePrismacloudPage } from '@flowsource/plugin-flowsource-prismacloud';
import { FlowsourceAzureRepoPage } from '@flowsource/plugin-flowsource-azure-repo';
import { FlowsourceInfraProvisionPage } from '@flowsource/plugin-flowsource-infra-provision';
import { FlowsourceCicdJenkinsPage } from '@flowsource/plugin-flowsource-cicd-jenkins';
import { githubAuthApiRef , microsoftAuthApiRef , discoveryApiRef, useApi, configApiRef ,type  IdentityApi } from '@backstage/core-plugin-api';
import { FlowsourceCorePage , FlowsourceCoreAuthSettingsPage } from '@flowsource/plugin-flowsource-core';
import { FlowsourceAzurePipelinePage } from '@flowsource/plugin-flowsource-azure-pipeline';
import { FlowsourceResilienceHubPage } from '@flowsource/plugin-flowsource-resilience-hub';
import { FlowsourceAwsFaultInjectionPage } from '@flowsource/plugin-flowsource-aws-fault-injection';
import { FlowsourceCicdBitbucketPage} from '@flowsource/plugin-flowsource-cicd-bitbucket';
import { FlowsourceCicdAwsPage } from '@flowsource/plugin-flowsource-cicd-aws';
import { FlowsourceCloudabilityFrontendPage } from '@flowsource/plugin-flowsource-cloudability-frontend';
import { FlowsourceGithubCopilotPage } from '@flowsource/plugin-flowsource-github-copilot';




import { setTokenCookie } from './cookieAuth';
import { FlowsourceCicdGcpPage } from '@flowsource/plugin-flowsource-cicd-gcp';

import { ValidationFieldExtension } from './scaffolder/ValidateCustomField';
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';
import { FlowsourceTheme } from './components/theme/FlowsourceTheme';
import { UnifiedThemeProvider } from '@backstage/theme';
import { FlowsourceHome } from './components/catalog/customcatalog/FlowsourceHome';
import { FlowsourceDashboardPage } from '@flowsource/plugin-flowsource-dashboard';
import { FlowsourceResilience4JPage } from '@flowsource/plugin-flowsource-resilience4j';
import { FlowsourceServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
import { FlowsourceVeracodePage } from '@flowsource/plugin-flowsource-veracode';
import { FlowsourceDynatracePage } from '@flowsource/plugin-flowsource-dynatrace';
import { FlowsourceCctpPage , FlowsourceCctpSettingsPage } from '@flowsource/plugin-flowsource-cctp';
import { FlowsourceZephyrPage } from '@flowsource/plugin-flowsource-zephyr';

import { FlowsourceAppdynamicsPage } from '@flowsource/plugin-flowsource-appdynamics';
import { FlowsourceTestingPage } from '@flowsource/plugin-flowsource-testing';

import { FlowsourcePlaywrightPage } from '@flowsource/plugin-flowsource-playwright';
import { FlowsourceSeleniumPage } from '@flowsource/plugin-flowsource-selenium';
import { FlowsourceBlackduckPage } from '@flowsource/plugin-flowsource-blackduck';
import { FlowsourceFeatureflagPage } from '@flowsource/plugin-flowsource-featureflag';
import { FlowsourceAzureReleasePage } from '@flowsource/plugin-flowsource-azure-release';
import { FlowsourcePdlcPage } from  '@flowsource/plugin-flowsource-pdlc';
import { FlowsourcePromptLibraryMetricsPage } from '@flowsource/plugin-flowsource-prompt-library-metrics';
import { EnvironmentReservationPage } from '@flowsource/plugin-environment-reservation';

const microsoftAuthProvider: SignInProviderConfig = {
  id: 'microsoft-auth-provider',
  title: 'Microsoft Azure AD',
  message: 'Sign in using Microsoft Azure AD',
  apiRef: microsoftAuthApiRef,
};

const githubAuthProvider: SignInProviderConfig = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign in using GitHub',
  apiRef: githubAuthApiRef,
};

const cognitoAuthProvider: SignInProviderConfig = {
  id: 'cognito',
  title: 'AWS Cognito',
  message: 'Sign in using AWS Cognito',
  apiRef: awsCognitoOIDCAuthApiRef,
};

const keycloakAuthProvider: SignInProviderConfig = {
  id: 'keycloak',
  title: 'Keycloak',
  message: 'Sign in using Keycloak',
  apiRef: keycloakOIDCAuthApiRef,
};

type AuthProvider = "guest" | SignInProviderConfig;

const authProviders: AuthProvider[] = [
  microsoftAuthProvider,
  githubAuthProvider,
  cognitoAuthProvider,
  keycloakAuthProvider
]


const app = createApp({
  apis,
  themes: [
    {
      id: 'flowsource-theme',
      title: 'Flowsource Theme',
      variant: 'light',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={FlowsourceTheme} children={children} />
      ),
    },
  ],
  components: {
    SignInPage: props => {
      const discoveryApi = useApi(discoveryApiRef);
      const config = useApi(configApiRef);

      let signInAuthProvider;
      let signInAuthProviderConfig = config.getOptional('app.signInAuthProvider');
      if (typeof signInAuthProviderConfig === 'string' && signInAuthProviderConfig.trim() !== '') {
        signInAuthProvider = signInAuthProviderConfig.toString();
      }

      return (
        <>
          {signInAuthProvider === 'oauth2Proxy' && (
            <ProxiedSignInPage {...props} provider="oauth2Proxy" />
          )}
          {signInAuthProvider === 'awsalb' && (
            <ProxiedSignInPage {...props} provider="awsalb" />
          )}
          {signInAuthProvider === 'gcp-iap' && (
            <ProxiedSignInPage {...props} provider="gcp-iap" />
          )}
          {signInAuthProvider !== 'oauth2Proxy' && signInAuthProvider !== 'awsalb' && signInAuthProvider !== 'gcp-iap' && (
            <SignInPage
              {...props}
              providers={authProviders}
              title="Select a sign-in method"
              align="center"
              onSignInSuccess={async (identityApi: IdentityApi) => {
                setTokenCookie(
                  await discoveryApi.getBaseUrl('cookie'),
                  identityApi
                );
                props.onSignInSuccess(identityApi);
              }}
            />
          )}
        </>
      );
    },
    
  },
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    {/* <Route path="/catalog" element={<CatalogIndexPage />} /> */}
    <Route path="/catalog" element={<CatalogIndexPage />} >
      <FlowsourceHome />
    </Route>
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
        <Mermaid config={{ theme: 'forest', themeVariables: { lineColor: '#000000' } }} />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />}>
      <ScaffolderFieldExtensions>
        <ValidationFieldExtension />
      </ScaffolderFieldExtensions>
    </Route> 
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/tech-radar"
      element={<TechRadarPage width={1500} height={800} />}
    />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>{searchPage}</Route>
    <Route path="/settings" element={<UserSettingsPage />}>
      <SettingsLayout.Route path="/auth-settings" title="Authentication Settings">
         <FlowsourceCoreAuthSettingsPage />
      </SettingsLayout.Route>
     <SettingsLayout.Route path="/cctp-settings" title="CCTP SETTINGS">
        <FlowsourceCctpSettingsPage />
      </SettingsLayout.Route>
    </Route>;
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/well-architected-frontend" element={<FlowsourceWellArchitectedPage />} />
    <Route path="/devops-guru" element={<FlowsourceDevopsGuruPage />} />
    {/* <Route path="/jira-frontend" element={<JiraFrontendPage />} /> */}
    <Route path="/chatbot" element={<FlowsourceChatbotPage />} />
    <Route path="/flowsource-prismacloud" element={<FlowsourcePrismacloudPage />} />
    <Route path="/code-quality" element={<FlowsourceCodeQualityPage />} />
    <Route path="/azure-devops-workitems" element={<FlowsourceAzureDevopsWorkitemsPage />} />
    <Route path="/flowsource-github" element={<FlowsourceGithubPage />} />
    <Route path="/flowsource-bitbucket" element={<FlowsourceBitbucketPage />} />
    <Route path="/flowsource-checkmarx" element={<FlowsourceCheckmarxPage />} />
    <Route path="/flowsource-jira" element={<FlowsourceJiraPage />} />
    <Route path="/cicd-custom-frontend" element={<FlowsourceCicdCustomFrontendPage />} />
    <Route path="/flowsource-dora-metrics" element={<FlowsourceDoraMetricsPage />} />
    <Route path="/flowsource-azure-repo" element={<FlowsourceAzureRepoPage />} />
    <Route path="/flowsource-infra-provision" element={<FlowsourceInfraProvisionPage />} />
    <Route path="/flowsource-cicd-jenkins" element={<FlowsourceCicdJenkinsPage />} />
    <Route path="/flowsource-core" element={<FlowsourceCorePage />} />
    <Route path="/flowsource-azure-pipeline" element={<FlowsourceAzurePipelinePage />} />
    <Route path="/flowsource-resilience-hub" element={<FlowsourceResilienceHubPage />} />
    <Route path="/flowsource-aws-fault-injection" element={<FlowsourceAwsFaultInjectionPage />} />
    <Route path="/flowsource-cicd-bitbucket" element={<FlowsourceCicdBitbucketPage/>} />
    <Route path="/flowsource-cicd-aws" element={<FlowsourceCicdAwsPage />} />
    <Route path="/flowsource-cicd-gcp" element={<FlowsourceCicdGcpPage />} />
    <Route path="/flowsource-cloudability" element={<FlowsourceCloudabilityFrontendPage />} />
    <Route path="/flowsource-github-copilot" element={<FlowsourceGithubCopilotPage />} />
    <Route path="/flowsource-dashboard" element={<FlowsourceDashboardPage />} />
    <Route path="/flowsource-pdlc" element={<FlowsourcePdlcPage />} />
    <Route path="/flowsource-prompt-library-metrics" element={<FlowsourcePromptLibraryMetricsPage />} />
    <Route path="/flowsource-resilience4j" element={<FlowsourceResilience4JPage />} />
    <Route path="/flowsource-service-now" element={<FlowsourceServiceNowPage />} />
    <Route path="/flowsource-veracode" element={<FlowsourceVeracodePage />} />
    <Route path="/flowsource-dynatrace" element={<FlowsourceDynatracePage />} />
    <Route path="/flowsource-cctp" element={<FlowsourceCctpPage />} />
    <Route path="/flowsource-appdynamics" element={<FlowsourceAppdynamicsPage />} />
    <Route path="/flowsource-testing" element={<FlowsourceTestingPage />}>
      <FlowsourcePlaywrightPage />
      <FlowsourceSeleniumPage />
      <FlowsourceZephyrPage />
    </Route>
    <Route path="/flowsource-blackduck" element={<FlowsourceBlackduckPage />} />
    <Route path="/flowsource-featureflag" element={<FlowsourceFeatureflagPage />} />
    <Route path="/flowsource-environment-reservation" element={<EnvironmentReservationPage />} />
<Route path="/flowsource-azure-release" element={<FlowsourceAzureReleasePage />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AutoLogout />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);