
import express from 'express';
import { errorHandler } from '@backstage/backend-common';
import Router from 'express-promise-router';
import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import { datadogService } from './datadog.service';
import { Config } from '@backstage/config';
import helmet from 'helmet';
import xss from 'xss';
import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const {
    datadogUrl,
    datadogApiKey,
    datadogAppKey,
    apiVerion,
    datadogMaxResults,
    duration
  } = getConfigs(config);

  const router = Router();

  router.use((_req, res, next) => {
    try {
      new URL(datadogUrl);
    } catch (_) {
      return res.status(503).send({
        success: false,
        error: 'Invalid Datadog URL. Please ask your administrator to configure it'
      });
    }

    if (!datadogApiKey || !datadogAppKey || !apiVerion) {
      return res.status(503).send({
        success: false,
        error: 'This plugin has not been configured with the required values. Please ask your administrator to configure it'
      });
    }

    next();
    return;
  });

  const datadogSvc = new datadogService(
    datadogUrl,
    datadogApiKey,
    datadogAppKey,
    apiVerion,
    logger,
  );

  logger.debug(
    'datadog Service created : ' + datadogSvc + ' for events : ' + datadogUrl,
  );

  // const router = Router();
  router.use(
    helmet.hsts({
      maxAge: 31536000, // One year in seconds
      includeSubDomains: true,
      preload: true,
    }),
  );
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  function buildRequestBody(
    queryParams: string,
    from: string,
    to: string,
    cursor: any,
  ) {
    return {
      filter: {
        query: queryParams + ' AND status:error',
        indexes: ['main'],
        from: from,
        to: to,
      },
      sort: '-timestamp',
      page: {
        limit: datadogMaxResults ? datadogMaxResults : 1000,
        cursor: cursor ? cursor : null,
      },
    };
  }

  router.post('/error', async (request, response) => {
    let query = request.body.query;
    logger.info('query=' + query);
    query = xss(String(query));
    let tagFilterKey = '';
    if (query === '' || query.length === 0) {
      logger.error('Tags are not available');
      response
        .status(400)
        .send('Tags are not defined for this service/application');
    } else {
      query.split(' AND ').map((item: string) => {
        if (tagFilterKey !== '') {
          if (item.split(':')[0] !== 'status') {
            tagFilterKey = tagFilterKey + `,'${item.split(':')[0]}'`;
          }
        }
        if (item.split(':')[0] !== 'status') {
          tagFilterKey = `${item.split(':')[0]}`;
        }

      });
      let durationInDays = duration ? duration : 3;
      logger.info('duration=' + duration)
      logger.info('durationInDays=' + durationInDays)
      
      const to = new Date().toISOString(); //format: ''2024-03-10T11:48:36+01:00'
      const from = new Date(
        new Date().setDate(new Date().getDate() - durationInDays), //4: this can be made configurable
      ).toISOString();
      const body = buildRequestBody(query, from, to, null);
      let output = await datadogSvc.searchAppErrors(body);
      await fetchNextPageData(
        output,
        logger,
        buildRequestBody,
        query,
        from,
        to,
        datadogSvc,
      );
      if (output && output.data?.length > 0) {
        output.data.forEach((element: any) => {
          if (element !== undefined && element.attributes !== undefined && element.attributes?.tags !== undefined) {
            element.attributes.tags = element.attributes?.tags.filter(
              (tag: string) => tag.includes(tagFilterKey))[0];
          }
        });
      }
      // Add duration to the meta section of the output
      output.meta.duration = durationInDays;
      output = JSON.parse(xss(JSON.stringify(output)));
      response.status(200).json(output);
    }
  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });
  router.post('/create-latency-monitor', async (req, res) => {
    try {
      const { tags, name, message, options } = req.body;
      const monitorName = name || 'Default Latency Monitor';
      const monitorOptions = options || {
        thresholds: {
          critical: 0.5,
          warning: 0.3,
        },
        notify_no_data: true,
        notify_audit: false,
        require_full_window: true,
        include_tags: true,
        evaluation_delay: 900,
        new_host_delay: 300,
        no_data_timeframe: 10,
        renotify_interval: 60,
      };
      const criticalThreshold = monitorOptions.thresholds.critical;
      const updatedQuery = `avg(last_5m):p95:trace.servlet.request.duration{*} > ${criticalThreshold}`;
      const notificationMessage = message || "High latency detected! Notify: @default.email@example.com";
      const monitorData = {
        name: monitorName,
        type: "query alert",
        query: updatedQuery,
        message: notificationMessage,
        tags,
        options: monitorOptions,
        priority: 3,
      };
      // Log monitorData before and after sanitization
      const sanitizedMonitorData = JSON.parse(
        xss(JSON.stringify(monitorData)).replace(/&gt;/g, '>')
      );
      const createResponse = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
        body: JSON.stringify(sanitizedMonitorData),
      });

      if (createResponse.ok) {
        const responseData = await createResponse.json();
        // Sanitize all fields before embedding them in the response
        const monitorUrl = `${datadogUrl}monitors/${responseData.id}`;
        const sanitizedMonitorUrl = xss(monitorUrl);
        const sanitizedMessage = xss('Monitor created successfully!');
        
        res.status(200).send({ message: sanitizedMessage, sanitizedMonitorData, monitorUrl: sanitizedMonitorUrl }); // Send the monitor data back in the response
      } else {
        const errorData = await createResponse.json();
        const sanitizedErrorData = xss(JSON.stringify(errorData.errors)); // Sanitize errorData.errors
        res.status(400).send({ 
          error: `Error creating monitor: ${sanitizedErrorData}` 
        });
      }
    } catch (error) {
      console.error('Error creating monitor:', error);
      res.status(500).send({ error: 'An error occurred while creating the monitor.' });
    }
  });
  router.get('/check-monitor-exists', async (req, res) => {
    try {
      const { name } = req.query;
      if (typeof name !== 'string') {
        return res.status(400).send({ error: 'Invalid name parameter' });
      }
      const decodedName = decodeURIComponent(name);
      const response = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Log data before and after sanitization
        const sanitizedData = JSON.parse(xss(JSON.stringify(data)));
        const monitorExists = sanitizedData.some((monitor: { name: string }) => monitor.name === decodedName);
        const monitor = sanitizedData.find((monitor: { name: string }) => monitor.name === decodedName);
        const monitorUrl = monitorExists ? `https://us3.datadoghq.com/monitors/${monitor.id}` : null;
        return res.status(200).send({ exists: monitorExists, url: monitorUrl });
      } else {
        const errorMessage = 'Error checking monitor existence';
        // Log error message before and after sanitization
        const sanitizedErrorMessage = xss(errorMessage);        
        return res.status(400).send({ error: sanitizedErrorMessage });
      }
    } catch (error) {
      console.error('Error checking monitor existence:', error);
      return res.status(500).send({ error: 'An error occurred while checking monitor existence.' });
    }
  });
  router.post('/create-traffic-monitor', async (req, res) => {
    try {
      const { tags, name, message, options } = req.body;
      const monitorName = name || 'Default Traffic Monitor';
      const monitorOptions = options || {
        thresholds: {
          critical: 3,
          warning: 2,
        },
        notify_no_data: true,
        notify_audit: false,
        require_full_window: true,
        include_tags: true,
        evaluation_delay: 900,
        new_host_delay: 300,
        no_data_timeframe: 10,
        renotify_interval: 60,
      };
      const criticalThreshold = monitorOptions.thresholds.critical;
      const updatedQuery = `sum(last_5m):sum:trace.servlet.request.hits{*}.as_count() > ${criticalThreshold}`;
      const notificationMessage = message || "High traffic detected! Notify: @default.email@example.com";
      const monitorData = {
        name: monitorName,
        type: "query alert",
        query: updatedQuery,
        message: notificationMessage,
        tags,
        options: monitorOptions,
        priority: 3,
      };
      // Log monitorData before and after sanitization
      const sanitizedMonitorData = JSON.parse(
        xss(JSON.stringify(monitorData)).replace(/&gt;/g, '>')
      );
      const createResponse = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
        body: JSON.stringify(sanitizedMonitorData),
      });

      if (createResponse.ok) {
        const responseData = await createResponse.json();
        const monitorUrl = `https://us3.datadoghq.com/monitors/${responseData.id}`;
        const sanitizedMonitorUrl = xss(monitorUrl);
        const sanitizedMessage = xss('Traffic monitor created successfully!');
        res.status(200).send({ message: sanitizedMessage, sanitizedMonitorData, monitorUrl: sanitizedMonitorUrl });
      } else {
        const errorData = await createResponse.json();
        // Log errorData before and after sanitization
        const sanitizedErrorData = xss(JSON.stringify(errorData.errors));
        res.status(400).send({ error: `Error creating traffic monitor: ${sanitizedErrorData}` });
      }
    } catch (error) {
      console.error('Error creating traffic monitor:', error);
      res.status(500).send({ error: 'An error occurred while creating the traffic monitor.' });
    }
  });
  router.get('/check-traffic-monitor-exists', async (req, res) => {
    try {
      const { name } = req.query;
      if (typeof name !== 'string') {
        return res.status(400).send({ error: 'Invalid name parameter' });
      }
      const decodedName = decodeURIComponent(name);
      const response = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Log data before and after sanitization
        const sanitizedData = JSON.parse(xss(JSON.stringify(data)));
        const monitorExists = sanitizedData.some((monitor: { name: string }) => monitor.name === decodedName);
        const monitor = sanitizedData.find((monitor: { name: string }) => monitor.name === decodedName);
        const monitorUrl = monitorExists ? `https://us3.datadoghq.com/monitors/${monitor.id}` : null;
        return res.status(200).send({ exists: monitorExists, url: monitorUrl });
      } else {
        const errorMessage = 'Error checking traffic monitor existence';
        // Log error message before and after sanitization
        const sanitizedErrorMessage = xss(errorMessage);      
        return res.status(400).send({ error: sanitizedErrorMessage });
      }
    } catch (error) {
      console.error('Error checking traffic monitor existence:', error);
      return res.status(500).send({ error: 'An error occurred while checking traffic monitor existence.' });
    }
  });
  router.post('/create-error-monitor', async (req, res) => {
    try {
      const { tags, name, message, options } = req.body;
      const monitorName = name || 'Default Error Monitor';
      const monitorOptions = options || {
        thresholds: {
          critical: 5,
          warning: 3,
        },
        notify_no_data: true,
        notify_audit: false,
        require_full_window: true,
        include_tags: true,
        evaluation_delay: 900,
        new_host_delay: 300,
        no_data_timeframe: 10,
        renotify_interval: 60,
      };
      const criticalThreshold = monitorOptions.thresholds.critical;
      const updatedQuery = `avg(last_5m):avg:trace.servlet.request.errors{*} > ${criticalThreshold}`;
      const notificationMessage = message || "High error rate detected! Notify: @default.email@example.com";
      const monitorData = {
        name: monitorName,
        type: "query alert",
        query: updatedQuery, // Include the constructed query
        message: notificationMessage,
        tags,
        options: monitorOptions,
        priority: 3,
      };
      // Log monitorData before and after sanitization
      const sanitizedMonitorData = JSON.parse(
        xss(JSON.stringify(monitorData)).replace(/&gt;/g, '>')
      );
      const createResponse = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
        body: JSON.stringify(sanitizedMonitorData),
      });

      if (createResponse.ok) {
        const responseData = await createResponse.json();
        const monitorUrl = `${datadogUrl}monitors/${responseData.id}`;
        const sanitizedMonitorUrl = xss(monitorUrl);
        const sanitizedMessage = xss('Error monitor created successfully!');
        res.status(200).send({ message: sanitizedMessage, sanitizedMonitorData, monitorUrl: sanitizedMonitorUrl });
      } else {
        const errorData = await createResponse.json();
        // Log errorData before and after sanitization
        const sanitizedErrorData = xss(JSON.stringify(errorData.errors));
        
        res.status(400).send({ 
          error: `Error creating error monitor: ${sanitizedErrorData}` 
        });
        //res.status(400).send({ error: `Error creating error monitor: ${JSON.stringify(errorData.errors)}` });
      }
    } catch (error) {
      console.error('Error creating error monitor:', error);
      res.status(500).send({ error: 'An error occurred while creating the error monitor.' });
    }
  });
  router.get('/check-error-monitor-exists', async (req, res) => {
    try {
      const { name } = req.query;
      if (typeof name !== 'string') {
        return res.status(400).send({ error: 'Invalid name parameter' });
      }
      const decodedName = decodeURIComponent(name);
      const response = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Log data before and after sanitization
        const sanitizedData = JSON.parse(xss(JSON.stringify(data)));
        const monitorExists = sanitizedData.some((monitor: { name: string }) => monitor.name === decodedName);
        const monitor = sanitizedData.find((monitor: { name: string }) => monitor.name === decodedName);
        const monitorUrl = monitorExists ? `https://us3.datadoghq.com/monitors/${monitor.id}` : null;
        return res.status(200).send({ exists: monitorExists, url: monitorUrl });
      } else {
        const errorMessage = 'Error checking error monitor existence';
        // Log error message before and after sanitization
        const sanitizedErrorMessage = xss(errorMessage);
        return res.status(400).send({ error: sanitizedErrorMessage });
      }
    } catch (error) {
      console.error('Error checking error monitor existence:', error);
      return res.status(500).send({ error: 'An error occurred while checking error monitor existence.' });
    }
  });
  router.post('/create-saturation-monitor', async (req, res) => {
    try {
      const { tags, name, message, options } = req.body;
      const monitorName = name || 'Default Saturation Monitor';
      const monitorOptions = options || {
        thresholds: {
          critical: 600,
          warning: 200,
        },
        notify_no_data: true,
        notify_audit: false,
        require_full_window: true,
        include_tags: true,
        evaluation_delay: 900,
        new_host_delay: 300,
        no_data_timeframe: 10,
        renotify_interval: 60,
      };

      // Construct the query for saturation
      const criticalThreshold = monitorOptions.thresholds.critical;
      const updatedQuery = `avg(last_5m):avg:system.mem.used{*} > ${criticalThreshold}`;
      const notificationMessage = message || "High saturation detected! Notify: @default.email@example.com";

      // Monitor data payload
      const monitorData = {
        name: monitorName,
        type: "query alert",
        query: updatedQuery, // Include the constructed query
        message: notificationMessage,
        tags,
        options: monitorOptions,
        priority: 3,
      };
      // Log monitorData before and after sanitization
      const sanitizedMonitorData = JSON.parse(
        xss(JSON.stringify(monitorData)).replace(/&gt;/g, '>')
      );
      // Make the API call to Datadog to create the monitor
      const createResponse = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
        body: JSON.stringify(sanitizedMonitorData),
      });

      if (createResponse.ok) {
        const responseData = await createResponse.json();
        const monitorUrl = `${datadogUrl}monitors/${responseData.id}`;
        const sanitizedMonitorUrl = xss(monitorUrl);
        const sanitizedMessage = xss('saturation monitor created successfully!');
        res.status(200).send({ message: sanitizedMessage, sanitizedMonitorData, monitorUrl: sanitizedMonitorUrl });
      } else {
        const errorData = await createResponse.json();
        // Log errorData before and after sanitization
        const sanitizedErrorData = xss(JSON.stringify(errorData.errors));
        res.status(400).send({ 
          error: `Error creating error monitor: ${sanitizedErrorData}` 
        });
      }
    } catch (error) {
      console.error('Error creating saturation monitor:', error);
      res.status(500).send({ error: 'An error occurred while creating the saturation monitor.' });
    }
  });
  router.get('/check-saturation-monitor-exists', async (req, res) => {
    try {
      const { name } = req.query;

      // Validate the `name` query parameter
      if (typeof name !== 'string') {
        return res.status(400).send({ error: 'Invalid name parameter' });
      }

      const decodedName = decodeURIComponent(name);

      // Make the API call to Datadog to fetch all monitors
      const response = await fetch(`${datadogUrl}/api/v1/monitor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogApiKey,
          'DD-APPLICATION-KEY': datadogAppKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Log data before and after sanitization
        const sanitizedData = JSON.parse(xss(JSON.stringify(data)));
        const monitorExists = sanitizedData.some((monitor: { name: string }) => monitor.name === decodedName);
        const monitor = sanitizedData.find((monitor: { name: string }) => monitor.name === decodedName);
        const monitorUrl = monitorExists ? `https://us3.datadoghq.com/monitors/${monitor.id}` : null;
        return res.status(200).send({ exists: monitorExists, url: monitorUrl });
      } else {
        const errorMessage = 'Error checking saturation monitor existence';
        // Log error message before and after sanitization
        const sanitizedErrorMessage = xss(errorMessage);
        return res.status(400).send({ error: sanitizedErrorMessage });
      }
    } catch (error) {
      console.error('Error checking saturation monitor existence:', error);
      return res.status(500).send({ error: 'An error occurred while checking saturation monitor existence.' });
    }
  });

  router.use(errorHandler());
  return router;
}

