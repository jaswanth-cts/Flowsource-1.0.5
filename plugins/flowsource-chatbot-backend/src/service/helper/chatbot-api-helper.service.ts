import { apiRequest, sanitizeValue } from './apiRequest';
import fs from 'fs';
import path from 'path';
import { LoggerService } from '@backstage/backend-plugin-api';
import { CHATBOT_STATUSES } from '../constants/constants';

// Set the maximum body length
const MAX_BODY_LENGTH = 5242880; // 5MB

export class ChatbotApiServiceHelper {

    private readonly logger: LoggerService;
    headers: any;

    defaultAnswer = 'Sorry, I do not understand your question.';

    constructor(logger: LoggerService, accessToken:string) {
        this.logger = logger;
        this.headers={
            'Authorization': `Bearer ${accessToken}`,
        }
    }

    /**
     * Constructs a URL by appending a path to a base URL.
     * Example: appendUrlPaths('http://example.com', 'path/to/resource') returns 'http://example.com/path/to/resource'.
     */
    appendUrlPaths(baseUrl: string, apiPath: string): string {
        // Ensure that the base URL ends with a slash
        let modifiedBaseUrl = baseUrl;
        if (!modifiedBaseUrl.endsWith('/')) {
            modifiedBaseUrl += '/';
        }
        // Return the constructed URL
        return `${modifiedBaseUrl}${apiPath}`;
    }

    async getAnswerForQuestion(questionInLowerCase: string, appid: string, chatbotUrl: string) {
        const body = {
            "appid": appid,
            "query": questionInLowerCase
        };
    
        const url = this.appendUrlPaths(chatbotUrl, 'chat');
        // Convert body to JSON string
        const bodyString = JSON.stringify(body);
    
        // Check if the body size exceeds the maximum allowed length
        if (Buffer.byteLength(bodyString, 'utf8') > MAX_BODY_LENGTH) {
            throw new Error(`Body size exceeds the maximum allowed length of ${MAX_BODY_LENGTH} bytes.`);
        }

        try {
            const headers ={...this.headers,'Content-Type': 'application/json'};
            const response = await apiRequest(
                'POST',
                url,
                headers,
                this.logger,
                bodyString
            )
            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                throw error;
              }
              const responseData = await response.json();
            return responseData.answer;
        } catch (error) {
            this.logger.error(`Error in getting answer from chatbot - ${error}`);
            return this.defaultAnswer;
        }
    }

    async getChatbotStatus(chatbotUrl:string, uuid: string) {
        const url = this.appendUrlPaths(chatbotUrl, `fileprocessingstatus?uuid=${uuid}`);

        try {
            const headers ={...this.headers,'Content-Type': 'application/json'};
            const response = await apiRequest(
                'GET',
                url,
                headers,
                this.logger
            )
            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                throw error;
            }
            const statusJsonArray = await response.json();
            let status = 'not-found';
            statusJsonArray.forEach((statusJson: any) => {
                if (statusJson.id === uuid) {
                    status = statusJson.status;
                    this.logger.info(`Status of the request from chatbot for uuid - ${uuid} is - ${status}`);
                    if (status !== CHATBOT_STATUSES.SUCCESS) {
                        this.logger.error(`Error in processing the request from chatbot for uuid - ${uuid} - ${statusJson.error}`);
                    }
                }
            });
            return status;
        } catch(error) {
            this.logger.error(`Error in getting status of the request from chatbot - ${error}`);
            throw new Error(`Error in getting status of the request from chatbot - ${error}`);
        }
    }

    async uploadFileToChatbot(chatbotUrl: string, appid: string, filePath: any, action: string) {
        const url = this.appendUrlPaths(chatbotUrl, 'uploadfile');

        // Check if filePath points to a valid file
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileBuffer = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('file', new globalThis.Blob([fileBuffer], { type: 'application/zip' }), path.basename(filePath));
        formData.append('appid', sanitizeValue(appid));
        formData.append("action", sanitizeValue(action));

        try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                ...this.headers,
                // Headers are automatically set by fetch when using native FormData
              },
              body: formData as any,
            });

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
                (error as any).status = response.status; // Attach status code to error object
                (error as any).response = response; // Attach response object to error object
                throw error;
            }
            const responseData = await response.json();
            responseData.status = response.status;
            return responseData;
        } catch(error) {
            this.logger.error(`Error in uploading file to chatbot - ${error}`);
            throw new Error(`Error in uploading file to chatbot - ${error}`);
        }
    }

    async uploadFileToChatbot_action_update(chatbotUrl: string, appid: string, filePath: any) {
        
        return await this.uploadFileToChatbot(chatbotUrl, appid, filePath, "update");
    }
    async uploadFileToChatbot_action_add(chatbotUrl: string, appid: string, filePath: any) {
        return await this.uploadFileToChatbot(chatbotUrl, appid, filePath, "add");
    }
    async uploadFileToChatbot_action_deletion(chatbotUrl: string, appid: string, filePath: any) {
        return await this.uploadFileToChatbot(chatbotUrl, appid, filePath, "delete");
    }

}
