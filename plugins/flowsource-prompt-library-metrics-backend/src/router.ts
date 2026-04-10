import express from 'express';
import Router from 'express-promise-router';
import { LoggerService,RootConfigService } from '@backstage/backend-plugin-api';
import cors from 'cors';
import { PromptLibraryMetricsService } from './services/promptLibraryMetricsService';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();  
  router.use(cors());
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/metrics', async (req, res) => {
    const days = parseInt(req.query.days as string) || 120;
    const type = req.query.type as string || 'editor'; // Default to 'editor'
    logger.info(`Received request for /metrics with days=${days} and type=${type}`);

    try {
      const metricsService = new PromptLibraryMetricsService(logger, config);

      const [totalPrompts, totalUsers, topPrompts, usageOverTime] = await Promise.all([
        metricsService.fetchTotalPrompts(days),
        metricsService.fetchTotalUsers(days),
        metricsService.fetchTopPromptsByUsage(days),
        metricsService.fetchPromptUsageOverTime(days, type),
      ]);

      res.json({ totalPrompts, totalUsers, topPrompts, usageOverTime });
    } catch (error) {
      logger.error('Error fetching metrics:', error as Error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });
  

  return router;
}

