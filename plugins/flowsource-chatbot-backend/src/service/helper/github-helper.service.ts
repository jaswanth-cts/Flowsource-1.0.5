import fs from 'fs';
import path from 'path';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Octokit } from "@octokit/rest";
import { simpleGit } from 'simple-git';

export class GithubServiceHelper {

    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    getGitRepoDetails(folderParentUrl: string) {
        const match = folderParentUrl.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/(.+)(\/(.*))?/);
        if (!match) {
            throw new Error(`Invalid repository URL: ${folderParentUrl}`);
        }
        const owner = match[1];
        const repo = match[2];
        const ref = match[3];
        const folderPath = match[4];
        return { owner, repo, ref, folderPath };
    }

    /**
     * Get the last commit ID of the repository for the specific folder.
     * @param folderParentUrl The URL of the parent folder of the folder for which the last commit ID is to be retrieved.
     * @param githubToken The GitHub token for authentication.
     * @param folderRelativePath The relative path of the folder for which the last commit ID is to be retrieved.
     * @returns The last commit ID of the repository for the specific folder.
    */
    async getLastCommitId(folderParentUrl: any, githubToken: string, folderRelativePath: string) {
        // Extract the necessary details like base URL, branch, etc. from the repoUrl
        const { owner, repo, ref, folderPath } = this.getGitRepoDetails(folderParentUrl);
        const docsFolderPath = path.join(folderPath || '', folderRelativePath);
        const octokit = new Octokit({ auth: githubToken });

        // Get the commits of the repository for the specific folder
        const { data: commits } = await octokit.repos.listCommits({
            owner,
            repo,
            sha: ref,
            path: docsFolderPath,
        });

        // Get the last commit of the specific folder
        const lastCommit = commits[0];
        return lastCommit.sha;
    }

    /**
     * Clone the repository to the specified path.
     */
    async cloneRepo(specificFolderParentUrl: string, repoClonePath: string, githubToken: string) {
        if (fs.existsSync(repoClonePath)) {
            // Remove the directory if it already exists
            fs.rmSync(repoClonePath, { recursive: true, force: true });
        }

        // Extract the git repository URL for cloning from the specificFolderParentUrl
        const match = specificFolderParentUrl.match(/(https:\/\/github\.com\/[^/]+\/[^/]+)\/tree\/(.+).*/);
        if (!match) {
            throw new Error(`Invalid repository URL: ${specificFolderParentUrl}`);
        }
        const repoUrl = match[1];
        const ref = match[2];

        // Include the token in the repository URL
        // TODO: Clone without having to include the token in the URL
        const repoUrlWithToken = repoUrl.replace('https://', `https://${githubToken}@`);
        this.logger.info(`Cloning the repo ${repoUrl} with branch ${ref} at path ${repoClonePath}`);

        try {
            const gitInstance = simpleGit();
            await gitInstance.clone(repoUrlWithToken, repoClonePath, ['--branch', ref]);
            this.logger.info('Repo cloned successfully');
        } catch (error) {
            this.logger.error(`Failed to clone the repository: ${error}`);
            throw error;
        }
    }

    /**
     * Checkout to the specified commit ID.
     */
    async checkoutCommit(repoClonePath: string, commitId: string) {
        if (!fs.existsSync(repoClonePath)) {
            throw new Error(`Repository path not found: ${repoClonePath}`);
        }
        if (!commitId) {
            throw new Error('Commit ID is required to checkout the commit');
        }
        try {
            const gitInstance = simpleGit();
            await gitInstance.cwd(repoClonePath); // Change working directory to the cloned repository
            await gitInstance.checkout(commitId); // Checkout to the specified commit ID
            this.logger.info(`Checked out to the specified commit ID ${commitId}`);
        } catch (error) {
            this.logger.error(`Failed to checkout the commit: ${error}`);
            throw error;
        }
    }

    /**
     * Get the commits comparison between the base and head commits.
     */
    async getCommitsComparison(owner: string, repo: string, base: string, head: string, githubToken: string): Promise<any> {
        const octokit = new Octokit({ auth: githubToken });
        const { data: comparison } = await octokit.repos.compareCommits({
          owner,
          repo,
          base,
          head
        });
        return comparison;
    }

    /**
     * Get the commits comparison for the given folder.
     */
    async getCommitsComparisonForGivenFolder(folderParentUrl: any, githubToken: string, docsFolderRelativePath: string, base: string, head: string): Promise<any> {
        // const { owner, repo, ref, folderPath } = this.getGitRepoDetails(folderParentUrl);
        const { owner, repo, folderPath } = this.getGitRepoDetails(folderParentUrl);
        const docsFolderPath = path.join(folderPath || '', docsFolderRelativePath);
        // Docs folder path with a trailing slash to ensure that only the files in the folder are considered (Otherwise, the folder name might be a prefix of other folders as well)
        const docsFolderPathWithSlash = path.join(docsFolderPath, path.sep).replace(/\\/g, '/');

        const comparison = await this.getCommitsComparison(owner, repo, base, head, githubToken);
        const files = comparison.files;
        const folderFiles = files.filter((file: any) => file.filename.startsWith(docsFolderPathWithSlash));
        return folderFiles;
    }
    getAddedFiles(files: any) {
        return files.filter((file: any) =>
                                file.status === 'added' ||
                                file.status === 'renamed')
                    .map((file: any) => file.filename);
    }
    getModifiedFiles(files: any) {
        return files.filter((file: any) =>
                                file.status === 'modified' )
                    .map((file: any) => file.filename);
    }
    getDeletedFiles(files: any) {
        return files.filter((file: any) =>
                                file.status === 'removed' ||
                                file.status === 'renamed')
                    .map((file: any) =>
                        file.status === 'renamed' ? file.previous_filename : file.filename
                    );
    }

}
