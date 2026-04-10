
import { apiRequest } from './apiRequest';
import AuthService from './authService';
import moment from 'moment';
import { LoggerService } from '@backstage/backend-plugin-api';

class AzureRepoService {
  private logger: LoggerService;
  private authService: AuthService;
  private projectName: any;
  private repositoryName: any;
  baseURL: string = '';
  private headers: any = {};
  constructor(logger: LoggerService, authService: AuthService, azureRepoBaseUrl: string, orgName: string) {
    this.baseURL = `${azureRepoBaseUrl}/${orgName}`;
    this.authService = authService;
    this.logger = logger;
  }
  setProjectDetails = (projectName: string, repositoryName: string) => {
    this.projectName = projectName;
    this.repositoryName = repositoryName;
  }

  setAuthHeader = async () => {
    const token = await this.authService.login();
    this.headers['Authorization'] = `Basic ${token}`;
  }

  fetchPullRequests = async ( durationInDays: number, state: string ): Promise<any[]> => {
    try {
      await this.setAuthHeader();
      let pullRequests: any[] = [];
      let skip = 0;
      let creationDate = moment().subtract(durationInDays, 'days').toISOString();
      while (true) {
        const params = new URLSearchParams({
          $skip: skip.toString(),
          'searchCriteria.status': state,
          'searchCriteria.minTime': creationDate,
          'api-version': '7.1-preview.1',
        });

        let azureUrl = `${this.baseURL}/${this.projectName}/_apis/git/repositories/${this.repositoryName}/pullRequests?${params.toString()}`;
        const response = await apiRequest('GET', azureUrl, this.headers, this.logger);
        if (!response.ok) {
          const errorText = await response.text();

          if (errorText.includes('The following project does not exist')) 
          {
            const customError = new Error(`Project "${this.projectName}" not found`);

            (customError as any).status = 404; // Attach status code to error object
            (customError as any).response = {
              status: 404,
              data: { message: `Project "${this.projectName}" not found` },
            };

            throw customError;
          } else if(errorText.includes(`The Git repository with name or identifier ${this.repositoryName} does not exist`)) {
            const customError = new Error(`Repository "${this.repositoryName}" not found`);
            (customError as any).status = 404; // Attach status code to error object
            (customError as any).response = {
              status: 404,
              data: { message: `Repository "${this.repositoryName}" not found` },
            };
            throw customError;
          } 
          else {
            const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
            (error as any).status = response.status;
            (error as any).response = {
              status: response.status,
              data: { message: response },
            };
            throw error;
          }
        }
        const responseData = await response.json();
        if (responseData.value.length === 0) {
          break;
        }

        pullRequests = [...pullRequests, ...responseData.value];
        skip += responseData.value.length;
      }

      const today = new Date();

      const PRList = await Promise.all(
        pullRequests.map(async (pr: any) => {
          const createdAtDate = new Date(pr.creationDate);
          const createdAtDays = this.calculateDaysAgo(today, createdAtDate);
          const project = pr.repository.project.name;
          const repository = pr.repository.name;
          const pullRequestId = pr.pullRequestId;
          const pullRequestUrl = `${this.baseURL}/${project}/_git/${repository}/pullrequest/${pullRequestId}`;

          return {
            number: pr.pullRequestId,
            url: pullRequestUrl,
            state: pr.status,
            creator: pr.createdBy.displayName,
            createdAt: createdAtDays,
            createdAtDate: pr.creationDate,
            title: pr.title,
            isDraft: pr.isDraft,
            reviewDecision: pr.reviewers[0]?.vote,
          };
        }),
      );
      return PRList;
    } catch (error) {
      this.logger.error(`Failed to fetch pull requests: ${error}`);
      throw error;
    }
  };

