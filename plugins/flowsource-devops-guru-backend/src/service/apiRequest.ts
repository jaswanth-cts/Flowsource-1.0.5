import { LoggerService } from '@backstage/backend-plugin-api';
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  headersObj: { [key: string]: string } = {},
  logger: LoggerService,
  body?: any
): Promise<any> {
  try {
    // Make the fetch call with all the options directly
    const response = await fetch(url, {
      method,
      headers: headersObj,
      body: body ? JSON.stringify(body) : undefined,
    });
    // Return the response
    return response;
  } catch (error) {
    logger.error('Error occurred:', error as Error);
    throw error;
  }
}