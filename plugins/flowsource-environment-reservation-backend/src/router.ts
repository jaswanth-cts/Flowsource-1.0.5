import { InputError } from '@backstage/errors';
import { PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { EnvironmentReservationService } from './services/environmentReservation.service';
import { BookingRequestsService } from './services/bookingRequests.service';
import { Knex } from 'knex';

export async function createRouter({
  logger,
  database,
}: {
  logger: LoggerService;
  database: PluginDatabaseManager;
}): Promise<express.Router> {
  logger.info('Creating maintenance requests router...');
  const router = Router();
  router.use(express.json());
    
  const db:Knex = await database.getClient();

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/maintenance-requests', async (_req, res) => {
    
      const appid = _req.query.appid as string;
      if (!appid) {
        throw new InputError('appid query parameter is required');
      }
      logger.info(`Fetching maintenance requests for appid: ${appid}`); 
      try {
      const environmentReservationService = new EnvironmentReservationService(db, logger);
      const environmentReservation = await environmentReservationService.getEnvironmentReservation(appid);
      res.json(environmentReservation);
    } catch (error) {
      logger.error(`Error fetching maintenance requests for appid ${appid}: ${error}`);
      res.status(500).json({ error: 'Failed to fetch maintenance requests' });
    }
  });

  router.post('/maintenance-request', async (req, res) => {
    const appid = req.query.appid as string;
    try {
      const { name, description, startDate, endDate, status, environment, requestor, createdDate } = req.body;
      if (!appid || !name) {
        throw new InputError('appid and name are required');
      }
      logger.info(`Creating maintenance request for appid: ${appid}, name: ${name}`);
      const environmentReservationService = new EnvironmentReservationService(db, logger);
      await environmentReservationService.createEnvironmentReservation({
        appid,
        name,
        description,
        startDate,
        endDate,
        status,
        environment,
        requestor,
        createdDate
      });
      res.status(201).json({ message: 'Maintenance request created successfully' });
    } catch (error) {
      logger.error(`Error creating maintenance request for appid ${appid}: ${error}`);
      res.status(500).json({ error: 'Failed to create maintenance request' });
    }
  });

  router.get('/booking-requests', async (_req, res) => {
    const appid = _req.query.appid as string;
    if (!appid) {
      throw new InputError('appid query parameter is required');
    }
    logger.info(`Fetching booking requests for appid: ${appid}`);
    try {
      const bookingRequestsService = new BookingRequestsService(db, logger);
      const bookingRequests = await bookingRequestsService.getBookingRequests(appid);
      res.json(bookingRequests);
    } catch (error) {
      logger.error(`Error fetching booking requests for appid ${appid}: ${error}`);
      res.status(500).json({ error: 'Failed to fetch booking requests' });
    }
  });

  router.post('/booking-request', async (req, res) => {
    const appid = req.query.appid as string;
    const { name, description, startDate, endDate, status, requestedBy, createdDate} = req.body;
    if (!appid || !name) {
      throw new InputError('appid and name are required');
    }
    logger.info(`Creating booking request for appid: ${appid}, name: ${name}`);
    try {
      const bookingRequestsService = new BookingRequestsService(db, logger);
      await bookingRequestsService.createBookingRequest({
        appid,
        name,
        description,
        startDate,
        endDate,
        status,
        requestedBy,
        createdDate
      });

      res.status(201).json({ message: 'Bookings request created successfully' });
    } catch (error) {
      logger.error(`Error creating bookings request for appid ${appid}: ${error}`);
      res.status(500).json({ error: 'Failed to create booking request' });
    }
  });

  router.put('/maintenance-request', async (req, res) => {
    const appid = req.query.appid as string;
    const name = req.query.name as string;
    const { description, startDate, endDate, status, environment, requestor } = req.body;
    if (!appid || !name) {
      throw new InputError('appid and name are required');
    }
    logger.info(`Updating maintenance request for appid: ${appid}, name: ${name}`);
    try {
      const environmentReservationService = new EnvironmentReservationService(db, logger);
      await environmentReservationService.updateEnvironmentReservation(appid, name, { description, startDate, endDate, status, environment, requestor });
      res.status(200).json({ message: 'Maintenance request updated successfully' });
    } catch (error) {
      logger.error(`Error updating maintenance request for appid ${appid}, name ${name}: ${error}`);
      res.status(500).json({ error: 'Failed to update maintenance request' });
    }
  });
  router.put('/booking-request', async (req, res) => {
    const appid = req.query.appid as string;
    const name = req.query.name as string;
    const { description, startDate, endDate, status, requestedBy } = req.body;
    if (!appid || !name) {
      throw new InputError('appid and name are required');
    }
    logger.info(`Updating booking request for appid: ${appid}, name: ${name}`);
    try {
      const bookingRequestsService = new BookingRequestsService(db, logger);
      await bookingRequestsService.updateBookingRequest(appid, name, { description, startDate, endDate, status, requestedBy });
      res.status(200).json({ message: 'Booking request updated successfully' });
    } catch (error) {
      logger.error(`Error updating booking request for appid ${appid}, name ${name}: ${error}`);
      res.status(500).json({ error: 'Failed to update booking request' });
    }
  });
  return router;
}