  fetchPullRequestById = async (id: string): Promise<any> => {
    await this.setAuthHeader();
    let url = `${this.baseURL}/${this.projectName}/_apis/git/repositories/${this.repositoryName}/pullRequests/${id}`;
    try {
      const [prResponse, commitsResponse, commentsResponse, labelResponse] =
        await Promise.all([
          apiRequest('GET', `${url}?api-version=7.1-preview.1`, this.headers, this.logger),
          apiRequest('GET', `${url}/commits?api-version=7.1-preview.1`, this.headers, this.logger),
          apiRequest('GET', `${url}/threads?api-version=7.1-preview.1`, this.headers, this.logger),
          apiRequest('GET', `${url}/labels?api-version=7.1-preview.1`, this.headers, this.logger),
        ]);

      const pr = await prResponse.json();
      const commitsResponseData = await commitsResponse.json();
      const commentsResponseData = await commentsResponse.json();
      const label = await labelResponse.json();

      const today = new Date();
      let updatedAtDate = pr.status === 'completed' && pr.closedDate ? new Date(pr.closedDate) : new Date(pr.creationDate);

      const lastCommitDate = commitsResponseData.value.length > 0 ? new Date(commitsResponseData.value[0].author.date) : null;
      const lastCommentDate = commentsResponseData.value.length > 0 ? new Date(commentsResponseData.value[0].lastUpdatedDate) : null;

      if (lastCommitDate && lastCommitDate > updatedAtDate) {
        updatedAtDate = lastCommitDate;
      }
      if (lastCommentDate && lastCommentDate > updatedAtDate) {
        updatedAtDate = lastCommentDate;
      }

      const data = {
        updatedAt: this.calculateDaysAgo(today, updatedAtDate),
        updatedAtDate: updatedAtDate.toISOString(),
        assignee: pr.reviewers[0]?.displayName || null,
        reviewRequests: pr.reviewers.map((reviewer: any) => reviewer.displayName),
        requiredReviewerName: pr.reviewers.find((reviewer: any) => reviewer.isRequired)?.displayName || null,
        lables: label.value.length > 0 ? label.value.map((label: any) => label.name) : null,
        totalcomment: commentsResponseData.value.length,
        openCommentCount: commentsResponseData.value.filter((comment: any) => comment.status === 'active').length,
      };
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch pull request: ${error}`);
      throw error;
    }
  };

  fetchGraphData = async (): Promise<any> => {
    try{
      let totalCountForPRTrend = 0;
      const sixMonthsAgo = moment().subtract(6, 'months');
      const durationInDays = moment().diff(sixMonthsAgo, 'days');
      const monthlyPRMap: { [key: string]: number } = {};
      for (let i = 5; i >= 0; i--) {
        const month = moment().subtract(i, 'months').format('MMM YYYY');
        monthlyPRMap[month] = 0;
      }

      const PRList = await this.fetchPullRequests(durationInDays, 'all');

    for (const pr of PRList) {
      const creationDate = moment(pr.createdAtDate);
        totalCountForPRTrend++;
        const month = creationDate.format('MMM YYYY');
        if (!monthlyPRMap[month]) {
          monthlyPRMap[month] = 0;
        }
        monthlyPRMap[month]++;
      }
  
      const pullRequestsAging = this.getPRAgingDetails(PRList)
        
      return {
        monthlyPRMap,
        pullRequestsAging,
        totalCountForPRTrend,
        totalCountForPRAging: Object.values(pullRequestsAging).reduce((a: any, b: any) => a + b, 0)
      }
    }catch(error){
      this.logger.error(`Failed to fetch graph data: ${error}`);
      throw error;
    }
  }

  getPRAgingDetails = (pullRequests: any[]): any => {
    const now = moment();
    const pullRequestsAging = {
      '0-14 days': 0,
      '15-29 days': 0,
      '1-3 months': 0,
      '>=3 months': 0,
    };

    for (const pr of pullRequests) {
      if (pr.state !== 'abandoned' && pr.state !== 'completed') {
        const creationDate = moment(pr.createdAtDate);
        const age = now.diff(creationDate, 'days');
        const ageBucket =
          age <= 15
            ? '0-14 days'
            : age <= 30
            ? '15-29 days'
            : age <= 90
            ? '1-3 months'
            : '>=3 months';
        pullRequestsAging[ageBucket]++;
      }
    }
    return pullRequestsAging;
  };

  async fetchCompletedPRs(projectName: string, repositoryName: string, durationDays: number): Promise<any[]> {
    try {
      const durationDate = new Date();
      durationDate.setDate(durationDate.getDate() - durationDays);
  
      // Fetch merged PRs
      const params = new URLSearchParams({
        'searchCriteria.status': 'completed',
        'searchCriteria.creationDate': durationDate.toISOString(),
        'api-version': '7.1-preview.1',
      });
  
      const url = `${this.baseURL}/${projectName}/_apis/git/repositories/${repositoryName}/pullRequests?${params.toString()}`;
    
      const response = await apiRequest('GET', url, this.headers, this.logger);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const responseData = await response.json();
      const completedPRs = responseData.value || [];
  
  
      const approvedPRs = await Promise.all(
        completedPRs.map(async (pr: any) => {
          const threadsUrl = `${this.baseURL}/${projectName}/_apis/git/repositories/${repositoryName}/pullRequests/${pr.pullRequestId}/threads?api-version=7.1-preview.1`;
          
          const threadsResponse = await apiRequest('GET', threadsUrl, this.headers, this.logger);
          if (!threadsResponse.ok) throw new Error(`HTTP error! status: ${threadsResponse.status}`);
  
          const threadsData = await threadsResponse.json();
  
          // Find the earliest "voted 10" approval comment
          const approvalComments = threadsData.value.flatMap((thread: any) =>
            thread.comments.filter((comment: any) => comment.content.includes("voted 10"))
          );
  
          if (approvalComments.length > 0) {
            // Get the first published approval date
            const earliestApprovalComment = approvalComments.reduce((earliest: any, current: any) =>
              new Date(current.publishedDate) < new Date(earliest.publishedDate) ? current : earliest
            );
  
            const approvalDate = new Date(earliestApprovalComment.publishedDate);
            
            return {
              id: pr.pullRequestId,
              createdAt: pr.creationDate,
              approvedAt: approvalDate.toISOString(),
              mergedAt: pr.closedDate || null,
            };
          }
  
          return null;
        })
      );
  
      const filteredPRs = approvedPRs.filter((pr) => pr !== null);
      return filteredPRs;
    } catch (error) {
      this.logger.error(`Error fetching approved & merged PRs: ${error}`);
      throw error;
    }
  }

  calculateDaysAgo(today: Date, date: Date): string {
    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return date.toDateString() === today.toDateString() ? 'Today' : `${daysAgo} days ago`;
  }

}
export default AzureRepoService;
