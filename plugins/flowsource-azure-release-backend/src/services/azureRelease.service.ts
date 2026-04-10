import { LoggerService } from '@backstage/backend-plugin-api';
import { apiRequest } from "./apiRequest";

class AzureDevopsService {
  accessToken: any;
  expiryTimeinMilliseconds: any;
  AZURE_ACCESS_TOKEN: string;
  BASE_URL: string;
  logger: LoggerService;

  constructor(
    baseUrl: string,
    token: string,
    orgName: string,
    azureProject: string,
    logger: LoggerService,
  ) {
    this.logger = logger;
    this.logger.info("AzureDevopsService constructor called");
    const projectURL = `${baseUrl}/${orgName}/${azureProject}`
    this.BASE_URL = projectURL;
    this.AZURE_ACCESS_TOKEN = token;
  }

  async fetchPipelineDetails(name: string) {
    try {
      let pipelineName = name;
      const headers :any = {
        Authorization: `Bearer ${this.AZURE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      };

      this.logger.info("Fetching Azure Pipeline");
      const azurepipelines = await this.fetchPipelineDefinitions(headers);

      const pipeline = Array.isArray(azurepipelines)
        ? azurepipelines.find(
            (pipeline) => pipeline.pipelineName === pipelineName
          )
        : undefined;

      let pipelineReleasesResponse: any = [];
      if (pipeline) {
        pipelineReleasesResponse = await this.fetchPipelineReleases(
          pipeline.pipelineId,
          this.AZURE_ACCESS_TOKEN
        );
        this.logger.info("Pipeline Releases: ", pipelineReleasesResponse);
      } else {
        this.logger.warn(`No pipeline found with name "${pipelineName}"`);
      }

      let pipelineReleaseDetails: any = [];
      for (let release of pipelineReleasesResponse.pipelineReleases) {
        let pipelineReleaseObj : any = {};
        const releaseDetails = await this.fetchReleaseDefinitions(
          release.releaseId
        );
        pipelineReleaseObj["releaseId"] = releaseDetails.id;
        pipelineReleaseObj["releaseName"] = releaseDetails.name;
        pipelineReleaseObj["releaseCreatedOn"] = releaseDetails.createdOn;
        pipelineReleaseObj["releaseStatus"] = releaseDetails.status;
        let releaseEnvDetails: any = [];
        releaseDetails.environments.forEach((env: any) => {
          let releaseEnvObj : any = {};
          releaseEnvObj["stageId"] = env.id;
          releaseEnvObj["stageName"] = env.name;
          releaseEnvObj["stageStatus"] = env.status || "unknown";
          releaseEnvDetails.push(releaseEnvObj);
        });
        pipelineReleaseObj["releaseStages"] = releaseEnvDetails;
        if (
          releaseDetails.artifacts !== undefined &&
          releaseDetails.artifacts.length > 0
        ) {
          pipelineReleaseObj["branchName"] =
            releaseDetails.artifacts[0].definitionReference.branches.name;
          pipelineReleaseObj["buildNumber"] =
            releaseDetails.artifacts[0].definitionReference.version.name;
        }
        pipelineReleaseDetails.push(pipelineReleaseObj);
      }

      this.logger.info("Azure Pipeline Release details: ", pipelineReleaseDetails);
      return pipelineReleaseDetails;
    } catch (error) {
        this.logger.error('Error in getProjectOverview:'+ error);
      throw error;
    }
  }

  async fetchPipelineDefinitions(headers: any) {
    try {
      this.logger.info("Start: Fetching Azure pipeline definitions");
      const PIPELINE_URL = `${this.BASE_URL}/_apis/release/definitions?api-version=7.1`;
      const response = await apiRequest(this.logger,"GET", PIPELINE_URL, headers);
      if (!response.ok)
        return this.logger.error(`Error: Fetching Azure pipeline definitions`);

      const data = await response.json();
      this.logger.info(data)
      if (!data.value?.length)
        return this.logger.info("No pipeline definitions found.");

      const pipelines = await Promise.all(
        data.value.map(async (item: any) => {
          return {
            pipelineId: item.id,
            pipelineName: item.name,
          };
        })
      );
      return pipelines;
    } catch (error) {
      this.logger.error("Error in fetchPipelinedefinitions:"+error);
      throw error;
    }
  }

  async fetchPipelineReleases(id: number, token: string) {
    try {
      let continuationToken: string | undefined = token;
      const headers :any = {
        Authorization: `Bearer ${this.AZURE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      };

      let RELEASE_URL: string = "";
      if (continuationToken) {
        RELEASE_URL = `${this.BASE_URL}/_apis/release/releases?definitionId=${id}&$top=50&continuationToken=${continuationToken}&api-version=7.1`;
      } else {
        RELEASE_URL = `${this.BASE_URL}/_apis/release/releases?definitionId=${id}&$top=50&api-version=7.1`;
      }

      const response = await apiRequest(this.logger, "GET", RELEASE_URL, headers);

      // Capture continuationToken from response headers
      continuationToken = response.headers.get("x-ms-continuationtoken");

      if (!response.ok)
        return this.logger.error(`Error: Fetching Azure release definitions`);

      const data = await response.json();

      if (!data.value?.length)
        return this.logger.info(`No pipeline release definitions found.`);
      let pipelineReleasesData: any = {};
      let responseData = data.value.map((item: any) => ({
        releaseId: item.id,
        continuationToken: continuationToken
      }));
      pipelineReleasesData['pipelineReleases']=responseData;
      pipelineReleasesData['continuationToken'] = continuationToken;

      return pipelineReleasesData;

    } catch (error) {
      this.logger.error("Error in fetchPipelineReleases:"+ error);
      throw error;
    }
  }

  async fetchReleaseDefinitions(id: number) {
    try {
      const headers = {
        Authorization: `Bearer ${this.AZURE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      };
      const RELEASE_URL = `${this.BASE_URL}/_apis/release/releases/${id}?api-version=7.1`;
      const response = await apiRequest(this.logger,"GET", RELEASE_URL, headers);

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error("Error in fetchPipelineReleasedefinitions:"+ error);
      throw error;
    }
  }

  async fetchReleaseStagesDefinitions(id: number) {
    try {
      const releaseDetails = await this.fetchReleaseDefinitions(id);
      let releaseFailStagesDetails: any = [];
      if (
        releaseDetails.environments !== undefined &&
        releaseDetails.environments.length > 0
      ) {
        releaseDetails.environments.forEach((env: any) => {
          let releaseStagesObj: any = {};
          releaseStagesObj["releaseId"] = releaseDetails.id;
          releaseStagesObj["releaseName"] = releaseDetails.name;
          releaseStagesObj["stageId"] = env.id;
          releaseStagesObj["stageName"] = env.name;
          if (env.status === "notStarted") {
            releaseStagesObj["deployStatus"] = env.status;
            releaseStagesObj[
              "taskError"
            ] = `${env.name} deployment is yet to begin.`;
          }
          
          if (env.status === "succeeded") {
            releaseStagesObj["deployStatus"] = env.status;
            releaseStagesObj[
              "taskError"
            ] = `${env.name} deployment completed successfully.`;
          }
          if (env.status !== "succeeded") {
            if (env.preDeployApprovals && env.preDeployApprovals.length > 0) {
              env.preDeployApprovals.forEach((predeploy: any) => {
                if (predeploy.status.toLowerCase() !== "approved") {
                  releaseStagesObj["preDeployStatus"] = predeploy.status;
                  releaseStagesObj["preDeployApprover"] =
                    predeploy.approver.displayName;
                  releaseStagesObj[
                    "taskError"
                  ] = `${env.name} pre-deployment approval is ${predeploy.status}.`;
                }
              });
            }
            if (env.postDeployApprovals && env.postDeployApprovals.length > 0) {
              env.postDeployApprovals.forEach((postdeploy: any) => {
                if (postdeploy.status.toLowerCase() !== "approved") {
                  releaseStagesObj["postDeployStatus"] = postdeploy.status;
                  releaseStagesObj["postDeployApprover"] =
                    postdeploy.approver.displayName;
                  releaseStagesObj[
                    "taskError"
                  ] = `${env.name} post-deployment approval is ${postdeploy.status}.`;
                }
              });
            }
            if (env.deploySteps && env.deploySteps.length > 0) {
              env.deploySteps.forEach((step: any) => {
                releaseStagesObj["deployStatus"] = step.status;
                if (step.operationStatus.toLowerCase() === "cancelled") {
                  releaseStagesObj["deployStatus"] = env.status;
                  releaseStagesObj[
                    "taskError"
                  ] = `${env.name} deployment is cancelled.`;
                }
                if (
                  step.status.toLowerCase() !== "succeeded" &&
                  step.releaseDeployPhases.length > 0
                ) {
                  step.releaseDeployPhases.forEach((phase: any) => {
                    if (
                      phase.status.toLowerCase() !== "succeeded" &&
                      phase.deploymentJobs.length > 0
                    ) {
                      phase.deploymentJobs.forEach((jobs: any) => {
                        if (jobs.tasks && jobs.tasks.length > 0) {
                          jobs.tasks.forEach((task: any) => {
                            if (
                              (task.status.toLowerCase() !== "succeeded" ||
                                task.status.toLowerCase() !== "success") &&
                              task.issues.length > 0
                            ) {
                              task.issues.forEach((issue: any) => {
                                if (issue.issueType.toLowerCase() === "error")
                                  releaseStagesObj[
                                    "taskError"
                                  ] = `${env.name} has an error- ${issue.message}.`;
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          }
          if (env.status === 'inProgress') {
            releaseStagesObj['deployStatus'] = 'InProgress';
            releaseStagesObj[
              'taskError'
            ] = `${env.name} deployment approval is still pending.`;
          }
          releaseFailStagesDetails.push(releaseStagesObj);
        });
      }
      return releaseFailStagesDetails;
    } catch (error) {
      this.logger.error("Error in fetchPipelineReleasedefinitions:"+ error);
      throw error;
    }
  }
}
export default AzureDevopsService;
