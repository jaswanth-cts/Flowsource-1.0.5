import { DateTime } from 'luxon';
import { LoggerService } from '@backstage/backend-plugin-api';

export class Resilience4jCircuitBreaker {
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

  async getResilience4jDetails(eventName: string, fromdate: string,todate: string): Promise<any> {
    const queryParams = new URLSearchParams({
      'filter[query]': `status:ok source:alert monitor @evt.name:"${eventName}"`,
      'filter[from]': fromdate,
      'filter[to]': todate,
      sort: '-timestamp',
    });
    

    const config = {
      headers: {
        'DD-API-KEY': this.api_key || '',
        'DD-APPLICATION-KEY': this.application_key || '',
      },
    };
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/events?${queryParams.toString()}`, config);
      const data = await response.json();
      const events = data?.events || [];
    
    // Handle case where no events are found
    if (!events) {
      console.warn(`No events found`);
      const error = new Error(`Event not found.`);
      (error as any).status = 404; // Simulate a 404 error
      throw error;
    }
    
    let totalDuration = 0;
    let eventCount = 0;
    let monitorId = '';
  
    events.map((event: any) => {

        // Convert duration from nanoseconds to minutes by dividing by 60000000000
        const durationInMinutes = event.attributes.attributes.duration / 60000000000; 
        monitorId = event.attributes.attributes.monitor_id;
        totalDuration += durationInMinutes;
        eventCount += 1;
      });

      // Convert ISO date to milliseconds
      const fromTs = DateTime.fromISO(fromdate).toMillis();
      const toTs = DateTime.fromISO(todate).toMillis();
      const evalTs = toTs;

      // Prepare monitor URL
      const baseUrlWithSlash = (this.baseUrl || '').endsWith('/') ? this.baseUrl || '' : `${this.baseUrl || ''}/`;
      const monitorUrl = `${baseUrlWithSlash}monitors/${monitorId}?view=spans&from_ts=${fromTs}&to_ts=${toTs}&eval_ts=${evalTs}`;

      // Calculate average duration
      const totalAverageDuration = eventCount > 0 ? totalDuration / eventCount : 0;
      const averageDuration = totalAverageDuration.toFixed(2);
      const totalDurationD = totalDuration.toFixed(2);
      return {
        monitorUrl,
        totalDurationD,
        averageDuration
      };
    } catch (error) {
      this.logger.error('Error fetching events:', error as Error);
      throw error;
    }
  }
}

