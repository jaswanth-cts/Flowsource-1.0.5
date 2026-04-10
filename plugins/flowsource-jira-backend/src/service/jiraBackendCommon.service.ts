import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class JiraBackendCommonService {
  objOptions = {
    jiraUserEmail: '',
    jiraAccessKey: '',
    jiraBaseUrl: '',
  };
  private headers: any;
  logger: LoggerService;
  constructor(
    jiraUserEmail: string,
    jiraAccessKey: string,
    jiraBaseUrl: string,
    logger: LoggerService,
  ) {
    this.objOptions.jiraUserEmail = jiraUserEmail;
    this.objOptions.jiraAccessKey = jiraAccessKey;
    this.objOptions.jiraBaseUrl = jiraBaseUrl;
    this.headers = {
      Authorization: this.objOptions.jiraAccessKey,
    };
    this.logger = logger;
  }

  async getProjectNameFromApi(porjectKey: string): Promise<string> {
    try
    {
      const res = await apiRequest(
        'GET',
        `${this.objOptions.jiraBaseUrl}project/${porjectKey}`,
        this.headers,
        this.logger,
      );

      if (!res.ok) {
        const errorText = await res.text();
        const error = new Error( errorText );
        (error as any).status = res.status; // Attach status code to error object
        (error as any).response = res; // Attach response object to error object
        throw error;
      }

      const data = await res.text();
      const jsonData = JSON.parse(data);

      const response = "{\"projectName\": \"" + jsonData.name + "\"}";

      return response;
    } catch (error: any) {
      if (error.response) {
        this.logger.info(
          'Server responded with status code:',
          error.response.status,
        );
      } else if (error.request) {
        this.logger.info(
          'No response received:',
          error.request,
        );
      } else {
        this.logger.info(
          'Error creating request:',
          error.message,
        );
      }
      throw error;
    }
  };

  async getStoryPointField(storyPointsFieldName: string): Promise<string> {
    try {
      let field = '';
      const res = await apiRequest(
        'GET',
        `${this.objOptions.jiraBaseUrl}field`,
        this.headers,
      this.logger,
      );
      if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(
          `HTTP error! status: ${res.status}, Response body: ${errorText}`,
        );
        (error as any).status = res.status; // Attach status code to error object
        (error as any).response = res; // Attach response object to error object
        throw error;
      }
      const data = await res.text();
      const fields = JSON.parse(data);

      // Find the field with name "Story Points"
      const storyPointsField = fields.find(
        (value: any) => value.name === storyPointsFieldName,
      );
      if (storyPointsField) {
        field = storyPointsField.id;
      } else {
        this.logger.error('Story Points field not found.');
      }

      return field;
    } catch (error: any) {
      if (error.response) {
        this.logger.info(
          'Story Points fiels  - Server responded with status code:',
          error.response.status,
        );
      } else if (error.request) {
        this.logger.info(
          'Story Points fiels - No response received:',
          error.request,
        );
      } else {
        this.logger.info(
          'Story Points fiels - Error creating request:',
          error.message,
        );
      }
      throw error;
    }
  }

  async getIssueInfo(
    projectName: string,
    nextPageToken: string, 
    durationDate: string,
    issueTypes: string[],
    storyPointsFieldName: string,
    jiraFilterFieldKey: string,
    jiraFilterFieldValue: string,
    filterId: string,
  ): Promise<any> {
    try {
      let storyPointsField: string | undefined;
      // ------------------------------Custom Story Points------------------------------
      if (
        storyPointsFieldName &&
        storyPointsFieldName !== '#default' &&
        storyPointsFieldName !== '#notapplicable'
      ) {
        storyPointsField = await this.getStoryPointField(storyPointsFieldName);
      }
      // ------------------------------Default Story Points------------------------------
      else if (storyPointsFieldName && storyPointsFieldName === '#default') {
        storyPointsField = await this.getStoryPointField(
          'Story point estimate',
        );
      }
      // ------------------------------No Story Points------------------------------
      else if (
        storyPointsFieldName &&
        storyPointsFieldName === '#notapplicable'
      ) {
        storyPointsField = undefined;
      }
      console.log("nextPageToken"+ nextPageToken)//temp fix for yarn tsc
      const respFields = ['issuetype', 'status', 'priority', 'summary'];
      if (storyPointsField !== undefined) {
        respFields.push(storyPointsField);
      }
      // Get filter data using query Id
      let filterData: any = '';
      if (filterId) {
        const filterRes = await apiRequest(
          'GET',
          `${this.objOptions.jiraBaseUrl}filter/${filterId}`,
          this.headers,
          this.logger,
        );
        filterData = await filterRes.json();
      } else {
        filterData = null;
      }
      const filterJql = filterData ? filterData.jql : '';
      const filterCondition =
        jiraFilterFieldKey && jiraFilterFieldValue
          ? `"${jiraFilterFieldKey}" in (${jiraFilterFieldValue
              .split(',')
              .map(value => `${value.trim()}`)
              .join(', ')})`
          : ''; // Filter condition for jql query using filter key and value
      let total = 0;
      let jqlQuery = `project = ${projectName} AND updated >= ${durationDate}`;

      if (filterCondition) {
        jqlQuery += ` AND ${filterCondition}`; // appends filter condition to jql query if filter condition is present
      }
      if (filterJql) {
        jqlQuery += ` AND ${filterJql}`; //appends filter jql to jql query if filter jql is present
      }

      const body = {
        jql: jqlQuery,
        fields: respFields,
        expand: 'names,schema',
        maxResults: 100,
      };
      const issue_count = await apiRequest(
        'POST',
        `${this.objOptions.jiraBaseUrl}search/approximate-count`,
        this.headers,
        this.logger,
        {jql: jqlQuery},
      );
      const issue_count_data = await issue_count.text();
      const count = JSON.parse(issue_count_data).count;
      const res = await apiRequest(
        'POST',
        `${this.objOptions.jiraBaseUrl}search/jql`,
        this.headers,
        this.logger,
        body,
      );

      if (!res.ok) {
        const errorText = await res.text();
        
        // Check if the error message indicates the project does not exist
        if (errorText.includes(`The value '${projectName}' does not exist for the field 'project'`)) {
          const projectNotFoundError = new Error(`Project not found: ${projectName}`);
          (projectNotFoundError as any).status = 404; // Set status to 404 for "Not Found"
          throw projectNotFoundError;
        }
  
        const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
        (error as any).status = res.status; // Attach status code to error object
        (error as any).response = res; // Attach response object to error object
        throw error;
      }
  
      const data = await res.text();
      const jsonData = JSON.parse(data);
      const issueDetails: any = {};
      issueTypes.forEach(issueType => {
        const arrayName = issueType.replace(/[- ]/g, '').toLowerCase() + 'Details';
        issueDetails[arrayName] = [];
      });
      jsonData.issues.forEach((issue: any) => {
        let status: string = '';
        let priority: string = '';
        let key: string = '';
        let story: string = '';
        let points = '0';
        if (issue.fields.status !== null) {
          status = issue.fields.status.name;
        }
        if (issue.fields.priority !== null) {
          priority = issue.fields.priority.name;
        }
        const issueTypeName = issue.fields.issuetype.name;
        const arrayName = issueTypeName.replace(/[- ]/g, '').toLowerCase() + 'Details';
        if (issueTypeName === 'Story') {
          key = issue.key ?? '';
          story = issue.fields.summary ?? '';
          // ------------------------------Custom & Default Story Points------------------------------
          if (
            storyPointsFieldName &&
            storyPointsFieldName !== '#notapplicable' &&
            storyPointsField !== undefined
          ) {
            if (issue.fields[storyPointsField] !== null) {
              points = issue.fields[storyPointsField];
            }
          }
          // ------------------------------No Story Points------------------------------
          else if (
            storyPointsFieldName &&
            storyPointsFieldName === '#notapplicable' &&
            storyPointsField === undefined
          ) {
            points = '-';
          }
  
          issueDetails[arrayName].push({ key, story, status, points, priority });
        } else {
          issueDetails[arrayName].push({ status, priority });
        }
      });
      total = count || 0;
      return { ...issueDetails, total };
    } catch (error: any) {
      if (error.response) {
        this.logger.info(
          'Issue Info - Server responded with status code:',
          error.response.status,
        );
      } else if (error.request) {
        this.logger.info('Issue Info - No response received:', error.request);
      } else {
        this.logger.info('Issue Info - Error creating request:', error.message);
      }
      throw error;
    }
  }

  async getStoryInfo(
    projectName: string,
    nextPageToken: string,
    durationDate: string,
    maxResults: number,
    storyPointsFieldName: string,
    status: string,
    assigneeToMe: string,
    jiraFilterFieldKey: string,
    jiraFilterFieldValue: string,
    filterId: string,
    currentSprintDetails: string,
  ): Promise<any> {
    try {
      const storyDetails: {
        key: string;
        story: string;
        status: string;
        points: string;
        priority: string;
        type: string;
        sprint: string;
      }[] = [];
      const response: {
        storyDetails: {
          key: string;
          story: string;
          status: string;
          points: string;
          priority: string;
          type: string;
          sprint: string;
        }[];
        storyCount: string;
        filterName: string;
        projectName: string;
        jqlQuery: string;
        nextPageToken: string;
      } = {
        storyDetails: [],
        storyCount: '',
        filterName: '',
        projectName: '',
        jqlQuery: '',
        nextPageToken: '',
      };
  
  
      let storyPointsField: string | undefined;
      // ------------------------------Custom Story Points------------------------------
      if (
        storyPointsFieldName &&
        storyPointsFieldName !== '#default' &&
        storyPointsFieldName !== '#notapplicable'
      ) {
        storyPointsField = await this.getStoryPointField(storyPointsFieldName);
      }
      // ------------------------------Default Story Points------------------------------
      else if (storyPointsFieldName && storyPointsFieldName === '#default') {
        storyPointsField = await this.getStoryPointField(
          'Story point estimate',
        );
      }
      // ------------------------------No Story Points------------------------------
      else if (
        storyPointsFieldName &&
        storyPointsFieldName === '#notapplicable'
      ) {
        storyPointsField = undefined;
      }

      const respFields = [
        'status',
        'priority',
        'summary',
        'issuetype',
        'customfield_10020',
      ];
      if (storyPointsField !== undefined) {
        respFields.push(storyPointsField);
      }
      const statusCondition =
        status && status !== 'All' ? `AND status = "${status}"` : '';
  
      // Get filter data using query Id
      let filterData: any = '';
      if (filterId) {
        const filterRes = await apiRequest(
          'GET',
          `${this.objOptions.jiraBaseUrl}filter/${filterId}`,
          this.headers,
          this.logger,
        );
        filterData = await filterRes.json();
      } else {
        filterData = null;
      }
  
      response.filterName = filterData ? filterData.name : '';
      const filterJql = filterData ? filterData.jql : '';
      const filterCondition =
        jiraFilterFieldKey && jiraFilterFieldValue
          ? `"${jiraFilterFieldKey}" in (${jiraFilterFieldValue
              .split(',')
              .map(value => `${value.trim()}`)
              .join(', ')})`
          : '';
      let jqlQuery = `project = ${projectName} AND updated >= ${durationDate} ${statusCondition}`;
      if (filterCondition) {
        jqlQuery += ` AND ${filterCondition}`; // appends filter condition to jql query if filter condition is present
      }
      if (filterJql) {
        jqlQuery += ` AND ${filterJql}`; //appends filter jql to jql query if filter jql is present
      }
      if (currentSprintDetails === 'true') {
        jqlQuery += ` AND Sprint in openSprints()`; //Jqlquery for current sprint details
      }
      if (assigneeToMe) {
        jqlQuery = `project = ${projectName} AND assignee = "${assigneeToMe}" AND updated >= ${durationDate} ${statusCondition}`;
        if (filterCondition) {
          jqlQuery += ` AND ${filterCondition}`; // appends filter condition to jql query if filter condition is present
        }
        if (filterJql) {
          jqlQuery += ` AND ${filterJql}`; //appends filter jql to jql query if filter jql is present
        }
        if (currentSprintDetails === 'true') {
          jqlQuery += ` AND Sprint in openSprints()`; //Jqlquery for current sprint details
        }
      }
  
      response.projectName = projectName;
      response.jqlQuery = jqlQuery;
  
      const body = {
        jql: jqlQuery,
        nextPageToken: nextPageToken || undefined,
        fields: respFields,
        expand: 'names,schema',
        maxResults: maxResults,
      };
      const issue_count = await apiRequest(
        'POST',
        `${this.objOptions.jiraBaseUrl}search/approximate-count`,
        this.headers,
        this.logger,
        {jql: jqlQuery},
      );
      
      const issue_count_data = await issue_count.text();
      const count = JSON.parse(issue_count_data).count;
      const res = await apiRequest(
        'POST',
        `${this.objOptions.jiraBaseUrl}search/jql`,
        this.headers,
        this.logger,
        body,
    
      );
      if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(
          `HTTP error! status: ${res.status}, Response body: ${errorText}`,
        );
        (error as any).status = res.status; // Attach status code to error object
        (error as any).response = res; // Attach response object to error object
        throw error;
      }
      const data = await res.text();
      
      const jsonData = JSON.parse(data);
      response.storyCount = count || '0';
      
      jsonData.issues.forEach((issue: any) => {
        const key = issue.key ?? '';
        const story = issue.fields.summary ?? '';
        let points = '0';
        const status = issue.fields.status ? issue.fields.status.name : '';
        const priority = issue.fields.priority
          ? issue.fields.priority.name
          : '';
        const type = issue.fields.issuetype ? issue.fields.issuetype.name : '';
        const sprint = issue.fields.customfield_10020 ? issue.fields.customfield_10020[0].name : "";
        // ------------------------------Custom & Default Story Points------------------------------
        if (
          storyPointsFieldName &&
          storyPointsFieldName !== '#notapplicable' &&
          storyPointsField !== undefined
        ) {
          if (issue.fields[storyPointsField] !== null) {
        points = issue.fields[storyPointsField];
          }
        }
        // ------------------------------No Story Points------------------------------
        else if (
          storyPointsFieldName &&
          storyPointsFieldName === '#notapplicable' &&
          storyPointsField === undefined
        ) {
          points = '-';
        }

        storyDetails.push({ key, story, status, points, priority, type, sprint });
      });
      response.nextPageToken = jsonData.nextPageToken ? jsonData.nextPageToken : '';
      response.storyDetails = storyDetails;
      return response;
    } catch (error: any) {
      if (error.response) {
        const errorText = await error.response.text();
        // Check if the error message is related to the project not being found
        if (errorText.includes('The value') && errorText.includes('does not exist for the field "project"')) {
          this.logger.error(`Project not found: ${projectName}`);
          throw new Error(`Project not found: ${projectName}`);
        } else {
          this.logger.info(
            'Story Info  - Server responded with status code:',
            error.response.status,
          );
        }
      } else if (error.request) {
        this.logger.info('Story Info - No response received:', error.request);
      } else {
        this.logger.info('Story Info - Error creating request:', error.message);
      }
      throw error;
    }
  }
}