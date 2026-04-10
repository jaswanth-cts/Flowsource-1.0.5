import { DateTime } from 'luxon';
import { LoggerService } from '@backstage/backend-plugin-api';

export class Resilience4jRateLimiter {
  logger: LoggerService;
  private baseUrl?: string;
  private api_key?: string;
  private application_key?: string;

  constructor(logger: LoggerService, baseUrl?: string, api_key?: string, application_key?: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
    this.api_key = api_key;
    this.application_key = application_key;
  }

  async getRateLimiterDetails(from: string, to: string ,  applicationName: string): Promise<any> {

    const query1 = `min:resilience4j.ratelimiter.waiting_threads{application:${applicationName}}`;
    
    const url1 = `${this.baseUrl}/api/v1/query?from=${from}&to=${to}&query=${query1}`;
    

    const headers = {
      'DD-API-KEY': this.api_key || '',
      'DD-APPLICATION-KEY': this.application_key || '',
    };

    try {
      const response1 = await fetch(url1, { headers });
      const data1 = await response1.json();
      // Handle case where no data is found for the application
      if (!data1.series || data1.series.length === 0) {
        console.warn(`No rate limiter data found for application '${applicationName}'.`);
        const error = new Error(`Application '${applicationName}' not found.`);
        (error as any).status = 404; // Simulate a 404 error
        throw error;
      }
      const series1 = data1.series ? data1.series[0].pointlist : undefined;
      const result = series1 ? series1.map(([x1, y1]: [number, number]) => {
      
          return {
            // Convert timestamp from seconds to formatted date-time string
            timestamp: DateTime.fromSeconds(x1).toFormat('dd-MM-yyyy HH:mm:ss'),
            value: y1
          };
      }).filter((item: any) => item !== null) : undefined;

      // Convert interval to minutes if it's greater than or equal to 60
      const intervalInMins = data1.series[0].interval >= 60 ? data1.series[0].interval / 60 : 1;
      // Calculate the total and average values
      const total = result ? result.reduce((sum: any, item: { value: any; }) => sum + item.value, 0) : 0.00;
      const avgValue = (total / result.length).toFixed(2);
      
     // If the interval is greater than 60 minutes, Total represents the sum of average values.
     // Convert Total to its actual value.
      const totalCount = (intervalInMins*total).toFixed(2);

      return { result, totalCount,avgValue };

    } catch (error) {
      this.logger.error('Error fetching ratelimiter details:', error as Error);
      throw error;
    }
  }
}
