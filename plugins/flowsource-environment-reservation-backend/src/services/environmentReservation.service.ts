import { Knex } from 'knex';
import { LoggerService } from '@backstage/backend-plugin-api';
import { EnvironmentReservationDatabaseService } from './database/environmentReservationDatabase.service';

export class EnvironmentReservationService {

    logger: LoggerService;
    environmentReservationDatabaseSvc: EnvironmentReservationDatabaseService;

    constructor(database: Knex, logger: LoggerService) {
        this.logger = logger;
        this.environmentReservationDatabaseSvc = new EnvironmentReservationDatabaseService(database);
        this.logger.info('EnvironmentReservation initialized');
    }

    async getEnvironmentReservation(appid: string) {
        this.logger.info(`Fetching maintenance requests for appid: ${appid}`);
        return this.environmentReservationDatabaseSvc.getEnvironmentReservationData(appid);
    }

    async createEnvironmentReservation(data: {
        appid: string;
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        status: string;
        environment: string;
        requestor: string;
        createdDate: string;
    }) {
        this.logger.info(`Creating maintenance request for appid: ${data.appid}, name: ${data.name}`);
        return this.environmentReservationDatabaseSvc.createEnvironmentReservationData(
            data.appid,
            data.name,
            data.description,
            data.startDate,
            data.endDate,
            data.status,
            data.environment,
            data.requestor,
            data.createdDate || new Date().toISOString(
        )); 
    }

    async updateEnvironmentReservation(appid: string, name: string, updateData: { description?: string; startDate?: string; endDate?: string; status?: string; environment?: string; requestor?: string }) {
        this.logger.info(`Updating maintenance request for appid: ${appid}, name: ${name}`);
        return this.environmentReservationDatabaseSvc.updateEnvironmentReservationData(appid, name, updateData);
    }

}