async function fetchNextPageData(
  output: any,
  logger: LoggerService,
  buildRequestBody: (
    queryParams: string,
    from: string,
    to: string,
    cursor: any,
  ) => {
    filter: { query: string; indexes: string[]; from: string; to: string };
    sort: string;
    page: { cursor: string; limit: number };
  },
  queryParams: string,
  from: string,
  to: string,
  datadogSvc: datadogService,
) {
  if (!output.meta?.page?.after) {
    logger.info('no more data to fetch');
    return;
  }
  let cursor = output.meta.page.after;
  while (cursor) {
    const nextBody = buildRequestBody(queryParams, from, to, cursor);
    const nextOutput = await datadogSvc.searchAppErrors(nextBody);
    logger.info('next ouputdata count = ' + nextOutput.data?.length);//NEED TO remove this
    if(!nextOutput.data){
    output.data = output.data.concat(nextOutput?.data);
    }
    cursor = nextOutput.meta?.page?.after ? nextOutput.meta.page.after : null;
  }
}

function getConfigs(config: Config) {
  const datadogUrl = config.getOptionalString('datadog.url') || '';
  const datadogApiKey = config.getOptionalString('datadog.api_key') || '';
  const datadogAppKey = config.getOptionalString('datadog.app_key') || '';
  const datadogMaxResults = config.getOptionalNumber('datadog.max_row_fetch') || 1000;
  const apiVerion = config.getOptionalString('datadog.api_version') || '';
  const duration = config.getOptionalNumber('datadog.duration') || 4;

  return {
    datadogUrl,
    datadogApiKey,
    datadogAppKey,
    apiVerion,
    datadogMaxResults,
    duration
  };
}
