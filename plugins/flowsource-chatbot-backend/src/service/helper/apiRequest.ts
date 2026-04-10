import xss from 'xss';
import FormData from 'form-data';
import { LoggerService } from '@backstage/backend-plugin-api';

export function sanitizeValue(value: any): string {
  return xss(value).replace(/&gt;/g, '>').replace(/&lt;/g, '<');
}

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  headersObj: any = {},
  logger: LoggerService,
  body?: string | FormData,
): Promise<any> {
  try {
    // Default headers
    const defaultHeaders = {
      access: 'application/json',
    };
    // Merge default headers with provided headers
    const combinedHeaders = { ...defaultHeaders, ...headersObj };

    // Prepare the request body
    let requestBody: any = undefined;
    if (body instanceof FormData) { // Currently this block is not used. Getting `body.forEach` is not a function error.
      requestBody = new FormData();

      // Iterate over each key-value pair in the original FormData
      body.forEach((value, key) => {
        if (value instanceof File || value instanceof Blob) {
          // If it's a file or blob, append it without sanitization
          requestBody.append(key, value);
        } else {
          // Sanitize non-file values to prevent XSS
          const sanitizedValue = sanitizeValue(value.toString());
          requestBody.append(key, sanitizedValue);
        }
        
      });

      // Remove Content-Type header for FormData (as it is set automatically by fetch for FormData)
      delete combinedHeaders['Content-Type'];

    } else if (typeof body === 'string') {
      // Sanitize the body for XSS
      requestBody = sanitizeValue(body);

    } else if (body) {
      // Sanitize the body for XSS (if it is not a string or FormData)
      requestBody = sanitizeValue(JSON.stringify(body));

    }

    // Make the fetch call with all the options directly
    const response = await fetch(url, {
      method,
      headers: combinedHeaders,
      body: requestBody,
    });
    // Return the response
    return response;
  } catch (error) {
    logger.error('Error occurred:', error as Error);
    throw error;
  }
}
