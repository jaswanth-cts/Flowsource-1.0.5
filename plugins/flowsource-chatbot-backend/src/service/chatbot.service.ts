import { Knex } from 'knex';
import { LoggerService } from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { ChatbotDatabaseService } from './database/chatbotDatabase.service';
import { ChatbotApiServiceHelper } from './helper/chatbot-api-helper.service';
import { ChatbotServiceHelper } from './helper/chatbot-helper.service';
import { CatalogServiceHelper } from './helper/catalog-helper.service';
import { GithubServiceHelper } from './helper/github-helper.service';
import { CHATBOT_STATUSES } from './constants/constants';
import { FolderUtil } from './helper/folder-util.service';

export class chatbotService {

    keywordsAnswersMap;
    chatbotDatabaseSvc;
    chatbotHelperSvc;
    chatbotApiHelperSvc;
    catalogHelperSvc;
    githubHelperSvc;
    folderUtil;
    logger: LoggerService;

    constructor(database: Knex, logger: LoggerService, accessToken:string) {
        let questionsAndAnswersFolderPath = process.env.ChatBotJsonsFolderPath ? process.env.ChatBotJsonsFolderPath : '../resources/questionsAndAnswers/';
        if (!questionsAndAnswersFolderPath.endsWith('/'))
            questionsAndAnswersFolderPath += '/';

        const questionsWithAnswers_General = require(questionsAndAnswersFolderPath + 'general.json');
        const questionsWithAnswers_DoraMetrics = require(questionsAndAnswersFolderPath + 'dorametrics.json');
        const questionsWithAnswers_BackstageOverview = require(questionsAndAnswersFolderPath + 'overview.json');
        const questionsWithAnswers_TechDocs = require(questionsAndAnswersFolderPath + 'techdocs.json');
        this.keywordsAnswersMap = questionsWithAnswers_General
                                        .concat(questionsWithAnswers_DoraMetrics)
                                        .concat(questionsWithAnswers_BackstageOverview)
                                        .concat(questionsWithAnswers_TechDocs);

        this.logger = logger;
        this.chatbotDatabaseSvc = new ChatbotDatabaseService(database);
        this.chatbotHelperSvc = new ChatbotServiceHelper(logger);
        this.chatbotApiHelperSvc = new ChatbotApiServiceHelper(logger, accessToken);
        this.catalogHelperSvc = new CatalogServiceHelper(logger);
        this.githubHelperSvc = new GithubServiceHelper(logger);
        this.folderUtil = new FolderUtil(logger);
    }

    /**
     * keyword_or - Array of keywords where at least one must be present in the question to identify it
     * keyword_and - Array of keywords that must be present in the question to identify it
     * keyword_equals - Array of keywords where at least one must match the question exactly to identify it
     * 
     * @param questionInLowerCase Question to be answered
     * @returns Answer to the question
     */
    // getAnswerForQuestion(questionInLowerCase: string) {
    //     let answers = [];
    //     for (let i = 0; i < this.keywordsAnswersMap.length; i++) {
    //         const keywordsAnswersObj = this.keywordsAnswersMap[i];

    //         const ifAtLeastOneKeywordPresent: boolean =
    //             this.ifAtLeastOneKeywordPresent(questionInLowerCase, keywordsAnswersObj.keyword_or);
    //         const ifAllKeywordsPresent: boolean =
    //             this.ifAllKeywordsPresent(questionInLowerCase, keywordsAnswersObj.keyword_and);
    //         const ifAtLeastOneKeywordMatchesExactly: boolean =
    //             this.ifAtLeastOneKeywordMatchesExactly(questionInLowerCase, keywordsAnswersObj.keyword_equals);

    //         if (ifAtLeastOneKeywordPresent && ifAllKeywordsPresent && ifAtLeastOneKeywordMatchesExactly)
    //             answers.push(keywordsAnswersObj.answer);
    //     }
    //     if (answers.length > 0)
    //         return answers.join('\n');
    //     else
    //         return this.defaultAnswer;
    // }
    
    async getAnswerForQuestion(questionInLowerCase: string, appid: string, chatbotUrl: string, catalogClient: CatalogClient, githubToken: string, token: string) {
        // Check the status of the chatbot upload
        const status = await this.getChatbotStatusAndUpdateIfNecessary(chatbotUrl, appid, catalogClient, githubToken, token);
        if (status !== CHATBOT_STATUSES.SUCCESS) {
            return 'Please wait while the documents are being uploaded to the chatbot.';
        }

        // Get answer from chatbot, if it is ready to answer
        return this.chatbotApiHelperSvc.getAnswerForQuestion(questionInLowerCase, appid, chatbotUrl);
    }

