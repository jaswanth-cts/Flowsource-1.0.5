import express from 'express';
import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import { invokeAwsApi } from './services/signers/awsInvoke';
import { signAzureRequest, signAzureRequestStream } from './services/signers/azureSigner';
import { Readable } from 'stream';
import { signGcpRequest } from './services/signers/gcpSigner';
import xss from 'xss';
export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { logger, config } = options;
  const router = express.Router();
  // Increase JSON body limit to support image attachments sent as bytes
  router.use(express.json({ limit: '10mb' }));

  const pdlcConfig = config.getConfig('pdlc');
  const cloudProvider = pdlcConfig.getOptionalString('cloudProvider')?.toLowerCase().trim();

  if (!cloudProvider) {
    logger.error('PDLC plugin misconfigured: Missing cloudProvider');
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'Missing cloudProvider. Please ask your administrator to configure the PDLC plugin.',
      });
    });
    return router;
  }

  logger.info(`PDLC cloudProvider: ${cloudProvider}`);

  let isValidConfig = false;
  let errorDetails: string[] = [];

  if (cloudProvider === 'aws') {
    const awsConfig = pdlcConfig.getOptionalConfig('aws');
    const region = awsConfig?.getOptionalString('region') ?? '';
    const apiId = awsConfig?.getOptionalString('apiId') ?? '';
    const stage = awsConfig?.getOptionalString('stage') ?? '';

    if (!region || !apiId || !stage) {
      errorDetails.push(`Missing AWS config: ${[
        !region && 'region',
        !apiId && 'apiId',
        !stage && 'stage',
      ]
        .filter(Boolean)
        .join(', ')}`);
    } else {
      isValidConfig = true;
    }

  } else if (cloudProvider === 'azure') {
    const azureConfig = pdlcConfig.getOptionalConfig('azure');
    const targetUrl = azureConfig?.getOptionalString('targetUrl') ?? '';
    const clientID = azureConfig?.getOptionalString('clientID') ?? '';
    const apiKey = azureConfig?.getOptionalString('apiKey') ?? '';

    if (!targetUrl || !clientID || !apiKey) {
      errorDetails.push(`Missing Azure config: ${[
        !targetUrl && 'targetUrl',
        !clientID && 'clientID',
        !apiKey && 'apiKey',
      ]
        .filter(Boolean)
        .join(', ')}`);
    } else {
      isValidConfig = true;
    }

  } else if (cloudProvider === 'gcp') {
    const gcpConfig = pdlcConfig.getOptionalConfig('gcp');
    const targetUrl = gcpConfig?.getOptionalString('targetUrl') ?? '';

    if (!targetUrl) {
      errorDetails.push('Missing GCP config: targetUrl');
    } else {
      isValidConfig = true;
    }

  } else {
    logger.error(`Unsupported cloudProvider: ${cloudProvider}`);
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: `Unsupported cloudProvider: ${cloudProvider}`,
      });
    });
    return router;
  }

  if (!isValidConfig) {
    logger.error(`PDLC plugin misconfigured: ${errorDetails.join('; ')}`);
    router.use((_req, res) => {
      res.status(503).send({
        success: false,
        error: 'PDLC plugin misconfigured',
        details: errorDetails,
      });
    });
    return router;
  }

  // Health check
  router.get('/health', (_req, res) => {
    logger.info('PDLC backend health check');
    res.json({ status: 'ok' });
  });

  // Config check endpoint
  router.get('/config-check', (_req, res) => {
    let configErrors: string[] = [];
    if (!cloudProvider) {
      configErrors.push('Missing cloudProvider');
    } else if (cloudProvider === 'aws') {
      const awsConfig = pdlcConfig.getOptionalConfig('aws');
      const region = awsConfig?.getOptionalString('region') ?? '';
      const apiId = awsConfig?.getOptionalString('apiId') ?? '';
      const stage = awsConfig?.getOptionalString('stage') ?? '';
      if (!region || !apiId || !stage) {
        configErrors.push(`Missing AWS config: ${[!region && 'region', !apiId && 'apiId', !stage && 'stage'].filter(Boolean).join(', ')}`);
      }
    } else if (cloudProvider === 'azure') {
      const azureConfig = pdlcConfig.getOptionalConfig('azure');
      const targetUrl = azureConfig?.getOptionalString('targetUrl') ?? '';
      const clientID = azureConfig?.getOptionalString('clientID') ?? '';
      const apiKey = azureConfig?.getOptionalString('apiKey') ?? '';
      if (!targetUrl || !clientID || !apiKey) {
        configErrors.push(`Missing Azure config: ${[!targetUrl && 'targetUrl', !clientID && 'clientID', !apiKey && 'apiKey'].filter(Boolean).join(', ')}`);
      }
    } else if (cloudProvider === 'gcp') {
      const gcpConfig = pdlcConfig.getOptionalConfig('gcp');
      const targetUrl = gcpConfig?.getOptionalString('targetUrl') ?? '';
      if (!targetUrl) {
        configErrors.push('Missing GCP config: targetUrl');
      }
    } else {
      configErrors.push(`Unsupported cloudProvider: ${cloudProvider}`);
    }
    if (configErrors.length > 0) {
      logger.error(`Config check failed: ${configErrors.join('; ')}`);
      return res.status(503).json({ success: false, error: 'PDLC plugin misconfigured', details: configErrors });
    }
    return res.json({ success: true, message: 'PDLC plugin config is valid.' });
  });

  // Main handler
  router.post('/pdlc', async (req, res) => {
    try {
      if (cloudProvider === 'aws') {
        const awsConfig = pdlcConfig.getConfig('aws');
        const region = awsConfig.getString('region');
        const apiId = awsConfig.getString('apiId');
        const stage = awsConfig.getString('stage');

        const awsResponse = await invokeAwsApi(req, region, apiId, stage, logger);
        return res.json(awsResponse);

      } else if (cloudProvider === 'azure') {
        const azureConfig = pdlcConfig.getConfig('azure');
        const targetUrl = azureConfig.getString('targetUrl');
        const clientID = azureConfig.getString('clientID');
        const apiKey = azureConfig.getString('apiKey');

        // If streaming is requested, transparently proxy the stream
        const wantsStream = req.query.stream === '1' || req.headers['x-stream'] === '1';
        if (wantsStream) {
          const upstream = await signAzureRequestStream(req, { targetUrl, clientID, apiKey }, logger);

          // Forward status and headers sensibly for streaming
          const ct = upstream.headers.get('content-type') || 'text/plain; charset=utf-8';
          res.status(upstream.ok ? 200 : upstream.status);
          res.setHeader('Content-Type', ct.includes('text/event-stream') ? 'text/event-stream; charset=utf-8' : ct);
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');

          const body = upstream.body as any;
          if (!body) {
            return res.end();
          }
          try {
            const nodeStream = typeof Readable.fromWeb === 'function' ? Readable.fromWeb(body) : (body as any);
            nodeStream.on('data', (chunk: Buffer) => {
              try {
                // Convert the chunk to a string and sanitize it
                const sanitizedChunk = xss(chunk.toString());
                res.write(sanitizedChunk); // Write sanitized data to the response
              } catch (err) {
                logger.error(`Failed to sanitize chunk: ${err}`);
                res.end(); // End the response if sanitization fails
              }
            });
            nodeStream.on('end', () => res.end());
            nodeStream.on('error', (err: any) => {
              logger.error(`Stream error from upstream: ${err?.message || err}`);
              try { res.end(); } catch {}
            });
            return; // Response handled as stream
          } catch (e: any) {
            logger.error(`Failed to proxy stream: ${e?.message || e}`);
            // Fallback to non-stream flow
          }
        }

        const result = await signAzureRequest(req, { targetUrl, clientID, apiKey }, logger);
        return res.json(result);

      } else if (cloudProvider === 'gcp') {
        const gcpConfig = pdlcConfig.getConfig('gcp');
        const targetUrl = gcpConfig.getString('targetUrl');

        const result = await signGcpRequest(req, targetUrl);
        return res.json(result);
      }

      return res.status(503).json({ success: false, error: 'PDLC plugin not configured.' });

    } catch (error: any) {
      logger.error(`PDLC handler error: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
