import { Knex } from 'knex';

export class EnvironmentReservationDatabaseService {

    private readonly tableName = 'maintenance_requests';

    private readonly columns = {
        appid: 'appid',
        name: 'name',
        description: 'description',
        startDate: 'startDate',
        endDate: 'endDate',
        status: 'status',
        environment: 'environment',
        requestor: 'requestor',
        createdDate: 'createdDate',
    };

    database: Knex;

    constructor(database: Knex) {
        this.database = database;
    }

    async getEnvironmentReservationData(appid: string) {
        return this.database(this.tableName)
            .where(this.columns.appid, appid)
            .orderBy(this.columns.createdDate, 'desc'); // Sort by createdDate descending
    }

    async createEnvironmentReservationData(
        appid: string,
        name: string ,
        description: string ,
        startDate: string ,
        endDate: string ,
        status: string ,
        environment: string ,
        requestor?: string ,
        createdDate: string = new Date().toISOString(),
    ): Promise<any> {
        return this.database(this.tableName).insert({
            [this.columns.appid]: appid,
            [this.columns.name]: name,
            [this.columns.description]: description,
            [this.columns.startDate]: startDate,
            [this.columns.endDate]: endDate,
            [this.columns.status]: status,
            [this.columns.environment]: environment,
            [this.columns.requestor]: requestor,
            [this.columns.createdDate]: createdDate,
        });
    }

    async updateEnvironmentReservationData(appid: string, name: string, updateData: any) {
        const dataToUpdate = {
            [this.columns.description]: updateData.description,
            [this.columns.startDate]: updateData.startDate,
            [this.columns.endDate]: updateData.endDate,
            [this.columns.status]: updateData.status,
            [this.columns.environment]: updateData.environment,
            [this.columns.requestor]: updateData.requestor,
        };
        return this.database(this.tableName)
            .where(this.columns.appid, appid)
            .andWhere(this.columns.name, name)
            .update(dataToUpdate);
    }

    async deleteEnvironmentReservationData(appid: string) {
        return this.database(this.tableName).where(this.columns.appid, appid).delete();
    }

}