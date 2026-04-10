import os from 'os';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import * as glob from 'glob';
import { LoggerService } from '@backstage/backend-plugin-api';
import { GithubServiceHelper } from './github-helper.service';
import { CatalogServiceHelper } from './catalog-helper.service';

export class ChatbotServiceHelper {

    logger: LoggerService;
    githubHelperSvc;
    catalogHelperSvc;
    baseTempDirectory: string;

    constructor(logger: LoggerService) {
        this.logger = logger;
        this.githubHelperSvc = new GithubServiceHelper(logger);
        this.catalogHelperSvc = new CatalogServiceHelper(logger);
        this.baseTempDirectory = path.join(os.tmpdir(), 'flowsource', 'flowsource-chatbot');
    }

    createArchive() {
        return archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
    }

    getBaseTempDirectoryForApp(appid: string): string {
        return path.join(this.baseTempDirectory, appid);
    }

    getTempDirectoryForActualFilesForApp(appid: string): string {
        const timestamp = Date.now();
        return path.join(this.getBaseTempDirectoryForApp(appid), `actual_files_${timestamp}`);
    }

    getTempDirectoryForDeletionsForApp(appid: string): string {
        const timestamp = Date.now();
        return path.join(this.getBaseTempDirectoryForApp(appid), `deletions_${timestamp}`);
    }

    /**
     * Retrieves the docs folder for the given application as a zip file
     *    from the specified repository URL and folder path
     *    with the specified files to include (if any).
     * The zip file path is returned along with the folder path.
     */
    async getAppDocsAsZip(appid: string, docsFolderRelativePath: string, docsFolderParentUrl: string,
            githubToken: string, filesToInclude: string[]|undefined, commitId: string | undefined): Promise<{ zipFilePath: string, folderPath: string }> {
        // Clone the repository
        const repoClonePath = this.getTempDirectoryForActualFilesForApp(appid);
        await this.githubHelperSvc.cloneRepo(docsFolderParentUrl, repoClonePath, githubToken);
        this.logger.info(`Repository for app ${appid} cloned at: ${repoClonePath}`);

        // Checkout to the specified commit ID
        if (commitId) {
            await this.githubHelperSvc.checkoutCommit(repoClonePath, commitId);
        }
        
        // Get the docs folder as zip file
        const docsFolderZipFilePath = await this.getDocsAsZip(repoClonePath, docsFolderRelativePath, filesToInclude);
        this.logger.info(`Docs folder zip file path for app ${appid}: ${docsFolderZipFilePath}`);
        return {
            zipFilePath: docsFolderZipFilePath,
            folderPath: repoClonePath
        };
    }

    /**
     * Creates a zip file of the docs folder from the cloned repository path.
     *      If filesToInclude is provided, only the specified files are included in the zip.
     *      If filesToInclude is not provided, all files in the docs folder are included in the zip.
     * 
     * The function returns a promise that resolves to the path of the created zip file.
     *      The promise is resolved when the 'close' event is emitted by the output stream, 
     *      indicating that all data has been flushed to the file.
     *      If there's an error in the stream, the promise is rejected.
     */
    async getDocsAsZip(repoClonePath: string, docsFolderRelativePath: string, filesToInclude: string[]|undefined): Promise<string> {
        return new Promise((resolve, reject) => {
            const docsZipFilePath = path.join(repoClonePath, 'docs.zip');
            const output = fs.createWriteStream(docsZipFilePath);
            const archive = this.createArchive();

            if (filesToInclude) {
                this.includeSpecifiedFiles(repoClonePath, filesToInclude, archive);
            } else {
                this.includeAllFiles(repoClonePath, docsFolderRelativePath, archive);
            }

            output.on('close', () => resolve(docsZipFilePath)); // Return the zip file path
            output.on('error', reject);

            archive.pipe(output);
            archive.finalize();
        });
    }

