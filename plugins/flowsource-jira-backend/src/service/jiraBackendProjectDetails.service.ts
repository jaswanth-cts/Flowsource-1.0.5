import { JiraBackendCommonService } from './jiraBackendCommon.service';
import { LoggerService } from '@backstage/backend-plugin-api';

type StoryInfo = {
  key: string;
  story: string;
  status: string;
  points: string;
  priority: string;
  type: string;
  sprint: string;
};

export class JiraBackendProjectDetailsService {
  objOptions = {
    jiraUserEmail: '',
    jiraAccessKey: '',
    jiraBaseUrl: '',
  };
  jiraBackendCommonService: any;
  logger: LoggerService;

  constructor(
    jiraUserEmail: string,
    jiraAccessKey: string,
    jiraBaseUrl: string,
    logger: LoggerService,
  ) {
    this.objOptions.jiraUserEmail = jiraUserEmail;
    this.objOptions.jiraAccessKey =
      'Basic ' + btoa(jiraUserEmail + ':' + jiraAccessKey);
    this.objOptions.jiraBaseUrl = jiraBaseUrl;
    this.jiraBackendCommonService = new JiraBackendCommonService(
      this.objOptions.jiraUserEmail,
      this.objOptions.jiraAccessKey,
      this.objOptions.jiraBaseUrl,
      logger,
    );
    this.logger = logger;
  }

  async getProjectNameFromApi(projectKey: string): Promise<any> {
    try 
    {
      return await this.jiraBackendCommonService.getProjectNameFromApi(projectKey);
    } catch(error) {
      this.logger.error('Error in getProjectNameFromApi - ', error as Error);
      throw error;
    }
  };

  async getStoryDetails(
    projectName: string,
    pageToken: string,
    pageSizeParam: string,
    durationDaysCatalog: number,
    durationConfig: number,
    jiraStoryPointsFieldCatalog: string,
    jiraStoryPointsFieldConfig: string,
    status: string,
    jiraFilterFieldKey: string,
    jiraFilterFieldValue: string,
    filterId: string,
    currentSprintDetails: string,
    assigneeToMe: string,
  ): Promise<any> {
    try {
      const durationInDays = durationDaysCatalog || durationConfig;
      const nextPageToken = pageToken;
      const pageSize = +pageSizeParam;
      //const startAt = (pageNumber - 1) * pageSize;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDateTime = new Date(Date.now() - durationInMilliseconds);
      const durationDate = durationDateTime.toISOString().split('T')[0];
      const storyPointsFieldName =
        jiraStoryPointsFieldCatalog || jiraStoryPointsFieldConfig;

      const storyInfoCombined =
        await this.jiraBackendCommonService.getStoryInfo(
          projectName,
          nextPageToken,
          durationDate,
          pageSize,
          storyPointsFieldName,
          status,
          jiraFilterFieldKey,
          jiraFilterFieldValue,
          filterId,
          currentSprintDetails,
          assigneeToMe,
        );
      const response: {
        jiraStoryInfo: StoryInfo[];
        storyLink: string;
        storyLength: number;
        jqlQuery: string;
        projectName: string;
        filterName: string;
        nextPageToken: string;
      } = {
        storyLength: storyInfoCombined.storyCount,
        jiraStoryInfo: storyInfoCombined.storyDetails,
        storyLink: this.objOptions.jiraBaseUrl.split('/rest')[0] + '/browse/',
        jqlQuery: storyInfoCombined.jqlQuery,
        projectName: storyInfoCombined.projectName,
        filterName: storyInfoCombined.filterName,
        nextPageToken: storyInfoCombined.nextPageToken,
      };
      return response;
    } catch (error) {
      this.logger.error('Error in getprojectDetails - ', error as Error);
      throw error;
    }
  }
}
