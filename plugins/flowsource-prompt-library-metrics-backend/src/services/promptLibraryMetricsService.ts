import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import { apiRequest } from './apiRequest';
type CacheEntry<T> = { value: T; timestamp: number };
const CACHE_TTL = 60 * 1000; // 1 minute
const cache = new Map<string, CacheEntry<any>>();

function getCache<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.value;
  }
  return undefined;
}

function setCache<T>(key: string, value: T) {
  cache.set(key, { value, timestamp: Date.now() });
}

export class PromptLibraryMetricsService {
  private logger: LoggerService;
  private datadogApiKey: string;
  private datadogAppKey: string;
  private datadogUrl: string;

  constructor(logger: LoggerService, config: RootConfigService) {
    this.logger = logger;
    this.datadogApiKey = config.getString('datadog.api_key');
    this.datadogAppKey = config.getString('datadog.app_key');
    this.datadogUrl = config.getString('datadog.url');
  }

  private async datadogFetch<T>(url: string, cacheKey: string, process: (data: any) => T): Promise<T> {
    const cached = getCache<T>(cacheKey);
    if (cached !== undefined) return cached;

    const response = await apiRequest(
      'GET',
      url,
      {
        'DD-API-KEY': this.datadogApiKey,
        'DD-APPLICATION-KEY': this.datadogAppKey,
        'Content-Type': 'application/json',
      },
      this.logger
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Datadog API error: ${response.status} - ${errorText}`);
      throw new Error(`Datadog API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = process(data);
    setCache(cacheKey, result);
    return result;
  }

  async fetchTotalPrompts(days: number): Promise<number> {
    this.logger.info(`Fetching total prompts for last ${days} days`);
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 86400;
    const query = 'sum:prompts_usage{*}';
    const url = `${this.datadogUrl}/api/v1/query?from=${from}&to=${now}&query=${encodeURIComponent(query)}`;
    const cacheKey = `totalPrompts:${days}`;

    return this.datadogFetch<number>(url, cacheKey, data =>
      Math.round(
        data.series?.[0]?.pointlist?.reduce((sum: number, point: [number, number]) => sum + (point[1] || 0), 0) || 0
      )
    );
  }

  async fetchTotalUsers(days: number): Promise<number> {
    this.logger.info(`Fetching total users for last ${days} days`);
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 86400;
    const query = 'count:prompts_usage{*}by{user_id}';
    const url = `${this.datadogUrl}/api/v1/query?from=${from}&to=${now}&query=${encodeURIComponent(query)}`;
    const cacheKey = `totalUsers:${days}`;

    return this.datadogFetch<number>(url, cacheKey, data => data.series?.length || 0);
  }

  async fetchTopPromptsByUsage(days: number): Promise<{ prompt: string; count: number }[]> {
    this.logger.info(`Fetching top prompts by usage for last ${days} days`);
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 86400;
    const query = 'avg:prompts_usage{*}by{category}';
    const url = `${this.datadogUrl}/api/v1/query?from=${from}&to=${now}&query=${encodeURIComponent(query)}`;
    const cacheKey = `topPrompts:${days}`;

    return this.datadogFetch(url, cacheKey, data =>
      (data.series || [])
        .map((series: any) => ({
          prompt: series.scope.replace('category:', ''),
          count: Math.round(series.pointlist.reduce((sum: number, point: [number, number]) => sum + point[1], 0)),
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5)
    );
  }

  async fetchPromptUsageOverTime(days: number, type: string): Promise<{ time: string; count: number; type: string; tag?: string }[]> {
    this.logger.info(`Fetching prompt usage over time from Datadog for type=${type}`);
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 86400;
    let query = '';
    let groupBy = '';
    if (type === 'editor') {
      query = 'sum:prompts_usage{type:editor} by {editor}';
      groupBy = 'editor';
    } else if (type === 'category') {
      query = 'sum:prompts_usage{type:category} by {category}';
      groupBy = 'category';
    } else {
      query = 'sum:prompts_usage{*}';
      groupBy = '';
    }
    const url = `${this.datadogUrl}/api/v1/query?from=${from}&to=${now}&query=${encodeURIComponent(query)}`;
    const cacheKey = `usageOverTime:${days}:${type}`;

    return this.datadogFetch(url, cacheKey, data =>
      (data.series || []).flatMap((series: any) =>
        series.pointlist.map((point: [number, number]) => ({
          time: new Date(point[0]).toISOString(),
          count: point[1],
          type,
          tag: series.scope.replace(`${groupBy}:`, '') || 'N/A',
        }))
      )
    );
  }
}

