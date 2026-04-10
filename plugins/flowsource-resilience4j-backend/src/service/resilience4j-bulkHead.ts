import { DateTime } from 'luxon';
import { LoggerService } from '@backstage/backend-plugin-api';

export class Resilience4jBulkHead {
  private baseUrl?: string;
  private api_key?: string;
  private application_key?: string;
  logger: LoggerService;

  constructor(logger:LoggerService, baseUrl?: string, api_key?: string, application_key?: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
    this.api_key = api_key;
    this.application_key = application_key;
  }

  async getBulkheadDetails(from: string, to: string , applicationName: string): Promise<any> {

    const query1 = `min:resilience4j.bulkhead.max.allowed.concurrent.calls{application:${applicationName}}`;
    const query2 = `min:resilience4j.bulkhead.available.concurrent.calls{application:${applicationName}}`;

    const url1 = `${this.baseUrl}/api/v1/query?from=${from}&to=${to}&query=${query1}`;
    const url2 = `${this.baseUrl}/api/v1/query?from=${from}&to=${to}&query=${query2}`;

    const config = {
      headers: {
        'DD-API-KEY': this.api_key || '',
        'DD-APPLICATION-KEY': this.application_key || '',
      },
    };

    try {
      const [response1, response2] = await Promise.all([
        fetch(url1, config).then(res => res.json()),
        fetch(url2, config).then(res => res.json()),
      ]);
      
      // Check if the series array is empty for either response
      if (!response1.series || response1.series.length === 0) {
        console.error(`No data found for application '${applicationName}' in query1.`);
        const error = new Error(`Application not found.`);
        (error as any).status = 404; // Simulate a 404 error
        throw error;
      }
      
      const series1 = response1.series ? response1.series[0].pointlist : undefined;
      const series2 = response2.series ? response2.series[0].pointlist : undefined;
      const interval1 = response1.series ? response1.series[0].interval : undefined;
      const interval2 = response2.series ? response2.series[0].interval : undefined;

      const result = series1 ? series1.map(([x1, y1]: [number, number]) => {
        const match = series2.find(([x2]: [number]) => x2 === x1);
        if (match) {
          const [, y2] = match;

          // If the interval is greater than 60 minutes, y1 and y2 represent the average values.
          // Convert y1 and y2 to their actual values.
          const adjustedY1 = interval1 ? ((interval1 >= 60 ? interval1 / 60 : 1) * y1) / 60 : 0;
          const adjustedY2 = interval2 ? ((interval2 >= 60 ? interval2 / 60 : 1) * y2) / 60 : 0;   
          return {
            timestamp: DateTime.fromSeconds(x1).toFormat('dd-MM-yyyy HH:mm:ss'),
            value: adjustedY1 - adjustedY2,
          };
        }
        return null;
      }).filter((item: any) => item !== null) : undefined;

      // Calculate the average value
      const total = result ? result.reduce((sum: any, item: { value: any; }) => sum + item.value, 0).toFixed(2) : 0.00;
      const avgValue = (total / result.length).toFixed(2);
      return { result, avgValue, total };

    } catch (error) {
      this.logger.error('Error fetching bulkhead details:', error as Error);
      throw error;
    }
  }
}
