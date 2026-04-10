import { LoggerService } from '@backstage/backend-plugin-api';
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD',
  url: string,
  headersObj: { [key: string]: string } = {},
  logger: LoggerService,
  body?: any,
  params?: { [key: string]: string },
): Promise<any> {
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    };
    const combinedHeaders = { ...defaultHeaders, ...headersObj };
    const options: any = {
      method,
      headers: combinedHeaders,
    };
    if (method !== 'GET' && method !== 'HEAD') {
      options.body = body ? JSON.stringify(body) : undefined;
    }

    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += '?' + queryString;
    }

    const response = await fetch(url, options);
    return response;
  } catch (error) {
    logger.error('Error occurred:', error as Error);
    throw error;
  }
}
