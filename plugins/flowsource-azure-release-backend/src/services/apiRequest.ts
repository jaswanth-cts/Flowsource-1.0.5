import xss from 'xss';
import { LoggerService } from '@backstage/backend-plugin-api';

export async function apiRequest(
  logger: LoggerService,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  headersObj: { [key: string]: string } = {},
  body?: any
): Promise<any> {
  try {
    // Determine if the request should have a body
    let requestBody: string | undefined;
    if (method !== 'GET' && body !== undefined) {
      // If 'Content-Type' is 'application/x-www-form-urlencoded', use body.toString()
      if (headersObj['Content-Type'] === 'application/x-www-form-urlencoded') {
        requestBody = body.toString();
      } else {
        // Default to JSON.stringify for other content types
        requestBody = JSON.stringify(body);
      }
    }
 
    // Make the fetch call with all the options directly
    const response = await fetch(url, {
      method,
      headers: headersObj,
      body: body ? xss(requestBody ?? '') : undefined,
    });
    // Return the response
    return response;
  } catch (error : any) {
    logger.error('Error occurred:', error);
    throw error;
  }
}