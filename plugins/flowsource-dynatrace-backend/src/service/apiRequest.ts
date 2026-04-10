import xss from 'xss';
import { LoggerService } from '@backstage/backend-plugin-api';

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  headersObj: { [key: string]: string } = {},
  logger: LoggerService,
  body?: any,
  queryParams?: { [key: string]: string }
): Promise<any> {
  try {
    // Default headers
    const defaultHeaders ={
      'Accept': '*/*'
    }
    // Merge default headers with provided headers
    const combinedHeaders: { [key: string]: string } = {...defaultHeaders, ...headersObj};

    // Handle query parameters
    if (queryParams) {
        const params = new URLSearchParams(queryParams);
        url += '?' + params.toString();
    }
    let requestBody;
    if (body) {
      if (combinedHeaders["Content-Type"] === "application/x-www-form-urlencoded") {
        requestBody = body;
        } else {
          requestBody = JSON.stringify(body);
        }
    }
    // Make the fetch call with all the options directly
    const response = await fetch(url, {
      method,
      headers: combinedHeaders,
      body: requestBody ? xss(requestBody) : undefined,
    });
    // Return the response
    return response;
  } catch (error) {
    logger.error('Error occurred:', error as Error);
    throw error;
  }
}