import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class Dynatrace {
  private static readonly TOKEN_URL = 'https://sso.dynatrace.com/sso/oauth2/token'; // Hardcoded token URL
  private dataUrl: string;
  private clientId: string;
  private clientSecret: string;
  private resource: string;
  private duration: number;
  logger: LoggerService;

  constructor(clientId: string, clientSecret: string, resource: string, dataUrl: string, duration: number, logger: LoggerService) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.resource = resource;
    this.dataUrl = dataUrl;
    this.duration = duration;
    this.logger = logger;
  }

  private token: string | null = null;
  private tokenExpiration: number | null = null;

  private async getToken(): Promise<string> {
    const tokenBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      resource: this.resource,
      duration: this.duration.toString()
    });

    try {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const response = await apiRequest(
        'POST',
        Dynatrace.TOKEN_URL,
        headers,
        this.logger,
        tokenBody.toString()
    )
    
    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json(); 
      this.token = data.access_token;
      this.tokenExpiration = Date.now() + data.expires_in * 1000; // expires_in is in seconds
      if (this.token !== null) {
        return this.token;
      } else {
        throw new Error('Received null token from Dynatrace API');
      }
    } catch (error) {
      this.logger.error('Error fetching Dynatrace token:', error as Error);
      throw error;
    }
  }

  private async getValidToken(): Promise<string> {
    if (this.token && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.token;
    }
    return this.getToken();
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const time = date.toUTCString().split(' ')[4]; // Extracts the time part
    return time;
  }

  async fetchData(deploymentName: any, clusterName: any, durationConfig: any): Promise<any> {
    const token = await this.getValidToken();
    const currentDate = new Date().toISOString(); // Get current date in ISO format

    // Calculate the start date based on durationInDays
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - durationConfig);
    const defaultTimeframeStart = startDate.toISOString(); // Convert to ISO format
    const dataBody = {
      query: `fetch logs | filter loglevel == "ERROR" AND k8s.cluster.name == "${clusterName}" AND k8s.deployment.name == "${deploymentName}" | sort timestamp | limit 100`,
      defaultTimeframeStart: defaultTimeframeStart,
      defaultTimeframeEnd: currentDate, // Use current date
      maxResultRecords: 100,
      maxResultBytes: 1000000,
      fetchTimeoutSeconds: 600,
      requestTimeoutMilliseconds: 5000,
      defaultScanLimitGbytes: -1
    };
    try {

      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const response = await apiRequest(
        'POST',
        this.dataUrl,
        headers,
        this.logger,
        dataBody
    )
    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.json();
      return data.result.records.map((record: any) => ({
        formattedTimestamp: this.formatTimestamp(record.timestamp),
        formattedTime: this.formatTime(record.timestamp),
        content: record.content,
        loglevel: record.loglevel,
        'k8s.node.name': record['k8s.node.name'],
        'k8s.pod.name': record['k8s.pod.name'],
        'dt.process.name': record['dt.process.name'],
        'process.technology': record['process.technology'],
        'k8s.cluster.name': record['k8s.cluster.name'],
        'k8s.namespace.name': record['k8s.namespace.name'],
      }));
    } catch (error) {
      this.logger.error('Error fetching data:', error as Error);
      throw error;
    }
  }

  async fetchDetails(deploymentName: any, clusterName: any, durationConfig: any) {
    try {
      let dynatracedata = { tabledata: [], barchartdata: {} };
      const data = await this.fetchData(deploymentName, clusterName, durationConfig);

      // Calculate error counts for each date
      const errorCounts: { [key: string]: number } = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      data.forEach((record: any) => {
        const [day, month] = record.formattedTimestamp.split('/');
        const formattedDate = `${day}-${monthNames[parseInt(month, 10) - 1]}`;
        if (errorCounts[formattedDate]) {
          errorCounts[formattedDate]++;
        } else {
          errorCounts[formattedDate] = 1;
        }
      });

      // Format error counts for chart
      const labels = Object.keys(errorCounts);
      const dataPoints = Object.values(errorCounts);
      const formattedErrorCounts = {
        labels: labels,
        datasets: dataPoints
      };
      dynatracedata.tabledata = data;
      dynatracedata.barchartdata = formattedErrorCounts;
      return dynatracedata;

    } catch (error) {
      this.logger.error('Error in execute function:', error as Error);
      throw error;
    }
  }
}