    /**
     * Returns true if at least one keyword is present in the question
     * @param question - Question to be answered
     * @param keywords - Array of keywords where at least one must be present in the question to identify it
     * @returns 
     */
    ifAtLeastOneKeywordPresent(question: string, keywords: string[]): boolean {
        if (!keywords || keywords.length === 0)
            return true;
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i].toLowerCase();
            if (question.includes(keyword))
                return true;
        }
        return false;
    }
    
    /**
     * Returns true if all keywords are present in the question
     * @param question - Question to be answered
     * @param keywords - Array of keywords that must be present in the question to identify it
     * @returns 
     */
    ifAllKeywordsPresent(question: string, keywords: string[]): boolean {
        if (!keywords || keywords.length === 0)
            return true;
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i].toLowerCase();
            if (!question.includes(keyword))
                return false;
        }
        return true;
    }
    
    /**
     * Returns true if at least one keyword matches the question exactly
     * @param question - Question to be answered
     * @param keywords - Array of keywords where at least one must match the question exactly to identify it
     * @returns 
     */
    ifAtLeastOneKeywordMatchesExactly(question: string, keywords: string[]): boolean {
        if (!keywords || keywords.length === 0)
            return true;
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i].toLowerCase();
            if (question === keyword)
                return true;
        }
        return false;
    }

    /**
     * Gets the status of the chatbot and updates it if necessary.
     */
    async getChatbotStatusAndUpdateIfNecessary(chatbotUrl: string, appid: string, catalogClient: CatalogClient, githubToken: string, token: string) {
        // Get the techdocs details of the entity
        const techDocDetails = await this.catalogHelperSvc.getEntityTechDocDetails(catalogClient, appid, token);
        this.logger.info(`TechDoc details for app ${appid}: ${JSON.stringify(techDocDetails)}`);

        // Get chatbot data from DB, or create an empty one if it doesn't exist
        let chatbotData = await this.chatbotDatabaseSvc.getOrCreateChatbotData(appid);

        // Update docs if necessary
        await this.updateDocsIfNecessary(appid, chatbotUrl, githubToken, chatbotData, techDocDetails);

        // If lastUploadedUuid does not match lastSucceededUuid, get the status from chatbot and update chatbotData in DB
        if (chatbotData.lastUploadedUuid !== chatbotData.lastSucceededUuid) {
            await this.getChatbotStatusAndUpdate(appid, chatbotUrl, chatbotData);
        }

        // Return the status
        return this.getChatbotStatus(chatbotData);
    }

    /**
     * Updates the docs if necessary and updates the chatbot data accordingly in the database.
     */
    async updateDocsIfNecessary(appid: string, chatbotUrl: string, githubToken: string, chatbotData: any, techDocDetails: TechDocDetails) {
        const latestTechdocsRef = techDocDetails['backstage.io/techdocs-ref'];
        if (!latestTechdocsRef) {
            this.logger.error(`Invalid techdocs-ref for app ${appid}`);
            return;
        }
        // If techDocsRef is not present in chatbotData, set it to the latest techDocsRef
        if (!chatbotData.techDocsRef) {
            chatbotData.techDocsRef = latestTechdocsRef;
            await this.chatbotDatabaseSvc.updateChatbotData(appid, chatbotData);
        }

        // Get the docs folder repository URL
        // Note: Using techDocDetails object here, assuming only the relativePath (techDocsRef) can change and managed-by-location will remain same
        const docsFolderParentUrl = this.catalogHelperSvc.getDocsFolderParentUrl(techDocDetails);
        this.logger.info(`Docs folder repository URL for app ${appid}: ${docsFolderParentUrl}`);

        // If techDocsRef in DB is not same as the latest techDocsRef and lastcommit is present
        if (chatbotData.techDocsRef !== latestTechdocsRef && chatbotData.lastcommit) {
            try {
                // Delete the docs of the old techDocsRef
                await this.deleteTechDocs(chatbotUrl, appid, githubToken, chatbotData, docsFolderParentUrl);
            } catch (error) {
                // If failed to delete techDocs, log the error and continue
                this.logger.error(`Failed to delete techDocs for app ${appid} with ${error} , and continuing with the update`);
            }

            // Update the techDocsRef in DB
            chatbotData.lastcommit = undefined; // Reset lastcommit in DB
            chatbotData.techDocsRef = latestTechdocsRef;
            await this.chatbotDatabaseSvc.updateChatbotData(appid, chatbotData);
            this.logger.info(`Updated chatbot data for app ${appid} with techDocsRef ${chatbotData.techDocsRef} and reset lastcommit`);
        }

        // Get the docs folder relative path
        const docsFolderRelativePath = this.catalogHelperSvc.getDocsFolderRelativePath(techDocDetails);
        this.logger.info(`Docs folder Relative Path for app ${appid}: ${docsFolderRelativePath}`);

        // Get commitId from git for the docs folder
        const latestCommitId = await this.githubHelperSvc.getLastCommitId(docsFolderParentUrl, githubToken, docsFolderRelativePath);
        this.logger.info(`Last commit ID for docs folder of app ${appid}: ${latestCommitId}`);

        // If commit id in DB is not same as the latest commit id, handle new commits in docs folder
        if (chatbotData.lastcommit !== latestCommitId) {
            await this.handleNewCommitsInDocsFolder(chatbotUrl, appid, chatbotData, docsFolderParentUrl, docsFolderRelativePath, githubToken, latestCommitId);
        }
    }

    /**
     * Deletes the docs of the old techDocsRef (taken from chatbotData.techDocsRef)
     */
    async deleteTechDocs(chatbotUrl: string, appid: string, githubToken: string, chatbotData: any, docsFolderParentUrl: string) {
        this.logger.info(`Deleting techDocs for app ${appid}`);

        // Get the docs folder relative path
        const docsFolderRelativePath = this.catalogHelperSvc.getDocsFolderRelativePathFromRef(chatbotData.techDocsRef);

        // Get the files to be deleted in the docs folder of the old techDocsRef (by getting the lastcommit)
        const { zipFilePath: zipFilePathForDeletion, folderPath: folderPathForDeletion } =
            await this.chatbotHelperSvc.getAppDocsAsZip(appid, docsFolderRelativePath, docsFolderParentUrl, githubToken, undefined, chatbotData.lastcommit);
        this.logger.info(`Zip file path (for Deletions) for app ${appid} : ${zipFilePathForDeletion}`);
    
        // Upload the zip file for deletions
        await this.uploadFileForDeletion(chatbotUrl, appid, zipFilePathForDeletion, chatbotData);
        this.logger.info(`Uploaded file for deletions for app ${appid} : ${zipFilePathForDeletion}`);

        // Clean up the temp folder after the upload
        this.folderUtil.deleteDirectory(folderPathForDeletion);
    }

    getChatbotStatus(chatbotData: any) {
        if (chatbotData.lastSucceededUuid) {
            return CHATBOT_STATUSES.SUCCESS; // If lastSucceededUuid is present in chatbotData, return status as 'success'
        } else {
            return chatbotData.status; // If lastSucceededUuid is not present in chatbotData, return the status
        }
    }

    /**
     * Get the chatbot status and update the chatbot data in the database.
     */
    async getChatbotStatusAndUpdate(appid: string, chatbotUrl: string, chatbotData: any) {
        // Get status from chatbot
        chatbotData.status = await this.chatbotApiHelperSvc.getChatbotStatus(chatbotUrl, chatbotData.lastUploadedUuid);

        // Update chatbotData in DB
        if (chatbotData.status === CHATBOT_STATUSES.SUCCESS) {
            // If status is 'success', update lastSucceededUuid
            chatbotData.lastSucceededUuid = chatbotData.lastUploadedUuid;
        }
        await this.chatbotDatabaseSvc.updateChatbotData(appid, chatbotData);
        this.logger.info(`Updated chatbot data for app ${appid} with status ${chatbotData.status}`);
    }

    /**
     * Upload the docs as a zip file to the chatbot and update the chatbot data.
     */
    async uploadDocsToChatbotAndUpdate(chatbotUrl: string, appid: string, chatbotData: any,
            zipFilePathForUploadNewFiles: string, zipFilePathForUploadUpdatedFiles: string,zipFilePathForDeletion: string|undefined): Promise<void> {

        
        let actions_response:any;
        if (zipFilePathForDeletion) {
            // Update chatbot status to UPLOADING
            await this.updateChatbotStatus(appid, chatbotData, CHATBOT_STATUSES.UPLOADING);
            // If there are files to be deleted, upload the zip file for deletions
            actions_response =  await this.uploadFileForDeletion(chatbotUrl, appid, zipFilePathForDeletion, chatbotData);
        }
        
        // Upload the zip file for updates
        if(zipFilePathForUploadUpdatedFiles){
            // Update chatbot status to UPLOADING
            await this.updateChatbotStatus(appid, chatbotData, CHATBOT_STATUSES.UPLOADING);
            actions_response = await this.uploadFileForUpdates(chatbotUrl, appid, zipFilePathForUploadUpdatedFiles, chatbotData);
        }
        if(zipFilePathForUploadNewFiles){
            // Update chatbot status to UPLOADING
            await this.updateChatbotStatus(appid, chatbotData, CHATBOT_STATUSES.UPLOADING);
            actions_response = await this.uploadFileForAddNewFiles(chatbotUrl, appid, zipFilePathForUploadNewFiles, chatbotData);
        }
        if(actions_response){
            // If the API call to upload file is done, update chatbotData with lastUploadedUuid and status
            await this.updateChatbotLastUploadedUuid(appid, chatbotData, actions_response.uuid);
            await this.updateChatbotStatus(appid, chatbotData, actions_response.message);
        }
    }

    async updateChatbotStatus(appid: string, chatbotData: any, status: string): Promise<void> {
        chatbotData.status = status;
        await this.chatbotDatabaseSvc.updateChatbotData(appid, chatbotData);
        this.logger.info(`Updated chatbot data for app ${appid} with status ${chatbotData.status}`);
    }

    async updateChatbotLastUploadedUuid(appid: string, chatbotData: any, lastUploadedUuid: string): Promise<void> {
        chatbotData.lastUploadedUuid = lastUploadedUuid;
        await this.chatbotDatabaseSvc.updateChatbotData(appid, chatbotData);
        this.logger.info(`Updated chatbot data for app ${appid} with lastUploadedUuid ${chatbotData.lastUploadedUuid}`);
    }

    async uploadFileForDeletion(chatbotUrl: string, appid: string, zipFilePathForDeletion: string, chatbotData: any): Promise<any> {
        this.logger.info(`Uploading file to chatbot for deletions`);
        const response_ForDeletions = await this.chatbotApiHelperSvc.uploadFileToChatbot_action_deletion(chatbotUrl, appid, zipFilePathForDeletion);
        if (response_ForDeletions.status !== 200 || !response_ForDeletions) {
            await this.updateChatbotStatus(appid, chatbotData, CHATBOT_STATUSES.FAILED);
            this.logger.error(`Failed to upload file to chatbot: ${response_ForDeletions.status} for deletions`);
            throw new Error(`Failed to upload file to chatbot: ${response_ForDeletions.status} for deletions`);
        }
        return response_ForDeletions;
    }
    
    async uploadFileForUpdates(chatbotUrl: string, appid: string, zipFilePathForUpload: string, chatbotData: any): Promise<any> {
        const response_ForUpdates = await this.chatbotApiHelperSvc.uploadFileToChatbot_action_update(chatbotUrl, appid, zipFilePathForUpload);
        if (response_ForUpdates.status !== 200 || !response_ForUpdates) {
            await this.updateChatbotStatus(appid, chatbotData, CHATBOT_STATUSES.FAILED);
            this.logger.error(`Failed to upload file to chatbot: ${response_ForUpdates.status} for updates`);
            throw new Error(`Failed to upload file to chatbot: ${response_ForUpdates.status} for updates`);
        }
        return response_ForUpdates;
    }
    async uploadFileForAddNewFiles(chatbotUrl: string, appid: string, zipFilePathForUpload: string, chatbotData: any): Promise<any> {
        const response_ForUpdates = await this.chatbotApiHelperSvc.uploadFileToChatbot_action_add(chatbotUrl, appid, zipFilePathForUpload);
        if (response_ForUpdates.status !== 200 || !response_ForUpdates) {
            await this.updateChatbotStatus(appid, chatbotData, CHATBOT_STATUSES.FAILED);
            this.logger.error(`Failed to upload file to chatbot: ${response_ForUpdates.status} for updates`);
            throw new Error(`Failed to upload file to chatbot: ${response_ForUpdates.status} for updates`);
        }
        return response_ForUpdates;
    }
    /**
     * Handles new commits in the docs folder.
     */
    async handleNewCommitsInDocsFolder(chatbotUrl: string, appid: string, chatbotData: any,
            docsFolderParentUrl: string, docsFolderRelativePath: string, githubToken: string, latestCommitId: string) {
        let zipFilePathForDeletion;
        let deleteFolders = [];
        let addedFiles = [];
        let ModifiedFiles = [];
        let zipFilePathForUpdates:string='';
        let zipFilePathForAddedNewfiles:string='';
        
        if (!chatbotData.lastcommit) {
            this.logger.info(`Handling first time upload of docs for app ${appid}`);
            // Get the docs folder as zip file for the latest commit
            const { zipFilePath, folderPath: folderPathForDeletion } =
                await this.chatbotHelperSvc.getAppDocsAsZip(appid, docsFolderRelativePath, docsFolderParentUrl, githubToken, undefined, latestCommitId);
            zipFilePathForAddedNewfiles = zipFilePath;
            deleteFolders.push(folderPathForDeletion);
            this.logger.info(`Zip file path (for first time) for app ${appid} : ${zipFilePathForAddedNewfiles}`);
        }
        else {
            // If lastcommit is present in chatbotData, get the files changed in the docs folder since that commit
            this.logger.info(`Handling subsequent commits in docs folder for app ${appid}`);
            const filesChangedInGivenFolder = await this.githubHelperSvc.getCommitsComparisonForGivenFolder(docsFolderParentUrl, githubToken, docsFolderRelativePath, chatbotData.lastcommit, latestCommitId);
            this.logger.debug(`Files changed in docs folder for app ${appid} : ${JSON.stringify(filesChangedInGivenFolder)}`);
                        
            addedFiles = this.githubHelperSvc.getAddedFiles(filesChangedInGivenFolder);
            this.logger.info(`Added files for app ${appid} : ${JSON.stringify(addedFiles)}`);
            ModifiedFiles = this.githubHelperSvc.getModifiedFiles(filesChangedInGivenFolder);
            this.logger.info(`Modified files for app ${appid} : ${JSON.stringify(ModifiedFiles)}`);           
            
            const deletedFiles = this.githubHelperSvc.getDeletedFiles(filesChangedInGivenFolder);
            this.logger.info(`Deleted files for app ${appid} : ${JSON.stringify(deletedFiles)}`);
        
            if (deletedFiles.length > 0) {
                // Get the docs folder as zip file for Deletions
                const { zipFilePath, folderPath: folderPathForDeletion } =
                    await this.chatbotHelperSvc.getAppDocsAsZip_ForDeletion(appid, deletedFiles);
                    zipFilePathForDeletion = zipFilePath;
                    deleteFolders.push(folderPathForDeletion);
                this.logger.info(`Zip file path (for Deletions) for app ${appid} : ${zipFilePathForDeletion}`);
            }
             // Get the docs folder as zip file for Added
            if(addedFiles.length > 0){
                const { zipFilePath, folderPath: folderPathForDeletion } =
                    await this.chatbotHelperSvc.getAppDocsAsZip(appid, docsFolderRelativePath, docsFolderParentUrl, githubToken, addedFiles, undefined);
                zipFilePathForAddedNewfiles = zipFilePath;
                deleteFolders.push(folderPathForDeletion);
                this.logger.info(`Zip file path (for Added) for app ${appid} : ${zipFilePathForAddedNewfiles}`);
            }
            // Get the docs folder as zip file for Updates
            if(ModifiedFiles.length > 0){
                const { zipFilePath, folderPath: folderPathForDeletion } =
                    await this.chatbotHelperSvc.getAppDocsAsZip(appid, docsFolderRelativePath, docsFolderParentUrl, githubToken, ModifiedFiles, undefined);
                zipFilePathForUpdates = zipFilePath;
                deleteFolders.push(folderPathForDeletion);
                this.logger.info(`Zip file path (for Updates) for app ${appid} : ${zipFilePathForUpdates}`);
            }
        }

        // Trigger upload Docs to chatbot
        await this.uploadDocsToChatbotAndUpdate(chatbotUrl, appid, chatbotData, zipFilePathForAddedNewfiles, zipFilePathForUpdates, zipFilePathForDeletion);

        // Update lastcommit in DB
        chatbotData.lastcommit = latestCommitId;
        await this.chatbotDatabaseSvc.updateChatbotData(appid, chatbotData);

        // Clean up the temp folders after the upload
        this.folderUtil.deleteGivenFolders(deleteFolders);
    }

}
