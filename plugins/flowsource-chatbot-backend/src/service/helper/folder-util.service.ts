import fs from 'fs';
import { LoggerService } from '@backstage/backend-plugin-api';

export class FolderUtil {

    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    /**
     * Deletes the given directory if it exists.
    */
    deleteDirectory(directoryPath: string): void {
        if (fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()) {
            fs.rmSync(directoryPath, { recursive: true, force: true });
            this.logger.info(`Deleted directory: ${directoryPath}`);
        }
    }

    /**
     * Deletes each of the given folders if they exist.
    */
    deleteGivenFolders(deleteFolders: string[]): void {
        deleteFolders.forEach(folder => {
            this.deleteDirectory(folder);
        });
    }

}