    includeSpecifiedFiles(repoClonePath: string, filesToInclude: string[], archive: archiver.Archiver) {
        this.logger.info('Including the specified files in the docs folder as zip');
        filesToInclude.forEach(file => {
            const filePath = path.join(repoClonePath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath} in the docs folder`);
            }
            // Include the file in the zip
            const fileName = file.split(path.sep).join('_'); // Replace the path separator with underscore
            archive.file(filePath, { name: fileName });
            this.logger.debug(`Included the file ${filePath} in the zip file with name ${fileName}`);
        });
    }

    includeAllFiles(repoClonePath: string, docsFolderRelativePath: string, archive: archiver.Archiver) {
        this.logger.info('Including all files in the docs folder');
        
        const docsFolderPath = path.join(repoClonePath, docsFolderRelativePath);

        // Check if the docs folder exists
        if (!fs.existsSync(docsFolderPath)) {
            throw new Error(`Docs folder not found at path: ${docsFolderPath}`);
        }

        // Get all files in the docs folder
        const files = glob.sync('**/*', { cwd: docsFolderPath, nodir: true });

        // Add each file to the archive with a modified name
        files.forEach((file: string) => {
            const filePath = path.join(docsFolderPath, file);
            const fileName = path.join(docsFolderRelativePath, file).split(path.sep).join('_');
            archive.file(filePath, { name: fileName });
            this.logger.debug(`Included the file ${filePath} in the zip file with name ${fileName}`);
        });
    }

    /**
     * Retrieves the docs folder for the given application as a zip file.
     *      This is used for deletion of files.
     *      Creates empty files for the files to be deleted and includes them in the zip.
     *      The files to be deleted are specified in the filesDeleted array.
     *      The zip file is created in the folderPathForDeletedFiles.
     *      The zip file path is returned along with the folder path.
     */
    async getAppDocsAsZip_ForDeletion(appid: string, filesDeleted: string[]): Promise<{ zipFilePath: string, folderPath: string }> {
        const folderPathForDeletedFiles = this.createDirectoryForDeletedFiles(appid);
        const docsZipFilePath = path.join(folderPathForDeletedFiles, 'docs.zip');
        const output = fs.createWriteStream(docsZipFilePath);
        const archive = this.createArchive();

        this.createEmptyFilesAndAddToArchive(filesDeleted, folderPathForDeletedFiles, archive);

        archive.pipe(output);
        await archive.finalize();

        return {
            zipFilePath: docsZipFilePath,
            folderPath: folderPathForDeletedFiles
        };
    }

    createDirectoryForDeletedFiles(appid: string): string {
        const folderPathForDeletedFiles = this.getTempDirectoryForDeletionsForApp(appid);
        if (!fs.existsSync(folderPathForDeletedFiles)) {
            // Create the directory if it does not exist
            this.logger.info(`Creating directory for deleted files: ${folderPathForDeletedFiles}`);
            fs.mkdirSync(folderPathForDeletedFiles, { recursive: true });
        }
        return folderPathForDeletedFiles;
    }

    createEmptyFilesAndAddToArchive(filesToCreateAndArchive: string[], folderPathForDeletedFiles: string, archive: archiver.Archiver) {
        // Create empty files for the files to be deleted
        filesToCreateAndArchive.forEach(file => {
            const filePath = this.createEmptyFile(file, folderPathForDeletedFiles);

            // Include the empty file in the zip
            const fileName = file.split(path.sep).join('_'); // Replace the path separator with underscore
            archive.file(filePath, { name: fileName });
            this.logger.debug(`Included the deleted file ${filePath} in the zip file with name ${fileName}`);
        });
    }

    createEmptyFile(file: string, folderPath: string): string {
        const filePath = path.join(folderPath, file);
        const fileDirectory = path.dirname(filePath);

        // Create the directory if it does not exist
        if (!fs.existsSync(fileDirectory)) {
            this.logger.debug(`Creating directory for file: ${fileDirectory}`);
            fs.mkdirSync(fileDirectory, { recursive: true });
        }

        // Create the empty file
        fs.writeFileSync(filePath, '');
        return filePath;
    }

}