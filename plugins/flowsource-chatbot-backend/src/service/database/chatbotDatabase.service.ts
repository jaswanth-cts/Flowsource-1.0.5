import { Knex } from 'knex';
import { CHATBOT_STATUSES } from '../constants/constants';

export class ChatbotDatabaseService {

    private readonly tableName = 'chatbot_uploads';

    private readonly columns = {
        appid: 'appid',
        lastSucceededUuid: 'lastSucceededUuid',
        lastUploadedUuid: 'lastUploadedUuid',
        status: 'status',
        lastcommit: 'lastcommit',
        techDocsRef: 'techDocsRef',
    };

    database: Knex;

    constructor(database: Knex) {
        this.database = database;
    }

    async getChatbotData(appid: string) {
        return this.database(this.tableName).where(this.columns.appid, appid).first();
    }

    async createEmptyChatbotData(appid: string): Promise<any> {
        return this.createChatbotData(appid, undefined, undefined, CHATBOT_STATUSES.INITIATED, undefined, undefined);
    }

    async createChatbotData(appid: string,
                            lastSucceededUuid: string | undefined, lastUploadedUuid: string | undefined,
                            status: string | undefined, lastcommit: string | undefined, techDocsRef: string | undefined
                        ): Promise<any> {
        return this.database(this.tableName).insert({ 
            [this.columns.appid]: appid, 
            [this.columns.lastSucceededUuid]: lastSucceededUuid, 
            [this.columns.lastUploadedUuid]: lastUploadedUuid, 
            [this.columns.status]: status, 
            [this.columns.lastcommit]: lastcommit,
            [this.columns.techDocsRef]: techDocsRef
        });
    }

    async getOrCreateChatbotData(appid: string) {
        let chatbotData = await this.getChatbotData(appid);
        if (!chatbotData) {
            chatbotData = await this.createEmptyChatbotData(appid);
        }
        return chatbotData;
    }

    async updateChatbotData(appid: string, chatbotUploadData: any) {
        const dataToUpdate = {
            [this.columns.lastSucceededUuid]: chatbotUploadData.lastSucceededUuid, 
            [this.columns.lastUploadedUuid]: chatbotUploadData.lastUploadedUuid, 
            [this.columns.status]: chatbotUploadData.status, 
            [this.columns.lastcommit]: chatbotUploadData.lastcommit ,
            [this.columns.techDocsRef]: chatbotUploadData.techDocsRef
        };
        return this.database(this.tableName).where(this.columns.appid, appid).update(dataToUpdate);
    }
    
    async updateChatbotItem(appid: string, lastSucceededUuid: string, lastUploadedUuid: string,
                            status: string, lastcommit: string, techDocsRef: string
                        ) {
        return this.database(this.tableName).where(this.columns.appid, appid).update({ 
            [this.columns.lastSucceededUuid]: lastSucceededUuid, 
            [this.columns.lastUploadedUuid]: lastUploadedUuid, 
            [this.columns.status]: status, 
            [this.columns.lastcommit]: lastcommit,
            [this.columns.techDocsRef]: techDocsRef
        });
    }

    async deleteChatbotData(appid: string) {
        return this.database(this.tableName).where(this.columns.appid, appid).delete();
    }

}