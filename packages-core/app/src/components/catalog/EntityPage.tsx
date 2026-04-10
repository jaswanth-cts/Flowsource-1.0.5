import React from 'react';
import { Grid } from '@material-ui/core';
import {
  EntityApiDefinitionCard,
  EntityConsumedApisCard,
  EntityConsumingComponentsCard,
  EntityHasApisCard,
  EntityProvidedApisCard,
  EntityProvidingComponentsCard,
} from '@backstage/plugin-api-docs';
import {
  EntityAboutCard,
  EntityDependsOnComponentsCard,
  EntityDependsOnResourcesCard,
  EntityHasComponentsCard,
  EntityHasResourcesCard,
  EntityHasSubcomponentsCard,
  EntityHasSystemsCard,
  EntityLayout,
  EntityLinksCard,
  EntitySwitch,
  EntityOrphanWarning,
  EntityProcessingErrorsPanel,
  isComponentType,
  isKind,
  hasCatalogProcessingErrors,
  isOrphan,
  hasRelationWarnings,
  EntityRelationWarning,
} from '@backstage/plugin-catalog';
import {
  EntityUserProfileCard,
  EntityGroupProfileCard,
  EntityMembersListCard,
  EntityOwnershipCard,
} from '@backstage/plugin-org';
import { EntityTechdocsContent } from '@backstage/plugin-techdocs';
import { EmptyState } from '@backstage/core-components';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import {
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CONSUMES_API,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
  RELATION_PART_OF,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';

import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { WellArchitectedComponent } from '@flowsource/plugin-flowsource-well-architected/src/components/WellArchitectedComponent';
import { ChatbotComponent } from '@flowsource/plugin-flowsource-chatbot/src/components/ChatbotComponent/ChatbotComponent';
import { FlowsourceCodeQualityPage } from '@flowsource/plugin-flowsource-code-quality';
import { Mermaid } from 'backstage-plugin-techdocs-addon-mermaid';

import {FlowsourceCicdCustomFrontendPage} from '@flowsource/plugin-flowsource-cicd-github-frontend';
import { FlowsourceAzureDevopsWorkitemsPage } from '@flowsource/plugin-flowsource-azure-devops-workitems';
import { FlowsourceJiraPage } from '@flowsource/plugin-flowsource-jira';
import { FlowsourceGithubPage } from '@flowsource/plugin-flowsource-github';
import { FlowsourceBitbucketPage } from '@flowsource/plugin-flowsource-bitbucket';
import { DoraMetricsComponent } from '@flowsource/plugin-flowsource-dora-metrics/src/components/DoraMetricsComponent';
import { AzureRepoComponent } from '@flowsource/plugin-flowsource-azure-repo/src/components/AzureRepoComponent';
import { FlowsourceCicdJenkinsPage } from '@flowsource/plugin-flowsource-cicd-jenkins';
import{ CicdAzurePipelineComponent } from '@flowsource/plugin-flowsource-azure-pipeline/src/components/CicdAzurePipelineComponent';
import{FlowsourceCicdBitbucketPage } from '@flowsource/plugin-flowsource-cicd-bitbucket';
import { FlowsourceCicdAwsPage } from '@flowsource/plugin-flowsource-cicd-aws';
import { FlowsourceCicdGcpPage } from '@flowsource/plugin-flowsource-cicd-gcp'
import { FlowsourceCloudabilityFrontendPage } from '@flowsource/plugin-flowsource-cloudability-frontend';
import { EntityKubernetesContent } from '@backstage/plugin-kubernetes';
import { FlowsourceServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
import { CCTPComponent } from '@flowsource/plugin-flowsource-cctp/src/components/CCTPComponent';
import { FlowsourceTestingPage } from '@flowsource/plugin-flowsource-testing';
import { FlowsourceFeatureflagPage } from "@flowsource/plugin-flowsource-featureflag";
import { FlowsourceAzureReleasePage } from '@flowsource/plugin-flowsource-azure-release';
import { EnvironmentServiceNowPage } from '@flowsource/plugin-flowsource-service-now';
import { EnvironmentReservationPage } from '@flowsource/plugin-environment-reservation';
import { useEntity } from '@backstage/plugin-catalog-react';
const techdocsContent = (

  <Grid container>
    <Grid item>
      <EntityTechdocsContent>
        <TechDocsAddons>
          <ReportIssue />
          <Mermaid config={{ theme: 'forest', themeVariables: { lineColor: '#000000' } }} />
        </TechDocsAddons>
      </EntityTechdocsContent>
    </Grid>
    <Grid item>
      <Grid container justifyContent="flex-end">
        <Grid item style={{ position: 'fixed', bottom: '0px', right: '0px' }}>
          <ChatbotComponent />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid item xs={12}>
          <EntityOrphanWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <Grid item xs={12}>
          <EntityRelationWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid item xs={12}>
          <EntityProcessingErrorsPanel />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={6} xs={12}>
      <EntityCatalogGraphCard variant="gridItem" height={400} />
    </Grid>
    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);



const CODE_QUALITY_ANNOTATION = 'flowsource/sonarqube-project-key';

const isCodeQualityAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CODE_QUALITY_ANNOTATION]);

const codeQualityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isCodeQualityAnnotationAvailable(entity)}>
      <FlowsourceCodeQualityPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      <EmptyState
        title="No Code Quality page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to see Code Quality page."
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const AZURE_REPO = 'flowsource/azure-repo-name';
const AZURE_PROJECT_NAME = 'flowsource/azure-project-name';
const GITHUB_REPO_OWNER = 'flowsource/github-repo-owner';
const GITHUB_REPO_NAME = 'flowsource/github-repo-name';
const BITBUCKET_REPO_NAME = 'flowsource/bitbucket-repo-name';
const BITBUCKET_REPO_OWNER = 'flowsource/bitbucket-repo-owner';

const isAzureRepoAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[AZURE_REPO]);
const isAzureProjectNameAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[AZURE_PROJECT_NAME]);
const isGithubRepoOwnerAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[GITHUB_REPO_OWNER]);
const isGithubRepoNameAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[GITHUB_REPO_NAME]);
const isShowBitbucketRepoPage = (entity: any) => Boolean(entity.metadata.annotations?.[BITBUCKET_REPO_NAME] && entity.metadata.annotations?.[BITBUCKET_REPO_OWNER]);
const repoPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isAzureRepoAvailable(entity) && isAzureProjectNameAvailable(entity)}>
      <AzureRepoComponent />
    </EntitySwitch.Case>
    <EntitySwitch.Case if={(entity, _) => isGithubRepoOwnerAvailable(entity) && isGithubRepoNameAvailable(entity)}>
      <FlowsourceGithubPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case if={(entity, _) => isShowBitbucketRepoPage(entity)}>
      <FlowsourceBitbucketPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      <EmptyState
        title="No Repo page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable Repo for it."
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const CICD_GITHUB_ANNOTATION = "flowsource/github-workflows";
const CICD_JENKINS_ANNOTATION = "flowsource/jenkins-pipelines";
const CICD_AZURE_ANNOTATION = "flowsource/azure-pipelines";
const CICD_AZURE_RELEASE_ANNOTATION = "flowsource/azure-release-pipeline";
const CICD_GCP_PIPELINE_ANNOTATION = 'flowsource/gcp-pipelines';
const CICD_GCP_REGION_ANNOTATION = 'flowsource/gcp-region';
const CICD_BITBUCKT_ANNOTATION = "flowsource/bitbucket-pipelines";
const CICD_AWS_PIPELINE_ANNOTATION = 'flowsource/aws-pipelines';

const isCicdJenkinsAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CICD_JENKINS_ANNOTATION]);
const isCicdGithubAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CICD_GITHUB_ANNOTATION]);
const isCicdAzureAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CICD_AZURE_ANNOTATION]);
const isCicdAzureReleaseAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CICD_AZURE_RELEASE_ANNOTATION]);
const isCicdGcpAnnotationAvailable = (entity: any) => Boolean(
  entity.metadata.annotations?.[CICD_GCP_PIPELINE_ANNOTATION] &&
  entity.metadata.annotations?.[CICD_GCP_REGION_ANNOTATION],
);

const isBitbucketCicdAnnotationAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[CICD_BITBUCKT_ANNOTATION]);
const isCicdAwsAnnotationAvailable = (entity: any) =>
  Boolean(
    entity.metadata.annotations?.[CICD_AWS_PIPELINE_ANNOTATION]
  );


  const CicdContent: React.FC = () => {
    const { entity } = useEntity();
  
    const showJenkins = isCicdJenkinsAnnotationAvailable(entity);
    const showGithub = isCicdGithubAnnotationAvailable(entity);
    const showAzure = isCicdAzureAnnotationAvailable(entity);
    const showAzureRelease = isCicdAzureReleaseAnnotationAvailable(entity);
    const showGcp = isCicdGcpAnnotationAvailable(entity);
    const showBitbucket = isBitbucketCicdAnnotationAvailable(entity);
    const showAws = isCicdAwsAnnotationAvailable(entity);
    const anyShown =
      showJenkins || showGithub || showAzure || showAzureRelease || showGcp || showBitbucket || showAws;
  
    return (
      <Grid container spacing={3}>
        {showJenkins && (
          <Grid item xs={12}>
            <FlowsourceCicdJenkinsPage />
          </Grid>
        )}
        {showGithub && (
          <Grid item xs={12}>
            <FlowsourceCicdCustomFrontendPage />
          </Grid>
        )}
        {showAzure && (
          <Grid item xs={12}>
            <CicdAzurePipelineComponent />
          </Grid>
        )}
        {showAzureRelease && (
          <Grid item xs={12}>
            <FlowsourceAzureReleasePage />
          </Grid>
        )}
        {showGcp && (
          <Grid item xs={12}>
            <FlowsourceCicdGcpPage />
          </Grid>
        )}
        {showBitbucket && (
          <Grid item xs={12}>
            <FlowsourceCicdBitbucketPage />
          </Grid>
        )}
        {showAws && (
          <Grid item xs={12}>
            <FlowsourceCicdAwsPage />
          </Grid>
        )}
        {!anyShown && (
          <Grid item xs={12}>
            <EmptyState
              title="No CI/CD page is available for this entity"
              missing="info"
              description="You need to add an annotation to your component if you want to enable GitHub actions, Jenkins, Azure Pipelines, or Azure Release Pipelines for it."
            />
          </Grid>
        )}
      </Grid>
    );
  };
  
const STORIES_AZURE_DEVOPS = "flowsource/azure-devops-project-key";
const STORIES_JIRA = "flowsource/jira-project-key";

const isAzureBoardsAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[STORIES_AZURE_DEVOPS])
  && Boolean(entity.metadata.annotations?.[STORIES_AZURE_DEVOPS].trim().length > 0);
const isJiraAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[STORIES_JIRA])
  && Boolean(entity.metadata.annotations?.[STORIES_JIRA].trim().length > 0);

const storiesContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isAzureBoardsAvailable(entity)}>
      <FlowsourceAzureDevopsWorkitemsPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case if={(entity, _) => isJiraAvailable(entity)}>
      <FlowsourceJiraPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      <EmptyState
        title="No Stories page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable Azure Devops or Jira for it."
      />
    </EntitySwitch.Case>
  </EntitySwitch>

);

const FEATURE_FLAG_PROJECT_NAME = "flowsource/featureflag-project-name";
const FEATURE_FLAG_APP_NAME = "flowsource/featureflag-app-name";

const isFeatureFlagAvailable = (entity: any) => Boolean(entity.metadata.annotations?.[FEATURE_FLAG_PROJECT_NAME] &&
  entity.metadata.annotations?.[FEATURE_FLAG_APP_NAME],);

const featureFlagContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={(entity, _) => isFeatureFlagAvailable(entity)}>
      <FlowsourceFeatureflagPage />
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      <EmptyState
        title="No Feature Flag page is available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable Feature Flag for it."
      />
    </EntitySwitch.Case>
  </EntitySwitch>

);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/stories" title="Stories">
      {storiesContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/code-repository" title="Code repository">
      <>
        <Grid container style={{marginBottom:'-11rem'}}>
          <Grid item md={12} alignItems="stretch">
              {repoPage}
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      <>
        <Grid container>
          <Grid item alignItems="stretch" md={12}>
            <CicdContent />
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>

    <EntityLayout.Route path="/sonarqube" title="Code quality">
      {codeQualityPage}
    </EntityLayout.Route>

    <EntityLayout.Route path="/testing" title="Testing">
      <FlowsourceTestingPage flowsourceComponentType="serviceEntityPage" />
    </EntityLayout.Route>

    <EntityLayout.Route path="/testing-cctp" title="Continuous Testing">
      <CCTPComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityProvidedApisCard />
        </Grid>
        <Grid item md={6}>
          <EntityConsumedApisCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/well-architected-frontend" title="Well Architected">
      <WellArchitectedComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/flowsource-service-now" title="ITSM">
      <FlowsourceServiceNowPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/dora-metrics" title="DORA metrics">
      <DoraMetricsComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/finops" title="FinOps">
      <FlowsourceCloudabilityFrontendPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/kubernetes" title="Kubernetes">
      <EntityKubernetesContent refreshIntervalMs={30000} />
    </EntityLayout.Route>

    <EntityLayout.Route path="/feature-flags" title="Feature Flags">
      {featureFlagContent}
    </EntityLayout.Route>

  </EntityLayout>
);

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/stories" title="Stories">
      {storiesContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/pull-requests" title="Code repository">
      {repoPage}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      <CicdContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/sonarqube" title="Code quality">
      <FlowsourceCodeQualityPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/testing" title="Testing">
      <FlowsourceTestingPage flowsourceComponentType="websiteEntityPage" />
    </EntityLayout.Route>

    <EntityLayout.Route path="/testing-cctp" title="Continuous Testing">
      <CCTPComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/well-architected-frontend" title="Well Architected">
      <WellArchitectedComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/flowsource-service-now" title="ITSM">
      <FlowsourceServiceNowPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/dora-metrics" title="DORA metrics">
      <DoraMetricsComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/finops" title="FinOps">
      <FlowsourceCloudabilityFrontendPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/kubernetes" title="Kubernetes">
      <EntityKubernetesContent refreshIntervalMs={30000} />
    </EntityLayout.Route>

    <EntityLayout.Route path="/feature-flags" title="Feature Flags">
      <FlowsourceFeatureflagPage />
    </EntityLayout.Route>

  </EntityLayout>
);

/**
 * NOTE: This page is designed to work on small screens such as mobile devices.
 * This is based on Material UI Grid. If breakpoints are used, each grid item must set the `xs` prop to a column size or to `true`,
 * since this does not default. If no breakpoints are used, the items will equitably share the available space.
 * https://material-ui.com/components/grid/#basic-grid.
 */

const defaultEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>
    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);


const infrastructureEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/stories" title="Stories">
    {storiesContent}
    </EntityLayout.Route>
    <EntityLayout.Route path="/code-repository" title="Code repository">
      <>
        <Grid container style={{marginBottom:'-11rem'}}>
          <Grid item md={12} alignItems="stretch">
              {repoPage}
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      <>
        <Grid container>
          <Grid item alignItems="stretch" md={12}>
            <CicdContent />
          </Grid>
        </Grid>

      </>
    </EntityLayout.Route>
    <EntityLayout.Route path="/docs" title="Docs">
    {techdocsContent}
    </EntityLayout.Route>  
    <EntityLayout.Route path="/well-architected-frontend" title="Well Architected">
      <WellArchitectedComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/flowsource-service-now" title="ITSM">
      <FlowsourceServiceNowPage />
    </EntityLayout.Route>
      <EntityLayout.Route path="/finops" title="FinOps">
      <FlowsourceCloudabilityFrontendPage />
    </EntityLayout.Route>
    <EntityLayout.Route path="/kubernetes" title="Kubernetes">
      <EntityKubernetesContent refreshIntervalMs={30000} />
    </EntityLayout.Route>

  </EntityLayout>
);
const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isComponentType('service')}>
      {serviceEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case if={isComponentType('website')}>
      {websiteEntityPage}
    </EntitySwitch.Case>
    <EntitySwitch.Case if={isComponentType('infrastructure')}>
      {infrastructureEntityPage}
    </EntitySwitch.Case>
    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);

const apiPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard />
        </Grid>
        <Grid item md={6} xs={12}>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </Grid>
        <Grid item md={4} xs={12}>
          <EntityLinksCard />
        </Grid>
        <Grid container item md={12}>
          <Grid item md={6}>
            <EntityProvidingComponentsCard />
          </Grid>
          <Grid item md={6}>
            <EntityConsumingComponentsCard />
          </Grid>
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/definition" title="Definition">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EntityApiDefinitionCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityUserProfileCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityGroupProfileCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard variant="gridItem" />
        </Grid>
        <Grid item xs={12}>
          <EntityMembersListCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid item md={6} xs={12}>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </Grid>
        <Grid item md={4} xs={12}>
          <EntityLinksCard />
        </Grid>
        <Grid item md={8}>
          <EntityHasComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityHasApisCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityHasResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/diagram" title="Diagram">
      <EntityCatalogGraphCard
        variant="gridItem"
        direction={Direction.TOP_BOTTOM}
        title="System Diagram"
        height={700}
        relations={[
          RELATION_PART_OF,
          RELATION_HAS_PART,
          RELATION_API_CONSUMED_BY,
          RELATION_API_PROVIDED_BY,
          RELATION_CONSUMES_API,
          RELATION_PROVIDES_API,
          RELATION_DEPENDENCY_OF,
          RELATION_DEPENDS_ON,
        ]}
        unidirectional={false}
      />
    </EntityLayout.Route>
  </EntityLayout>
);


const environmentEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/stories" title="Tasks">
     <EnvironmentServiceNowPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/code-repository" title="Code repository">
      <>
        <Grid container style={{marginBottom:'-11rem'}}>
          <Grid item md={12} alignItems="stretch">
              {repoPage}
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      <>
         <Grid container>
          <Grid item alignItems="stretch" md={12}>
            <CicdContent />
          </Grid>
        </Grid>
      </>
    </EntityLayout.Route>

    <EntityLayout.Route path="/flowsource-environment-reservation" title="Reservation">
      <EnvironmentReservationPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/sonarqube" title="Code quality">
      {codeQualityPage}
    </EntityLayout.Route>

    <EntityLayout.Route path="/testing" title="Testing">
        <FlowsourceTestingPage flowsourceComponentType="environmentEntityPage" />
    </EntityLayout.Route>

    <EntityLayout.Route path="/testing-cctp" title="Continuous Testing">
        <CCTPComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/well-architected-frontend" title="Well Architected">
      <WellArchitectedComponent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/flowsource-service-now" title="ITSM">
      <FlowsourceServiceNowPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/finops" title="FinOps">
      <FlowsourceCloudabilityFrontendPage/>
    </EntityLayout.Route>

    <EntityLayout.Route path="/kubernetes" title="Kubernetes">
      <EntityKubernetesContent refreshIntervalMs={30000} />
    </EntityLayout.Route>

    <EntityLayout.Route path="/feature-flags" title="Feature Flags">
      {featureFlagContent}
    </EntityLayout.Route>
  </EntityLayout>
);

const domainPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid item md={6} xs={12}>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </Grid>
        <Grid item md={6}>
          <EntityHasSystemsCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);


export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage} />
    <EntitySwitch.Case if={isKind('api')} children={apiPage} />
    <EntitySwitch.Case if={isKind('group')} children={groupPage} />
    <EntitySwitch.Case if={isKind('user')} children={userPage} />
    <EntitySwitch.Case if={isKind('system')} children={systemPage} />
    <EntitySwitch.Case if={isKind('domain')} children={domainPage} />
    <EntitySwitch.Case if={isKind('Environment')} children={environmentEntityPage} />

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);