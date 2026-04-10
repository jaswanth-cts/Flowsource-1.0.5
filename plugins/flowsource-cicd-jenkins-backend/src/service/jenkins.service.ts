import { apiRequest } from './apiRequest';
import FreestyleMatrixPipeline from './freestyle-matrix-pipeline';
import Multibranch from './Multibranch';
import { AuthService } from './auth.service';
import { LoggerService } from '@backstage/backend-plugin-api';

class JenkinsApiBackendService {

    private authService: AuthService;
    private baseUrl: string;
    logger: LoggerService;

    constructor( baseUrl: string, authService: AuthService, logger: LoggerService) {
        this.baseUrl = baseUrl;
        this.authService = authService;
        this.logger = logger;
    }

    private getAuthHeader(): any {
        return this.authService.getAuthHeader();
    }

    private checkConfigValues(): void {
        if (!this.baseUrl) {
            const error = new Error('Service Unavailable: Missing Configuration');
            (error as any).status = 503; // Attach status code to error object
            throw error;
        }
    }
    
    // Fetches the class of a project (pipeline) in Jenkins api response
    async fetchProjectClass(pipelineName: string): Promise<string> {
        const projectUrl = `${this.baseUrl}/job/${pipelineName}/api/json`;
        const headersObj=this.getAuthHeader();
        const projectResponse = await apiRequest(
            'GET',
            projectUrl,
            headersObj,
            this.logger,
        )
        if (!projectResponse.ok) {
            const errorText = await projectResponse.text();
            const error = new Error(`HTTP error! status: ${projectResponse.status}, Response body: ${errorText}`);
            (error as any).status = projectResponse.status; // Attach status code to error object
            (error as any).response = projectResponse; // Attach response object to error object
            throw error;
        }
        const data = await projectResponse.json();
        return data._class;
    }


    // This method determines the type of a project (pipeline) in Jenkins
    async getProjectType(pipelineName: string): Promise<any> {
        // Initialize an array to store project types
        const projectClass = await this.fetchProjectClass(pipelineName);
        // Determine the project type based on the project class
        switch (projectClass) {
            case 'hudson.model.FreeStyleProject':
                return 'freestyle';
            case 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject':
                return 'multibranch';
            case 'hudson.matrix.MatrixProject':
                return 'matrix';
            case 'org.jenkinsci.plugins.workflow.job.WorkflowJob':
                return 'pipeline';
            case 'com.cloudbees.hudson.plugins.folder.Folder':
                return 'folder';
            case 'jenkins.branch.OrganizationFolder':
                return 'orgFolder';
            default:
                // Throw an error if the project class is unsupported
                throw new Error(`Unsupported project class: ${projectClass}`);
        }
    }

    async handleFolderType(pipelineName: string, pipelineNameParamLength: number): Promise<any> {
        try {
            let pipelinesNotFound: string[] = [];
            pipelinesNotFound.push(pipelineName);
            if (pipelinesNotFound.length === pipelineNameParamLength) {
                const error = new Error('Request failed with status code 415') as any;
                error.response = {
                    status: 415,
                    data: { message: 'Unsupported format' },
                    statusText: '',
                    headers: {},
                    config: {},
                };
                throw error;
            }
            return pipelinesNotFound;
        } catch (error) {
            throw error;
        }
    }


    async getPipelineDetailsBasedOnType(pipelineNames: string[]): Promise<any> {
        this.checkConfigValues();
        // Initialize arrays to store matching pipelines and errors
        let matchingPipelines: any[] = [];
        const errorArray: string[] = [];
        let formatErrorArray: string[] = [];
        // Iterate over each pipeline name
        for (const pipelineName of pipelineNames) {
            try {
                // Determine the project type
                const projectType = await this.getProjectType(pipelineName);

                let matchingPipelinesArray: any[] = [];
                let pipelinesNotFound: string[] = [];
                let formatError: string[] = [];
                // Fetch pipeline details based on the project type
                switch (projectType) {
                    case 'freestyle':
                        const freestyle = new FreestyleMatrixPipeline(this.baseUrl, this.authService, this.logger);
                        ({ matchingPipelinesArray, pipelinesNotFound } = await freestyle.getFreestyleMatrixPipelineDetails([pipelineName]));
                        break;
                    case 'multibranch':
                        const multibranch = new Multibranch(this.baseUrl, this.authService, this.logger);
                        ({ matchingPipelinesArray, pipelinesNotFound } = await multibranch.getPipelineDetails([pipelineName]));
                        break;
                    case 'matrix':
                        const matrix = new FreestyleMatrixPipeline(this.baseUrl, this.authService, this.logger);
                        ({ matchingPipelinesArray, pipelinesNotFound } = await matrix.getFreestyleMatrixPipelineDetails([pipelineName]));
                        break;
                    case 'pipeline':
                        const pipeline = new FreestyleMatrixPipeline(this.baseUrl, this.authService, this.logger);
                        ({ matchingPipelinesArray, pipelinesNotFound } = await pipeline.getFreestyleMatrixPipelineDetails([pipelineName]));
                        break;
                    case 'folder':
                    case 'orgFolder':
                        formatError = await this.handleFolderType(pipelineName, pipelineNames.length);
                        break;
                    default:
                        throw new Error(`Unsupported project type: ${projectType}`);
                }
                // Add the matching pipelines to the matching pipelines array
                matchingPipelines = [...matchingPipelines, ...matchingPipelinesArray];

                errorArray.push(...pipelinesNotFound);
                formatErrorArray.push(...formatError);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    errorArray.push(pipelineName);

                }
                else {
                    throw err; // Re-throw other errors
                }
            }

        }
        return { matchingPipelines, errorArray, formatErrorArray };
    }


}
export default JenkinsApiBackendService;