import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class DevopsWorkitemsBackendService {
  devopsAuthToken: string = '';
  devopsBaseUrl: string = '';
  orgName: string = '';
  headers: any;
  logger: LoggerService;

  constructor(devopsPAT: string, devopsBaseUrl: string, orgName: string, logger: LoggerService) {
    this.devopsAuthToken = 'Basic ' + btoa('' + ':' + devopsPAT);
    this.devopsBaseUrl = devopsBaseUrl;
    this.orgName = orgName;
    this.logger = logger;
    this.headers = {
      Authorization: this.devopsAuthToken,
    };
  }

  // Fetches all projects from Azure DevOps
  async getAllProjects(): Promise<any> {
    try {
      const response = await apiRequest(
        'GET',
        `${this.devopsBaseUrl}/${this.orgName}/_apis/projects?api-version=7.1`,
        this.headers,
        this.logger, // Add the missing logger argument
      );

      if (response.status === 203) {
        const error = new Error('Request failed with status code 401') as any;
        error.response = {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: '',
          headers: {},
          config: {},
        };
        throw error;
      }
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json();
      // Map the response data to extract project ids and names
      const projects = data.value.map((project: { id: any; name: any }) => ({
        id: project.id,
        name: project.name,
      }));

      return projects;
    } catch (error) {
      this.logger.error('Error fetching projects:', error as Error);
      throw error;
    }
  }

  // Fetches the process type ID for a given project
  async getProcessTypeId(projectName: string): Promise<string> {
    try {
      const projects = await this.getAllProjects();

      // Find the project by name
      const project = projects.find(
        (project: { name: string }) => project.name === projectName,
      );
      
      if (!project) 
      {
        const error = new Error(`Project '${projectName}' not found.`);
        
        (error as any).status = 404; // Attach status code to error object
        (error as any).response = {
          status: 404,
          data: { message: `Project '${projectName}' not found.` },
          statusText: '',
          headers: {},
          config: {},
        }; // Attach response object to error object

        throw error;
      }
      
      const response = await apiRequest(
        'GET',
        `${this.devopsBaseUrl}/${this.orgName}/_apis/projects/${project.id}/properties?api-version=7.1-preview.1`,
        this.headers,
        this.logger, // Add the missing logger argument
      );

      if (response.status === 203) 
      {
        const error = new Error(`Request failed with status code 401`);
        
        (error as any).status = 401; // Attach status code to error object
        (error as any).response = {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: '',
          headers: {},
          config: {},
        }; // Attach response object to error object

        throw error;
      }

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json();
      // Find the property corresponding to the process type
      const processType = data.value.find(
        (property: { name: string }) =>
          property.name === 'System.ProcessTemplateType',
      );
      if (processType) {
        return processType.value;
      } else {
        throw new Error('Process type not found for the project.');
      }
    } catch (error) {
      this.logger.error(
        `Error fetching process type for project '${projectName}':`,
        error as Error,
      );
      throw error;
    }
  }

  async getWorkItemTypes(processId: string): Promise<any[]> {
    try {
      const response = await apiRequest(
        'GET',
        `${this.devopsBaseUrl}/${this.orgName}/_apis/work/processes/${processId}/workItemTypes?api-version=7.1`,
        this.headers,
        this.logger, // Add the missing logger argument
      );

      if (response.status === 203) {
        const error = new Error('Request failed with status code 401') as any;
        error.response = {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: '',
          headers: {},
          config: {},
        };
        throw error;
      }
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json();
      const workItemTypes: any[] = [];
      data.value.forEach((workItemType: any) => {
        if (
          !workItemType.name.toLowerCase().includes('test plan') &&
          !workItemType.name.toLowerCase().includes('test suite')
        ) {
          workItemTypes.push({
            id: workItemType.referenceName,
            name: workItemType.name,
          });
        }
      });

      return workItemTypes;
    } catch (error) {
      this.logger.error('Error fetching work item types:', error as Error);
      throw error;
    }
  }

  // Fetches the work item types for a given process ID
  async getWorkItemStates(processId: string): Promise<any[]> {
    try {
      // Get work item types
      const workItemTypes = await this.getWorkItemTypes(processId);
      if (workItemTypes.length === 0) {
        throw new Error('No work item types found for the given processId');
      }

      const uniqueStatuses: { id: string; name: string }[] = [];

      // Iterate through each work item type
      for (const workItemType of workItemTypes) {
        // Fetch work item states using witRefName
        const response = await apiRequest(
          'GET',
          `${this.devopsBaseUrl}/${this.orgName}/_apis/work/processes/${processId}/workItemTypes/${workItemType.id}/states?api-version=7.1`,
          this.headers,
          this.logger,
        );

        if (response.status === 203) {
          const error = new Error('Request failed with status code 401') as any;
          error.response = {
            status: 401,
            data: { message: 'Unauthorized' },
            headers: {},
            config: {},
          };
          throw error;
        }
        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(
            `HTTP error! status: ${response.status}, Response body: ${errorText}`,
          );
          (error as any).status = response.status; // Attach status code to error object
          (error as any).response = response; // Attach response object to error object
          throw error;
        }
        const data = await response.json();
        // Extract unique status types
        const workItemStates: any[] = data.value.map((state: any) => ({
          id: state.id,
          name: state.name,
        }));

        for (const state of workItemStates) {
          // Check if the status is not already present in uniqueStatuses
          if (!uniqueStatuses.some(status => status.name === state.name)) {
            uniqueStatuses.push(state);
          }
        }
      }

      return uniqueStatuses;
    } catch (error) {
      this.logger.error('Error fetching work item states:', error as Error);
      throw error;
    }
  }

  // Retrieves the count of work items based on the provided query, filtered by the current user's display name
  async getWorkitemCountByQuery(query: any, dateString: string): Promise<any> {
    try {
      query.query += ` AND [System.ChangedDate] >= '${dateString}'`;
      const response = await apiRequest(
        'POST',
        `${this.devopsBaseUrl}/${this.orgName}/_apis/wit/wiql?api-version=7.1`,
        this.headers,
        this.logger,
        query,
      );
      if (response.status === 203) {
        const error = new Error('Request failed with status code 401') as any;
        error.response = {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: '',
          headers: {},
          config: {},
        };
        throw error;
      }
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json();

      return { count: data.workItems.length };
    } catch (error) {
      this.logger.error('Error for getting work item Count By Query', error as Error);
      return { count: 0 };
    }
  }

  // Parses the count of work items by status for a given project
  async dataParsingForWorkitemTypeCountByStatus(
    projectName: string,
    durationInDays: number,
    dateString: string,
    queryId: string,
    azureDevopsFilterFieldKey: string,
    azureDevopsFilterFieldValue: string,
  ) {
    try {
      let specificWiqlPart = '';
      let filterFieldKeyAndValue = '';
      // Initialize an array to store status counts
      const countByStatus: { statusName: string; count: number }[] = [];

      // Get process type
      const processId = await this.getProcessTypeId(projectName);

      // Get work item states
      const workItemStates = await this.getWorkItemStates(processId);

      // Create queries for each state
      if (queryId) {
        const result = await this.fetchAndProcessWiqlQuery(
          queryId,
          projectName,
        );
        specificWiqlPart = result.specificWiqlPart;
      }

      if (azureDevopsFilterFieldKey && azureDevopsFilterFieldValue) {
        filterFieldKeyAndValue = await this.fetchFieldReferenceName(
          azureDevopsFilterFieldKey,
          azureDevopsFilterFieldValue,
          projectName,
        );
      }

      const countQueries = workItemStates.map(state => ({
        stateName: state.name,
        query: `Select [System.Id] From WorkItems Where [System.TeamProject] = '${projectName}' ${filterFieldKeyAndValue} AND [System.State] = '${state.name}' ${specificWiqlPart} AND [System.ChangedDate] >= @Today - ${durationInDays}`,
      }));

      // Execute count queries in parallel
      const countResponses = await Promise.all(
        countQueries.map(queryObj =>
          this.getWorkitemCountByQuery(queryObj, dateString),
        ),
      );

      // Populate countByStatus array with status name and count
      countResponses.forEach((response, index) => {
        countByStatus.push({
          statusName: countQueries[index].stateName,
          count: response.count,
        });
      });

      return countByStatus;
    } catch (error) {
      this.logger.error('Error parsing work item type count by status:', error as Error);
      throw error;
    }
  }

  generateRandomColor(): string {
    // Generate a random hex color code
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  async dataParsingForWorkitemTypeCountByPriority(
    projectName: string,
    durationInDays: number,
    dateString: string,
    queryId: string,
    azureDevopsFilterFieldKey: string,
    azureDevopsFilterFieldValue: string,
  ): Promise<{ type: string; typeValues: number[] }[]> {
    try {
      let specificWiqlPart = '';
      let filterFieldKeyAndValue = '';

      const processId = await this.getProcessTypeId(projectName);
      // Get work item types
      const workItemTypes = await this.getWorkItemTypes(processId);

      // Define the response array
      const chartValues: {
        type: string;
        typeValues: number[];
        color: string;
      }[] = [];
      const usedColors: string[] = [];

      // Iterate through each work item type
      for (const { name } of workItemTypes) {
        // Initialize countByPriority object for the current work item type
        const countByPriority: { [key: string]: number } = {
          high: 0,
          medium: 0,
          low: 0,
          lowest: 0,
        };

        if (queryId) {
          const result = await this.fetchAndProcessWiqlQuery(
            queryId,
            projectName,
          );
          specificWiqlPart = result.specificWiqlPart;
        }

        if (azureDevopsFilterFieldKey && azureDevopsFilterFieldValue) {
          filterFieldKeyAndValue = await this.fetchFieldReferenceName(
            azureDevopsFilterFieldKey,
            azureDevopsFilterFieldValue,
            projectName,
          );
        }

        // Execute queries to fetch counts for each priority level in parallel
        const countQueries = [
          {
            priority: 'high',
            query: `Select [System.Id] From WorkItems Where [System.TeamProject] = '${projectName}' AND [Microsoft.VSTS.Common.Priority] = 1 ${filterFieldKeyAndValue} AND [System.WorkItemType] = '${name}' ${specificWiqlPart} AND [System.ChangedDate] >= @Today - ${durationInDays}`,
          },
          {
            priority: 'medium',
            query: `Select [System.Id] From WorkItems Where [System.TeamProject] = '${projectName}' AND [Microsoft.VSTS.Common.Priority] = 2 ${filterFieldKeyAndValue} AND [System.WorkItemType] = '${name}' ${specificWiqlPart} AND [System.ChangedDate] >= @Today - ${durationInDays}`,
          },
          {
            priority: 'low',
            query: `Select [System.Id] From WorkItems Where [System.TeamProject] = '${projectName}' AND [Microsoft.VSTS.Common.Priority] = 3 ${filterFieldKeyAndValue} AND [System.WorkItemType] = '${name}' ${specificWiqlPart} AND [System.ChangedDate] >= @Today - ${durationInDays}`,
          },
          {
            priority: 'lowest',
            query: `Select [System.Id] From WorkItems Where [System.TeamProject] = '${projectName}' AND [Microsoft.VSTS.Common.Priority] = 4 ${filterFieldKeyAndValue} AND [System.WorkItemType] = '${name}' ${specificWiqlPart} AND [System.ChangedDate] >= @Today - ${durationInDays}`,
          },
        ];

        const countResponses = await Promise.all(
          countQueries.map(({ query }) =>
            this.getWorkitemCountByQuery({ query: query }, dateString),
          ),
        );

        // Assign counts to the respective properties in the countByPriority object
        countResponses.forEach((response, index) => {
          countByPriority[countQueries[index].priority] = response.count;
        });

        // Construct the chartValues array entry for the current work item type
        const typeValues = ['high', 'medium', 'low', 'lowest'].map(
          priority => countByPriority[priority],
        );

        // Generate a random color that hasn't been used before
        let color: string;
        do {
          color = this.generateRandomColor();
        } while (usedColors.includes(color));

        usedColors.push(color);

        chartValues.push({ type: name, typeValues, color });
      }

      return chartValues;
    } catch (error) {
      this.logger.error('Error parsing work item type count by priority:', error as Error);
      throw error;
    }
  }

  async getGraphData(
    projectName: string,
    durationInDays: number,
    queryId: string,
    azureDevopsFilterFieldKey: string,
    azureDevopsFilterFieldValue: string,
  ): Promise<any> {
    try {
      const date = new Date();
      date.setDate(date.getDate() - durationInDays);
      const dateString = date.toISOString().split('T')[0];

      // Fetch data for work item types by status
      const workItemTypeCountByStatusPromise =
        this.dataParsingForWorkitemTypeCountByStatus(
          projectName,
          durationInDays,
          dateString,
          queryId,
          azureDevopsFilterFieldKey,
          azureDevopsFilterFieldValue,
        );

      // Fetch data for work item types by priority
      const workItemTypeCountByPriorityPromise =
        this.dataParsingForWorkitemTypeCountByPriority(
          projectName,
          durationInDays,
          dateString,
          queryId,
          azureDevopsFilterFieldKey,
          azureDevopsFilterFieldValue,
        );
      // Fetch work item states
      const processId = await this.getProcessTypeId(projectName);
      const workItemStatesPromise = this.getWorkItemStates(processId);

      const [workItemTypeCountByStatus, workItemTypeCountByPriority] =
        await Promise.all([
          workItemTypeCountByStatusPromise,
          workItemTypeCountByPriorityPromise,
          workItemStatesPromise,
        ]);

      // Construct graph data object
      const graphData = {
        workItemTypeCountByStatus,
        workItemTypeCountByPriority,
      };

      return graphData;
    } catch (error) {
      this.logger.error('Error fetching graph data:', error as Error);
      throw error;
    }
  }

  async getWorkitemTypesData(projectName: string): Promise<any> {
    try {
      // Fetch work item states
      const processId = await this.getProcessTypeId(projectName);
      const workItemTypes = await this.getWorkItemTypes(processId);

      // Extract only the names from workItemStates
      const workItemTypesNames = workItemTypes.map(state => state.name).sort((a, b) => a.localeCompare(b));
      workItemTypesNames.splice(0, 0, 'All');

      // Construct status data object
      const typeData = {
        workItemTypes: workItemTypesNames,
        workItemTypesCount: workItemTypesNames.length,
      };

      return typeData;
    } catch (error) {
      this.logger.error('Error fetching status data:', error as Error);
      throw error;
    }
  }

  async getStatusData(projectName: string): Promise<any> {
    try {
      // Fetch work item states
      const processId = await this.getProcessTypeId(projectName);
      const workItemStates = await this.getWorkItemStates(processId);

      // Extract only the names from workItemStates
      const workItemStateNames = workItemStates.map(state => state.name).sort((a, b) => a.localeCompare(b));
      workItemStateNames.splice(0, 0, 'All');

      // Construct status data object
      const statusData = {
        workItemStates: workItemStateNames,
        workItemStateCount: workItemStateNames.length,
      };

      return statusData;
    } catch (error) {
      this.logger.error('Error fetching status data:', error as Error);
      throw error;
    }
  }

  // Retrieves details of a project including work item type counts and information
  public async getProjectDetails(
    projectName: string,
    pageNumber: string,
    pageSize: string,
    durationInDays: number,
    status: string,
    workitemType: string,
    assigneeToMe: string,
    currentSprintDetails: string,
    currentSprintTeamName: string,
    queryId: string,
    checkAllStories: string,
    azureDevopsFilterFieldKey: string,
    azureDevopsFilterFieldValue: string,
  ): Promise<any> {
    try {
      // Fetch work item type counts and work item information in parallel
      const { workitem, workitemCount, wiqlQuery, filterName } =
        await this.getAllWorkitems(
          projectName,
          pageNumber,
          pageSize,
          durationInDays,
          status,
          workitemType,
          assigneeToMe,
          currentSprintDetails,
          currentSprintTeamName,
          queryId,
          checkAllStories,
          azureDevopsFilterFieldKey,
          azureDevopsFilterFieldValue,
        );
      return {
        name: projectName,
        workitemInfo: workitem || [],
        workitemCount: workitemCount,
        wiqlQuery: wiqlQuery,
        filterName: filterName,
      };
    } catch (error) {
      this.logger.error('Error in getProjectDetails:', error as Error);
      throw error;
    }
  }

  async fetchAndProcessWiqlQuery(
    queryId: string,
    projectName: string,
  ): Promise<{ specificWiqlPart: string; name: string }> {
    try {
      const responses = await apiRequest(
        'GET',
        `${this.devopsBaseUrl}/${this.orgName}/${projectName}/_apis/wit/queries/${queryId}?$expand=clauses&api-version=7.1`,
        this.headers,
        this.logger,
            );

      if (responses.status === 200) {
        const data = await responses.json();
        const wiqlQuerys = data.wiql;
        const regex = /\[System\.TeamProject\] = '[^']+'( and .*)/;
        const match = wiqlQuerys.match(regex);
        let specificWiqlPart = match ? match[1].trim() : '';
        specificWiqlPart = specificWiqlPart.replace(
          /'([^']*<[^>]+>[^']*)'/g,
          (match: string, p1: string) => {
            const innerContent = p1.match(/<([^>]+)>/);
            return innerContent ? `'${innerContent[1]}'` : match;
          },
        );

        return { specificWiqlPart, name: data.name };
      } else {
        this.logger.error(
          'Failed to fetch data:',
          responses.status,
        );
        return { specificWiqlPart: '', name: '' };
      }
    } catch (error) {
      this.logger.error('Error fetching and processing WIQL query:', error as Error);
      return { specificWiqlPart: '', name: '' };
    }
  }

  // Retrieves all work items associated with a specific project
  async getAllWorkitems(
    projectName: string,
    pageNumberParam: string,
    pageSizeParam: string,
    durationInDays: number,
    status: string,
    workitemType: string,
    assigneeToMe: string,
    currentSprintDetails: string,
    currentSprintTeamName: string,
    queryId: string,
    checkAllStories: string,
    azureDevopsFilterFieldKey: string,
    azureDevopsFilterFieldValue: string,
  ): Promise<any> {
    try {
      let pageNumber = +pageNumberParam;
      let pageSize = +pageSizeParam;
      let workitem: any[] = [];
      let workitemIds: string[] = [];
      let workitemCount: number = 0;
      const date = new Date();
      date.setDate(date.getDate() - durationInDays);
      const dateString = date.toISOString().split('T')[0];
      let wiqlQuery;
      let filterName = '';
      let additionalFilter = '';
      let specificWiqlPart = '';
      let filterFieldKeyAndValue = '';
      const checkAssignees = checkAllStories === 'true' ? 'false' : 'true';

      if (queryId) {
        const result = await this.fetchAndProcessWiqlQuery(
          queryId,
          projectName,
        );
        specificWiqlPart = result.specificWiqlPart;
        filterName = result.name;
      }

      if (azureDevopsFilterFieldKey && azureDevopsFilterFieldValue) {
        filterFieldKeyAndValue = await this.fetchFieldReferenceName(
          azureDevopsFilterFieldKey,
          azureDevopsFilterFieldValue,
          projectName,
        );
      }

      if (currentSprintDetails === 'true') {
        additionalFilter = ` AND [System.IterationPath] = @currentIteration('[${projectName}]\\${currentSprintTeamName}')`;
      }
      if (checkAssignees === 'true') {
        wiqlQuery = {
          query: `Select [System.Id], [System.Title], [System.State] 
            From WorkItems 
            Where [System.TeamProject] = '${projectName}'
            ${specificWiqlPart}
            AND [System.AssignedTo] = '${assigneeToMe}'${additionalFilter}
            AND [System.ChangedDate] >= '${dateString}'
            ${filterFieldKeyAndValue}
            ${status !== 'All' ? `AND [System.State] = '${status}'` : ''}
            ${workitemType !== 'All' ? `AND [System.WorkitemType] = '${workitemType}'` : ''}
            order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`,
        };
      } else if (checkAllStories === 'true') {
        wiqlQuery = {
          query: `Select [System.Id], [System.Title], [System.State] 
            From WorkItems 
            Where [System.TeamProject] = '${projectName}'${additionalFilter}                                    
            AND [System.ChangedDate] >= '${dateString}'
            ${specificWiqlPart}
            ${filterFieldKeyAndValue}
            ${status !== 'All' ? `AND [System.State] = '${status}'` : ''}
            ${workitemType !== 'All' ? `AND [System.WorkitemType] = '${workitemType}'` : ''}
            order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`,
        };
      }
      const response = await apiRequest(
        'POST',
        `${this.devopsBaseUrl}/${this.orgName}/_apis/wit/wiql?api-version=7.1`,
        this.headers,
        this.logger,
        wiqlQuery, // Ensure the query is sent as an object, defaulting to an empty object if undefined
      );

      if (response.status === 203) {
        const error = new Error('Request failed with status code 401') as any;
        error.response = {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: '',
          headers: {},
          config: {},
        };
        throw error;
      }

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }

      const jsonResults = await response.json();
      if (jsonResults && jsonResults.workItems) {
        const workItemsResponse = jsonResults.workItems;
        workitemIds = workItemsResponse.map((workitem: any) => workitem.id);
        workitemCount = workitemIds.length;

        const selectedIds = workitemIds.slice(
          (pageNumber - 1) * pageSize,
          pageNumber * pageSize,
        );

        let resolvedWorkitems: any[] = [];
        if (selectedIds.length > 0) {
          resolvedWorkitems = await this.getWorkitemDetails(selectedIds);
        }

        workitem = resolvedWorkitems.filter(
          (workitem: {}) => Object.keys(workitem).length !== 0,
        ); // Remove empty objects
      }

      return {
        workitem,
        workitemCount,
        wiqlQuery,
        filterName,
      };
    } catch (error) {
      this.logger.error('Error fetching work items:', error as Error);
      throw error;
    }
  }

  async fetchFieldReferenceName(
    fieldName: string,
    azureDevopsFilterFieldValue: string | string[],
    projectName: string,
  ): Promise<string> {
    try {
      const responses = await apiRequest(
        'GET',
        `${this.devopsBaseUrl}/${this.orgName}/${projectName}/_apis/wit/fields?api-version=7.1`,
        this.headers,
        this.logger,
      );

      if (responses.status === 200) {
        const data = await responses.json();
        const fields = data.value;

        // Find the field with the specified name
        const field = fields.find((f: any) => f.name === fieldName);
        if (field) {
          const referenceName = field.referenceName;

          // Handle azureDevopsFilterFieldValue as an array or a single string
          // Handle azureDevopsFilterFieldValue as an array or a single string
          let filterValues: string;
          if (Array.isArray(azureDevopsFilterFieldValue)) {
            filterValues = azureDevopsFilterFieldValue
              .map(value => `'${value}'`)
              .join(', ');
          } else {
            // Split the string by comma and trim spaces, then join with single quotes
            filterValues = azureDevopsFilterFieldValue
              .split(',')
              .map(value => `'${value.trim()}'`)
              .join(', ');
          }

          const filterKeyandValue = `AND [${referenceName}] In (${filterValues})`;
          this.logger.info(filterKeyandValue);
          return filterKeyandValue;
        } else {
          throw new Error(`Field with name ${fieldName} not found`);
        }
      } else {
        throw new Error(`Failed to retrieve fields: ${responses.status}`);
      }
    } catch (error) {
      this.logger.error('Error fetching field reference name:', error as Error);
      throw error;
    }
  }

  // Retrieves details for a specific work item
  async getWorkitemDetails(workitemIds: string[]): Promise<any[]> {
    try {
      const query = {
        ids: workitemIds,
      };
      const response = await apiRequest(
        'POST',
        `${this.devopsBaseUrl}/${this.orgName}/_apis/wit/workitemsbatch?api-version=7.1`,
        this.headers,
        this.logger,
        query,
      );
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const jsonResults = await response.json();

      let workitemDetailsArray: any[] = [];

      if (jsonResults !== null && jsonResults.value) {
        const workItems = jsonResults.value;
        workitemDetailsArray = workItems.map((workItem: any) => ({
          id: workItem.id ?? '',
          title: workItem.fields['System.Title'] ?? '',
          projectTeam: workItem.fields['System.TeamProject'] ?? '',
          workItemType: workItem.fields['System.WorkItemType'] ?? '',
          state: workItem.fields['System.State'] ?? '',
          priority: workItem.fields['Microsoft.VSTS.Common.Priority'] ?? '',
          assignedTo: workItem.fields['System.AssignedTo']?.displayName ?? '',
          createdBy: workItem.fields['System.CreatedBy']?.displayName ?? '',
          url: `${workItem.url.split('/_apis')[0]}/_workitems/edit/${
            workItem.id
          }`,
        }));
      }

      return workitemDetailsArray;
    } catch (error) {
      this.logger.error('Error fetching work item details:', error as Error);
      throw error;
    }
  }
}
