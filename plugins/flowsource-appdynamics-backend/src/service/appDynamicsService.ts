import { AuthService } from './auth.service';
import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class AppDynamicsService {
  private logger: LoggerService;
  private authService: AuthService;
  private baseUrl: string;
  private duration: number;

  constructor(logger: LoggerService, authService: AuthService, baseUrl: string, duration: number) {
    this.logger = logger;
    this.authService = authService;
    this.baseUrl = baseUrl;
    this.duration = duration;
  }

  public async fetchResponse(applicationName: string): Promise<any> {
    const totalMinutes = this.duration * 24 * 60;
    // Size of each time chunk in minutes (2 days worth of minutes)
    const chunkSizeInMinutes = 2 * 24 * 60;
    // Array to store time chunks with start and end timestamps
    const chunks: { startTime: number; endTime: number }[] = [];

    const now = Date.now();

    // Create time chunks by dividing the total duration into smaller intervals
    for (let i = 0; i < totalMinutes; i += chunkSizeInMinutes) {
     // End time for current chunk (current time minus accumulated minutes)
      const endTime = now - i * 60 * 1000;
      // Start time for current chunk (end time minus chunk duration)
      const startTime = endTime - chunkSizeInMinutes * 60 * 1000;
      chunks.push({ startTime, endTime });
    }

    try {
      const authHeader = await this.authService.getAuthHeader();

      if (!authHeader || !authHeader.Authorization) {
        throw new Error('Authentication failed: No authorization header.');
      }

      const requests = chunks.map(({ startTime, endTime }) => {
        const apiPath = `/controller/rest/applications/${applicationName}/request-snapshots?time-range-type=BETWEEN_TIMES&start-time=${startTime}&end-time=${endTime}&need-props=true&output=json&maximum-results=10000`;

        // Full API URL combining base URL and path
        const apiUrl = `${this.baseUrl}${apiPath}`;
        return apiRequest('GET', apiUrl, authHeader, this.logger, null);
      });

      const responses = await Promise.all(requests);

      const allData = await Promise.all(
        responses.map(async (res) => {
          if (!res.ok) {
            const errorBody = await res.text();

                  if(errorBody.includes(`Invalid application id`))
                  {
                    const error = new Error(`Invalid application id ${applicationName} is specified`);

                    (error as any).status = 404; // Attach status code to error object
                    (error as any).response = {
                      status: 404,
                      data: { message: `Invalid application id ${applicationName} is specified` },
                      statusText: '',
                      headers: {},
                      config: {},
                    }; // Attach response object to error object

                    throw error;
                  } else {
                    const error = new Error(`Failed: ${res.status} ${res.statusText}`);
                    (error as any).status = res.status;
                    throw error;
                  }

          }
          return res.json();
        })
      );

      // Flatten array of arrays
      const mergedData = allData.flat();

      const errorDetails = this.extractErrorDetails(mergedData);
      const errorCountPerDay = this.calculateErrorCountPerDay(mergedData);

      return { errorDetails, errorCountPerDay };

    } catch (error: any) {
      this.logger.error('Error fetching snapshots:', error.message || error);
      throw error;
    }
  }


  private extractErrorDetails(data: any): any {
    try {
      return data.map((response: any) => ({
        summary: response.summary || 'No summary available',
        stackTrace: response.errorDetails?.map((error: any) => error.value).join('\n') || 'No stack trace available',
        serverStartTime: this.formatDate(response.serverStartTime),
        localStartTime: this.formatTime(response.localStartTime),
      }));
    } catch (error: any) {
      this.logger.error('Error extracting error details:', error);
      throw error;
    }
  }

  private formatDate(timestamp: number): string {
    try {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

      return `${day}/${month}/${year}`;
    } catch (error: any) {
      this.logger.error('Error formatting date:', error);
      throw error;
    }
  }

  private formatTime(timestamp: number): string {
    try {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${hours}:${minutes}:${seconds}`;
    } catch (error: any) {
      this.logger.error('Error formatting time:', error);
      throw error;
    }
  }

  private formatDateForErrorCount(timestamp: number): string {
    try {
      const date = new Date(timestamp);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' }); 
      return `${day} ${month}`;
    } catch (error: any) {
      this.logger.error('Error formatting date for error count:', error);
      throw error;
    }
  }

  private calculateErrorCountPerDay(data: any): any {
    try {
      const errorCount: { [key: string]: number } = {};

      data.forEach((entry: any) => {
        const date = this.formatDateForErrorCount(entry.serverStartTime);
        if (errorCount[date]) {
          errorCount[date] += 1;
        } else {
          errorCount[date] = 1;
        }
      });

      const labels = Object.keys(errorCount);
      const datasets = Object.values(errorCount);

      return { labels, datasets };
    } catch (error: any) {
      this.logger.error('Error calculating error count per day:', error);
      throw error;
    }
  }

}
