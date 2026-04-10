import { Knex } from 'knex';

export class BookingRequestsDatabaseService {

    private readonly tableName = 'bookings_requests';

    private readonly columns = {
        appid: 'appid',
        name: 'name',
        description: 'description',
        startDate: 'startDate',
        endDate: 'endDate',
        status: 'status',
        requestedBy: 'requestedBy',
        createdDate: 'createdDate',
    };

    database: Knex;

    constructor(database: Knex) {
        this.database = database;
    }

    async getBookingRequestsData(appid: string) {
        return this.database(this.tableName)
            .where(this.columns.appid, appid)
            .orderBy(this.columns.createdDate, 'desc'); // Sort by createdDate descending
    }

    async createBookingRequestsData(
        appid: string,
        name: string ,
        description: string,
        startDate: string,
        endDate: string,
        status: string,
        requestedBy: string,
        createdDate: string = new Date().toISOString(),
    ): Promise<any> {
        return this.database(this.tableName).insert({
            [this.columns.appid]: appid,
            [this.columns.name]: name,
            [this.columns.description]: description,
            [this.columns.startDate]: startDate,
            [this.columns.endDate]: endDate,
            [this.columns.status]: status,
            [this.columns.requestedBy]: requestedBy,
            [this.columns.createdDate]: createdDate,
        });
    }

    async updateBookingRequestsData(appid: string, name: string, updateData: any) {
        const dataToUpdate = {
            [this.columns.description]: updateData.description,
            [this.columns.startDate]: updateData.startDate,
            [this.columns.endDate]: updateData.endDate,
            [this.columns.status]: updateData.status,
            [this.columns.requestedBy]: updateData.requestedBy,
        };
        return this.database(this.tableName)
            .where(this.columns.appid, appid)
            .andWhere(this.columns.name, name)
            .update(dataToUpdate);
    }

    async deleteBookingRequestsData(appid: string) {
        return this.database(this.tableName).where(this.columns.appid, appid).delete();
    }

}