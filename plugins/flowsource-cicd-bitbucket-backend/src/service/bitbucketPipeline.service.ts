import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';
export default class BitbucketPipelineService {
    private logger: LoggerService;
    constructor(logger: LoggerService) {
        this.logger = logger;
        
    }
    async fetchPipeline(repoName: string, repoOwner: string, pipeline: string, baseUrl:string, authToken:string, pageNumber:number, pageLength:number, duration?:number) {
        if (!authToken) {
            const error = new Error('Service Unavailable: Missing authentication token');
            (error as any).status = 503;
            throw error;
        }
        const pipelinePattern = pipeline === "default" ? `target.selector.type=DEFAULT` : `target.selector.pattern=${pipeline}`;
        const url = `${baseUrl}/${repoOwner}/${repoName}/pipelines?pagelen=${pageLength}&page=${pageNumber}&${pipelinePattern}&sort=-created_on`
        let response: any;
        response = await apiRequest(
           'GET',
            url,
            {
                'Content-Type': 'application/json', 
                'Accept': '*/*',
                'Authorization': `Bearer ${authToken}`,
            },
            this.logger,
        )
        if (!response.ok) {
            const errorText = await response.text();
            const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
            (error as any).status = response.status; // Attach status code to error object
            (error as any).response = response; // Attach response object to error object
            throw error;
        }
        response = await response.json();

        if (duration) {
            const durationInMilliseconds: number = duration * 24 * 60 * 60 * 1000;
            const durationDate = new Date(Date.now() - durationInMilliseconds).toISOString();
            response.values = response.values.filter((item: any) => new Date(item.created_on) > new Date(durationDate));
        }
        return response;
    }

    async getData(repoName: any, repoOwner: any, pipelines: any, baseUrl:string, authToken:string) {
        try {
            const pipelineNames: string[] = pipelines.split(",");
            const matchingPipelinesArray: any = [];
            const errorArray: string[] = [];

            const fetchPipelinePromises = pipelineNames.map(async (pipeline) => {
            const res = await this.fetchPipeline(repoName as string, repoOwner as string, pipeline as string, baseUrl, authToken, 1, 1);

            const state = res.values[0]?.state;
            const result = state?.result;
            const status = state?.name === "COMPLETED" && result?.name === "SUCCESSFUL" ? "Success" : state?.name === "COMPLETED" && result?.name === "STOPPED" ? "Stopped" : state?.name === "IN_PROGRESS" ? "In Progress" : "Failed";

            const uniqueId = matchingPipelinesArray.length + 1;
            matchingPipelinesArray.push({ name: pipeline, pipelineState: status, id: uniqueId });
        });

        await Promise.all(fetchPipelinePromises);
        matchingPipelinesArray.sort((a: any, b: any) => a.name.localeCompare(b.name));
            return { matchingPipelinesArray, errorArray };
        } catch (error) {
            this.logger.error('Error fetching pipelines:', error as Error);
            throw error;
        }
    }

    async getBuildData(repoName: any, repoOwner: any, pipelineName: any, baseUrl:string, authToken:string, pageNumber: any, pageLength: any, durationDate: any) {
        try {

            let buildDetails: any = [];

            const res = await this.fetchPipeline(repoName as string, repoOwner as string, pipelineName as string, baseUrl, authToken, pageNumber, pageLength, durationDate);

            buildDetails.push(...res.values);

            const data = await Promise.all(buildDetails.map(async (item: any) => {
                const durationInSeconds = item.duration_in_seconds
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = Math.floor(durationInSeconds % 60);
                const formattedDuration = hours > 0 ? `${hours}h ${minutes > 0 ? minutes + 'm' : ''}` : `${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;

                let errorMessage: any;

                // fetching the commit details
                let commitid = item.target.commit.hash;
                let commitUrl = `${baseUrl}/${repoOwner}/${repoName}/commit/${commitid}`;
                let commitResponse: any;
                commitResponse = await apiRequest('GET', commitUrl, {'content-type': 'application/json', 'Authorization': `Bearer ${authToken}`}, this.logger);
                commitResponse = await commitResponse.json();
                let commitMessage = commitResponse.message;

                // fetching the error message
                let failedStep: any;
                if(item.state.name === "COMPLETED" && item.state.result.name === "FAILED") {

                    let url = `${baseUrl}/${repoOwner}/${repoName}/pipelines/${item.uuid}/steps`;
                    let response :any;
                    response = await apiRequest('GET', url, {'content-type': 'application/json', 'Authorization': `Bearer ${authToken}`}, this.logger);
                    response = await response.json();                  

                    for (const step of response.values) {
                        if(step.state?.result?.name === "FAILED"){
                            failedStep = step.name ? step.name : null;
                            if (step.state.result.error) {
                                errorMessage = step.state.result.error.message;
                            } else {
                                let stepUrl = `${baseUrl}/${repoOwner}/${repoName}/pipelines/${item.uuid}/steps/${step.uuid}/log`;
                                let stepResponse: any;
                                stepResponse = await apiRequest('GET', stepUrl, {'content-type': 'application/json', 'Authorization': `Bearer ${authToken}`}, this.logger);
                                stepResponse = await stepResponse.text();

                                let logLines = stepResponse.split("\n");
                                const errorLines = [];
                                const errorRegex = /^\[ERROR\] .+/;

                                for (let i = logLines.length - 1; i >= 0; i--) {
                                    if (errorRegex.test(logLines[i])) {
                                        errorLines.push(logLines[i]);
                                    }
                                    if (errorLines.length>=7) {
                                        break;
                                    }
                                }

                                if (errorLines.length === 0) {
                                    const start = Math.max(logLines.length - 10, 0);
                                    const end = Math.max(logLines.length - 3, 0);
                                    const selectedLines = logLines.slice(start, end);
                                    errorMessage = selectedLines.join('\n');
                                } else {
                                    errorMessage = errorLines.reverse().join('\n');
                                }
                            }
                        }
                    };
                }
                return {
                    id: item.build_number,
                    runDuration: formattedDuration,
                    status: item.state.name === "COMPLETED" && item.state.result.name === "SUCCESSFUL" ? "Success" : item.state.name === "COMPLETED" && item.state.result.name === "STOPPED" ? "Stopped" : item.state.name ==="IN_PROGRESS"  ? "In Progress" : "Failed",
                    url: "https://bitbucket.org/" + repoOwner + "/" + repoName + "/pipelines/results/" + item.build_number,
                    errorMessage: errorMessage,
                    commitMessage: commitMessage,
                    failedStep: failedStep,
                    createdOn: item.created_on,
                    runDate: item.run_creation_date
                };
            }));
            return data;
        } catch (error: any) {
            this.logger.error('Error fetching pipelines:', error);
            throw error;
        }
    }
}
