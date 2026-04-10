import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class ServiceNowService {
  logger!: LoggerService;
  private body = undefined;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  async getIncidentsList(
    configurationItem: string,
    pageNumberParam: string,
    pageSizeParam: string,
    snowInstance: string,
    snowUsername: string,
    snowPassword: string,
    priorityFilter: string,
    stateFilter: string,
    myIncidents: string,
    userEmail: string,
    searchFilter: string,
  ) {

    // Ensure snowInstance does not end with '/'
    if (snowInstance.endsWith('/')) {
      snowInstance = snowInstance.slice(0, -1);
    }

    let pageNumber = +pageNumberParam;
    let pageSize = +pageSizeParam;
    const startAt = (pageNumber - 1) * pageSize;

    let sysparmQuery = `active=true^cmdb_ciLIKE${configurationItem}^ORDERBYDESCsys_created_on`;
    if (priorityFilter) {
      sysparmQuery += `^priority=${priorityFilter}`;
    }
    if (stateFilter) {
      sysparmQuery += `^state=${stateFilter}`;
    }
    if (myIncidents === 'true') {
      sysparmQuery += `^assigned_to=${userEmail}`;
    }
    if (searchFilter) {
      sysparmQuery += `^short_descriptionLIKE${searchFilter}^ORcategoryLIKE${searchFilter}^ORassigned_toLIKE${searchFilter}^ORconfiguration_itemLIKE${searchFilter}`;
    }
    this.logger?.debug(`sysparmQuery: ${sysparmQuery}`);
    // API Url to invoke to get the incident details
    const url = `${snowInstance}/api/now/table/incident`;
    const params = {
      sysparm_query: sysparmQuery,
      sysparm_limit: `${pageSize}`,
      sysparm_offset: `${startAt}`,
    };
    const headers = {
      Authorization:
        'Basic ' +
        Buffer.from(snowUsername + ':' + snowPassword).toString('base64'),
    };

    try {
      const response = await apiRequest('GET', url, headers, this.logger, this.body, params);
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Error occured during fetch incidents: ${response.status}, Response body: ${errorText}`,
        );
        const error = new Error(
          `HTTP error! status: ${response.status}, Response body: ${errorText}`,
        );
        (error as any).status = response.status; 
        (error as any).response = response;
        throw error;
      }
      const data = await response.json();
      const dataTotalCount = await response.headers.get('x-total-count');

      // Iterating through each response data and picking the required fields
      const promises = data.result.map(async (incidentDetails: any) => {
        let assignedToNames = '';
        const assignedToNamesCache = new Map();

        //Checking the incident details object, whether it contains assigned_to object
        if (
          incidentDetails.assigned_to &&
          typeof incidentDetails.assigned_to === 'object'
        ) {
          const assignedToUrl = incidentDetails.assigned_to.link;
          const assignedToId = incidentDetails.assigned_to.value;

          // Check if the data is in the cache
          if (assignedToNamesCache.has(assignedToId)) {
            assignedToNames = assignedToNamesCache.get(assignedToId);
          } else {
            // If not in the cache, fetch the data and store it in the cache
            assignedToNames = await this.fetchName(
              assignedToUrl,
              snowUsername,
              snowPassword,
            );
            assignedToNamesCache.set(assignedToId, assignedToNames);
          }
        }

        //Creating the object with required details from incident details response
        let object = {
          incidentNumber: incidentDetails.number,
          shortDescription: incidentDetails.short_description,
          category: incidentDetails.category,
          state: incidentDetails.state,
          priority: incidentDetails.priority,
          assignedTo: assignedToNames,
        };
        return object;
      });
      const snowDetailsObject = await Promise.all(promises);
      return { snowDetailsObject, dataTotalCount };
    } catch (error: any) {
      this.logger.error(
        'Error Fetching incident details from Service now: ',
        error,
      );
      throw error;
    }
  }

  async getServiceOrderRequests(serviceNowParams: object, pageNumberParam: string, pageSizeParam: string, 
    snowInstance: string, snowUsername: string, snowPassword: string) {
      try 
      {
        // Ensure snowInstance does not end with '/'
        if (snowInstance.endsWith('/')) {
          snowInstance = snowInstance.slice(0, -1);
        }
  
        let pageNumber = +pageNumberParam;
        let pageSize = +pageSizeParam;
        const startAt = (pageNumber - 1) * pageSize;
  
        // API Url to invoke to get the incident details
        const url = `${snowInstance}/api/now/table/sc_request`;
  
        const { configurationItem, OrderTypeField, ServiceTypeValue } = serviceNowParams as {
          configurationItem: string;
          OrderTypeField: string;
          ServiceTypeValue: string;
        };
  
        const sysparm_query = `cmdb_ci.name=${configurationItem}^${OrderTypeField}=${ServiceTypeValue}^ORDERBYDESCsys_created_on`;
        const params = {
          sysparm_query,
          sysparm_limit: `${pageSize}`,
          sysparm_offset: `${startAt}`,
        };
  
        const headers = {
          Authorization:
            'Basic ' +
            Buffer.from(snowUsername + ':' + snowPassword).toString('base64'),
        };
  
        const response = await apiRequest(
          'GET',
          url,
          headers,
          this.logger,
          this.body,
          params,
        );
        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error(
            `Error occured while fetching ${ServiceTypeValue}: ${response.status}, Response body: ${errorText}`,
          );
          const error = new Error(`Error occured while fetching ${ServiceTypeValue}: ${response.status}, Response body: ${errorText}`);
          (error as any).status = response.status; 
          (error as any).message = response;
          throw error;
        }
  
        const data = await response.json();
        const dataTotalCount = await response.headers.get('x-total-count');

        const promises = await this.parseResponseData(data, snowUsername, snowPassword);
        const snowServiceReq = await Promise.all(promises);

        return { snowServiceReq, dataTotalCount };
    } catch (error: any) {
      this.logger.error(
        'Error Fetching incident details from Service now: ',
        error as Error,
      );
      throw error;
    }
  }

  async getOrderRequests(serviceNowParams: object, pageNumberParam: string, pageSizeParam: string, 
    snowInstance: string, snowUsername: string, snowPassword: string) {
      try 
      {
        // Ensure snowInstance does not end with '/'
        if (snowInstance.endsWith('/')) {
          snowInstance = snowInstance.slice(0, -1);
        }
  
        let pageNumber = +pageNumberParam;
        let pageSize = +pageSizeParam;
        const startAt = (pageNumber - 1) * pageSize;
  
        // API Url to invoke to get the incident details
        const url = `${snowInstance}/api/now/table/sc_request`;
  
        const { configurationItem, OrderTypeField, OrderTypeValue } = serviceNowParams as {
          configurationItem: string;
          OrderTypeField: string;
          OrderTypeValue: string;
        };
  
        const sysparm_query = `cmdb_ci.name=${configurationItem}^${OrderTypeField}=${OrderTypeValue}^ORDERBYDESCsys_created_on`;
        const params = {
          sysparm_query,
          sysparm_limit: `${pageSize}`,
          sysparm_offset: `${startAt}`,
        };
  
        const headers = {
          Authorization:
            'Basic ' +
            Buffer.from(snowUsername + ':' + snowPassword).toString('base64'),
        };
  
        const response = await apiRequest(
          'GET',
          url,
          headers,
          this.logger,
          this.body,
          params,
        );

        if (!response.ok) {
          const errorText = await response.text();
          
          this.logger.error(
            `Error occured while fetching ${OrderTypeValue}: ${response.status}, Response body: ${errorText}`,
          );
          
          const error = new Error(`Error occured while fetching ${OrderTypeValue}: ${response.status}, Response body: ${errorText}`);
          (error as any).status = response.status; 
          (error as any).message = response;
          throw error;
        }
  
        const data = await response.json();
        const dataTotalCount = await response.headers.get('x-total-count');

        const promises = await this.parseResponseData(data, snowUsername, snowPassword);
        const snowOrders = await Promise.all(promises);

        return { snowOrders, dataTotalCount };
    } catch (error: any) {
      this.logger.error(
        'Error Fetching incident details from Service now: ',
        error as Error,
      );
      throw error;
    }
  }

  async getProvisionOrdersBasedOnConfigItem(serviceNowParams: object, pageNumberParam: string, pageSizeParam: string,
    snowInstance: string, snowUsername: string, snowPassword: string) {
    try 
    {
      // Ensure snowInstance does not end with '/'
      if (snowInstance.endsWith('/')) {
        snowInstance = snowInstance.slice(0, -1);
      }

      let pageNumber = +pageNumberParam;
      let pageSize = +pageSizeParam;
      const startAt = (pageNumber - 1) * pageSize;

      // API Url to invoke to get the incident details
      const url = `${snowInstance}/api/now/table/sc_request`;

      const { configurationItem, OrderTypeField, provisionTypeValue } = serviceNowParams as {
          configurationItem: string;
          OrderTypeField: string;
          provisionTypeValue: string;
        };

      const sysparm_query = `cmdb_ci.name=${configurationItem}^${OrderTypeField}=${provisionTypeValue}^ORDERBYDESCsys_created_on`;
      const params = {
        sysparm_query,
        sysparm_limit: `${pageSize}`,
        sysparm_offset: `${startAt}`,
      };

      const headers = {
        Authorization:
          'Basic ' +
          Buffer.from(snowUsername + ':' + snowPassword).toString('base64'),
      };

      const response = await apiRequest(
        'GET',
        url,
        headers,
        this.logger,
        this.body,
        params,
      );
      if (!response.ok) {
        const errorText = await response.text();

        this.logger.error(
          `Error occured while fetching ${provisionTypeValue}: ${response.status}, Response body: ${errorText}`,
        );
        
        const error = new Error(`Error occured while fetching ${provisionTypeValue}: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; 
        (error as any).message = response;
        throw error;
      }

      const data = await response.json();
      const dataTotalCount = await response.headers.get('x-total-count');

      const promises = await this.parseResponseData(data, snowUsername, snowPassword);

      const snProvisionOrders = await Promise.all(promises);
      
      return { snProvisionOrders, dataTotalCount };

    } catch (error: any) {
      this.logger.error(
        'Error Fetching incident details from Service now: ',
        error as Error,
      );
      throw error;
    }
  }

  async getAllProvisionOrdersForInfraTab(serviceNowParams: object, pageNumberParam: string, pageSizeParam: string,
    snowInstance: string, snowUsername: string, snowPassword: string) {
      // This method will fatch all the provision orders without filtering based on configuration item.
      // This code will be called only in InfraProvision Tab for Environments.
    try 
    {
      // Ensure snowInstance does not end with '/'
      if (snowInstance.endsWith('/')) {
        snowInstance = snowInstance.slice(0, -1);
      }

      let pageNumber = +pageNumberParam;
      let pageSize = +pageSizeParam;
      const startAt = (pageNumber - 1) * pageSize;

      // API Url to invoke to get the incident details
      const url = `${snowInstance}/api/now/table/sc_request`;

      const { OrderTypeField, provisionTypeValue } = serviceNowParams as {
          OrderTypeField: string;
          provisionTypeValue: string;
        };

      const sysparm_query = `${OrderTypeField}=${provisionTypeValue}^ORDERBYDESCsys_created_on`;
      const params = {
        sysparm_query,
        sysparm_limit: `${pageSize}`,
        sysparm_offset: `${startAt}`,
      };

      const headers = {
        Authorization:
          'Basic ' +
          Buffer.from(snowUsername + ':' + snowPassword).toString('base64'),
      };

      const response = await apiRequest(
        'GET',
        url,
        headers,
        this.logger,
        this.body,
        params,
      );
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Error occured while fetching ${provisionTypeValue}: ${response.status}, Response body: ${errorText}`,
        );
        const error = new Error(`Error occured while fetching ${provisionTypeValue}: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; 
        (error as any).message = response;
        throw error;
      }

      const data = await response.json();
      const dataTotalCount = await response.headers.get('x-total-count');

      const promises = await this.parseResponseData(data, snowUsername, snowPassword);

      const snowDetailsObject = await Promise.all(promises);

      return { snowDetailsObject, dataTotalCount };

    } catch (error: any) {
      this.logger.error(
        'Error Fetching incident details from Service now: ',
        error as Error,
      );
      throw error;
    }
  }

  async parseResponseData(data: any, snowUsername: string, snowPassword: string) {
    try
    {
      return data.result.map(async (orderRequest: any) => {
        let assignedToNames = '';
        const assignedToNamesCache = new Map();

        //Checking the incident details object, whether it contains assigned_to object
        if (
          orderRequest.assigned_to &&
          typeof orderRequest.assigned_to === 'object'
        ) {
          const assignedToUrl = orderRequest.assigned_to.link;
          const assignedToId = orderRequest.assigned_to.value;

          // Check if the data is in the cache
          if (assignedToNamesCache.has(assignedToId)) {
            assignedToNames = assignedToNamesCache.get(assignedToId);
          } else {
            // If not in the cache, fetch the data and store it in the cache
            assignedToNames = await this.fetchName(
              assignedToUrl,
              snowUsername,
              snowPassword,
            );
            assignedToNamesCache.set(assignedToId, assignedToNames);
          }
        }

        let object = {
          requestNumber: orderRequest.number,
          shortDescription: orderRequest.short_description,
          category: orderRequest?.category || orderRequest?.u_category,
          state: orderRequest.state,
          priority: orderRequest.priority,
          assignedTo: assignedToNames,
        };
        return object;
      });
    } catch (error) {
      this.logger.error('Error parsing response data: ', error as Error);
      throw error;
    };
  };

  // Api call for fetching the name of the assigned_to user
  async fetchName(link: string, snowUsername: string, snowPassword: string) {
    const headers = {
      Authorization:
        'Basic ' +
        Buffer.from(snowUsername + ':' + snowPassword).toString('base64'),
    };
    try {
      const response = await apiRequest('GET', link, headers, this.logger, this.body);
      const data = await response.json();
      return data.result.name;
    } catch (error) {
      this.logger.error('Error Fetching incident names from Service now: ', error as Error);
      return null;
    }
  }
}
