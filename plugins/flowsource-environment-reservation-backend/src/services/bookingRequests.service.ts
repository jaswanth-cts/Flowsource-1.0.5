import { Knex } from 'knex';
import { LoggerService } from '@backstage/backend-plugin-api';
import { BookingRequestsDatabaseService } from './bookingsDatabase/bookingRequestsDatabase.service';

export class BookingRequestsService {

    logger: LoggerService;
    bookingRequestsDatabaseSvc: BookingRequestsDatabaseService;

    constructor(database: Knex, logger: LoggerService) {
        this.logger = logger;
        this.bookingRequestsDatabaseSvc = new BookingRequestsDatabaseService(database);
        this.logger.info('BookingRequestsService initialized');
    }

    async getBookingRequests(appid: string) {
        this.logger.info(`Fetching booking requests for appid: ${appid}`);
        return this.bookingRequestsDatabaseSvc.getBookingRequestsData(appid);
    }

    async createBookingRequest(data: {
        appid: string;
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        status: string;
        requestedBy: string;
        createdDate: string;
    }) {
        this.logger.info(`Creating booking request for appid: ${data.appid}, name: ${data.name}`);
        return this.bookingRequestsDatabaseSvc.createBookingRequestsData(
            data.appid,
            data.name,
            data.description,
            data.startDate,
            data.endDate,
            data.status,
            data.requestedBy,
            data.createdDate || new Date().toISOString(
        )); 
    }

    async updateBookingRequest(appid: string, name: string, updateData: { description?: string; startDate?: string; endDate?: string; status?: string; requestedBy?: string }) {
        this.logger.info(`Updating booking request for appid: ${appid}, name: ${name}`);
        return this.bookingRequestsDatabaseSvc.updateBookingRequestsData(appid, name, updateData);
    }

}