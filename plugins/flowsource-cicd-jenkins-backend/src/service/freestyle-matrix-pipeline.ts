import { apiRequest } from './apiRequest';
import { AuthService } from './auth.service';
import { LoggerService } from '@backstage/backend-plugin-api';

class FreestyleMatrixPipeline {

  private authService: AuthService;
  private baseUrl: string;
  logger: LoggerService;

  constructor(baseUrl: string, authService: AuthService, logger: LoggerService) {
    this.baseUrl = baseUrl;
    this.authService = authService;
    this.logger = logger;
}

  private getAuthHeader(): any {
      return this.authService.getAuthHeader();
  }


  // Fetches details of freestyle pipelines
  async getFreestyleMatrixPipelineDetails(pipelineNames: string[]): Promise<any> {

    // Initialize arrays to store matching pipelines, pipelines not found, and errors
    let matchingPipelinesArray: any[] = [];
    const pipelinesNotFound: any[] = [];
    const error: string[] = [];
    // Iterate over each pipeline name provided
    for (const pipelineName of pipelineNames) {
    // Construct the URL to get all jobs from Jenkins API
    const getAllJobsUrl: string | null = `${this.baseUrl}/job/${pipelineName}/api/json?tree=name,description,url,builds[result,building]`;
    const headersObj=this.getAuthHeader();
    try {
      const pipelineResponse = await apiRequest(
        'GET',
        getAllJobsUrl,
        headersObj,
        this.logger,
      )
      if (!pipelineResponse.ok) {
        const errorData = await pipelineResponse.text();
        // Create a custom error object
        const error = new Error('Request failed with status code ' + pipelineResponse.status) as any;
        error.response = {
          status: pipelineResponse.status,
          data: { message: errorData },
          statusText: pipelineResponse.statusText,
          headers: pipelineResponse.headers.raw(),
          config: {}, // No direct equivalent in node-fetch
        };
        throw error;
      }
      const data = await pipelineResponse.json();

        try {
         const  matchingPipelines = data;
          // If a matching pipeline is found
          if (matchingPipelines) {
            // Extract name, url, and builds from the matching pipeline
            const { url, builds } = matchingPipelines;
            // Get the latest build result
            let latestBuildResult = 'No builds found';
            if(builds.length > 0){
              this.logger.info(" builds[0].building "+  builds[0].building);
              latestBuildResult =  builds[0].building ? "in_progress" : builds[0].result;
            }
            
            this.logger.info("__MD__ latestBuildResult "+ latestBuildResult);
            const totalBuilds = builds.length;
            // Construct a simplified pipeline object
            const simplifiedPipelines = {
                name: pipelineName, pipelineName, url, latestBuildResult, totalBuilds,
                description: matchingPipelines.description || 'No description available'
            };
            // Push the simplified pipeline object to the matching pipelines array
            matchingPipelinesArray.push(simplifiedPipelines);
          }
          else {
            // If no matching pipeline is found, add the pipeline name to the pipelines not found array
            pipelinesNotFound.push(pipelineName.trim());
          }

          // If no matching pipelines are found or there are pipelines not found, Construct an fetch error with status code 404.
          if (matchingPipelinesArray.length === 0 || pipelinesNotFound.length !== 0) {
            const error = new Error('Request failed with status code 404') as any;
            error.response = {
              status: 404,
              data: { message: 'Not Found' },
              statusText: '',
              headers: {},
              config: {},
            };
            throw error;
          }

        } catch (err: any) {
          this.logger.error('Error:', error as any);
          if (err.response?.status === 404) {
            error.push(`Pipeline with name "${pipelineName}" not found, with status code 404`);
          } else {
            throw err; // Re-throw other errors
          }
        }
      

      if (pipelineNames.length === pipelinesNotFound.length) {
        const error = new Error('Request failed with status code 404') as any;
        error.response = {
          status: 404,
          data: { message: 'Not Found' },
          statusText: '',
          headers: {},
          config: {},
        };
        throw error;
      }

      if (pipelinesNotFound.length === 1) {
        error.push(`Pipeline with name "${pipelinesNotFound[0].trim()}" not found, with status code 404`);
      }
      else if (pipelinesNotFound.length > 1) {
        let pipelineNameString = '';

        pipelineNameString = pipelinesNotFound.map(pipeline => `"${pipeline.trim()}"`).join(', ');
        error.push(`Pipelines with names ${pipelineNameString} not found, with status code 404`);
      }

      return { matchingPipelinesArray, pipelinesNotFound };
    }
   catch (error) {
      this.logger.error('getFreestyleMatrixPipelineDetails - Error fetching Jenkins pipeline names:');
      throw error;
    }
  }
  }

}
export default FreestyleMatrixPipeline;