import { apiRequest } from './apiRequest';
import { AuthService } from './auth.service';
import { LoggerService } from '@backstage/backend-plugin-api';
class Multibranch {

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

  // This method fetches details of multibranch pipelines
  async getPipelineDetails(pipelineNames: string[]): Promise<any> {
    // Initialize arrays to store matching pipelines, pipelines not found, and errors
    let matchingPipelinesArray: any[] = [];
    const pipelinesNotFound: any[] = [];
    const error: string[] = [];


      // Iterate over each pipeline name provided
      for (const pipelineName of pipelineNames) {
       
        try {

        const matchingPipelines = true;
        // If a matching pipeline is found
          if (matchingPipelines) {
            // Fetch the inner job names for the matching pipeline
            const pipelineData = await this.getInnerJobsNames(pipelineName.trim());

            // Add the pipeline data to the matching pipelines array
            matchingPipelinesArray = [...matchingPipelinesArray, ...pipelineData];
          }
          // If no matching pipeline is found, add the pipeline name to the pipelines not found array
          else {
            pipelinesNotFound.push(pipelineName.trim());
          }

          // If no matching pipelines are found or there are pipelines not found, Construct an node-fetch error with status code 404
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
          if (err.response?.status === 404) {
            error.push(`Pipeline with name "${pipelineName}" not found, with status code 404`);
          } else {
            throw err; // Re-throw other errors
          }
        }
      }

      // Format error message if there are multiple errors
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


  // This method fetches inner job names of a multibranch pipeline
  async getInnerJobsNames(pipelineName: string): Promise<any> {

    // Initialize an array to store job details
    const jobsArray: any[] = [];

    // Construct the URL to get inner jobs from Jenkins API
    const getInnerJobsUrl: string | null = `${this.baseUrl}/job/${pipelineName}/api/json?tree=description,jobs[name,url,builds[result,building,fullDisplayName]]`
    const headersObj=this.getAuthHeader();
    try {
      const pipelineResponse = await apiRequest(
        'GET',
        getInnerJobsUrl,
        headersObj,
        this.logger,
      )
      if (!pipelineResponse.ok) {
        const errorText = await pipelineResponse.text();
        const error = new Error(`HTTP error! status: ${pipelineResponse.status}, Response body: ${errorText}`);
        (error as any).status = pipelineResponse.status; // Attach status code to error object
        (error as any).response = pipelineResponse; // Attach response object to error object
        throw error;
      }
      const data = await pipelineResponse.json();
      const jobs = data.jobs;
      jobs.forEach((job: any) => {
        // Extract job name, URL, and build result
        const { name, url, builds } = job;
        // Get the latest build result
        let latestBuildResult = 'No builds found';
            if(builds.length > 0){
              this.logger.info(" builds[0].building "+  builds[0].building);
              latestBuildResult =  builds[0].building ? "in_progress" : builds[0].result;
            }
        // Get total number of builds
        const totalBuilds = builds.length;

        const innerPipelineName = name;

        // Push job information to the jobsArray
        jobsArray.push({
          pipelineName,
          innerPipelineName,
          name: pipelineName + " >> " + innerPipelineName,
          url,
          latestBuildResult,
          totalBuilds,
          description: data.description || 'No description available',
        });
      });

      return jobsArray;
    } catch (error) {
      this.logger.error('Error fetching Jenkins inner jobs names:');
      throw error;
    }
  }



}
export default Multibranch;