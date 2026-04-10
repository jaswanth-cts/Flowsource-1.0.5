import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class BitbucketBackendDataService {
  private logger: LoggerService;
  constructor( logger: LoggerService) {
    this.logger = logger;
  }

  // To fetch Pull Requests based on state and durationInDays
  async getPullrequestData(repoName: any, repoOwner: any, dataPullDuration: number, baseUrl: string, authToken: string, state: any) {
    try {
      const data: any = [];
      const durationInMilliseconds: number =
        dataPullDuration * 24 * 60 * 60 * 1000;
      const durationDate = new Date(
        Date.now() - durationInMilliseconds,
      ).toISOString();

      let stateQuery =
        state === 'all'
          ? 'state="OPEN" OR state="DECLINED" OR state="MERGED"'
          : `state="${state}"`;
      let bitBucketUrl = `${baseUrl}/${repoOwner}/${repoName}/pullrequests?q=created_on>=${durationDate} AND (${stateQuery})&pagelen=${50}`;
      while (bitBucketUrl) {
        let response: any;
        response = await apiRequest(
          'GET',
          bitBucketUrl,
          {
            "Authorization": `Bearer ${authToken}`,
          }
        , this.logger
        )

        if(!response.ok) 
        {
          const errorText = await response.text();

          if(errorText.includes('You may not have access to this repository or it no longer exists in this workspace')) {
            const customError = new Error(`Repository not found. Invalid repo owner or name`);
            (customError as any).status = 404; // Attach status code to error object
            (customError as any).response = {
              status: 404,
              data: { message: `Repository not found. Invalid repo owner or name` },
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
        };

        response = await response.json();
        data.push(...response.values);
        bitBucketUrl = response.next;
      }

      const today = new Date();
      const prList = await Promise.all(
        data.map(async (pr: any) => {
          const createdAtDate = new Date(pr.created_on);
          const createdAtDays = this.calculateDaysAgo(today, createdAtDate);
          return {
            number: pr.id,
            state: pr.state,
            url: pr.links.html.href,
            creator: pr.author.display_name,
            // assignee: pr.assignee ? pr.assignee.login : null,
            createdAt: createdAtDays,
            createdAtDate: pr.created_on,
            title: pr.title,
          };
        }),
      );
      return prList;
    } catch (error) {
      this.logger.error('Error fetching pullrequest:', error as Error);
      throw error;
    }
  }

  // To fetch Pull Requests by PR ID for additional details
  async getPullrequestDataById(
    id: any,
    repoName: any,
    repoOwner: any,
    baseUrl: string,
    authToken: string,
  ) {
    try {
      const today = new Date();
      const headers = { "Authorization": `Bearer ${authToken}` };
      const [prResponse, commentResponse] = await Promise.all([
      apiRequest('GET', `${baseUrl}/${repoOwner}/${repoName}/pullrequests/${id}`, headers, this.logger),
      apiRequest('GET', `${baseUrl}/${repoOwner}/${repoName}/pullrequests/${id}/comments`, headers, this.logger),
    ]);
      
      const prReviewsData = await prResponse.json();
      const commentData = await commentResponse.json();

      const prReviewDecision = prReviewsData.participants.map((participant: any) => participant.state);
      const reviewDecision = prReviewDecision.length > 0 ? prReviewDecision[0] : null;
      const updatedAtDate = new Date(prReviewsData.updated_on);
      const updatedAt = this.calculateDaysAgo(today, updatedAtDate);
      const openCommentCount = commentData.values.filter((value: any) => value.inline && !value.resolution).length;
      const totalComment = prReviewsData.comment_count;
      const reviewers = prReviewsData.reviewers.map((reviewer: any) => reviewer.display_name);
      const participants = prReviewsData.participants.map((participant: any) => participant.user.display_name);
      const combinedReviewers = Array.from(new Set([...reviewers, ...participants])).join(', ') || null;
      
      const data = {
        reviewDecision,
        reviewers: combinedReviewers,
        openCommentCount,
        totalComment,
        updatedAtDate,
        updatedAt,
      };
      return data;
    } catch (error) {
      this.logger.error('Error fetching pullrequest:', error as Error);
      throw error;
    }
  }

  // To fetch Pull Request for graph data for the last six months
  async getGraphPullrequestData(repoName: any, repoOwner: any, baseUrl: string, authToken: string) {
    try {
      const data: any = [];
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const durationDate = sixMonthsAgo.toISOString();
      let bitBucketUrl = `${baseUrl}/${repoOwner}/${repoName}/pullrequests?q=created_on>=${durationDate}&pagelen=${50}`;
      while (bitBucketUrl) {
        let response: any;
        response = await apiRequest('GET', bitBucketUrl, {Authorization: `Bearer ${authToken}`}, this.logger);
        response = await response.json();
        data.push(...response.values);
        bitBucketUrl = response.next;
      }
      const monthPRMap: { [key: string]: number } = {};
      let totalCountForPRTrend = 0;
      let totalCountForPRAging = 0;
      const thresholds = {
        fifteenDaysAgo: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
        thirtyDaysAgo: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        threeMonthsAgo: new Date(today.getTime() - 3 * 30 * 24 * 60 * 60 * 1000),
      };

      const agingCounts = {
        '0-14 days': 0,
        '15-29 days': 0,
        '1-3 months': 0,
        '>=3 months': 0,
      };

      data.forEach((pr: any) => {
        const createdAtDate = new Date(pr.created_on);

        if (createdAtDate > sixMonthsAgo) {
          totalCountForPRTrend++;
          const monthYear = createdAtDate.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
          monthPRMap[monthYear] = (monthPRMap[monthYear] || 0) + 1;
        }

        if (pr.state === 'OPEN') {
          totalCountForPRAging++;
          const daysSinceCreation = Math.floor((today.getTime() - createdAtDate.getTime()) / (24 * 60 * 60 * 1000));

          if (createdAtDate >= thresholds.fifteenDaysAgo && daysSinceCreation <= 15) {
            agingCounts['0-14 days']++;
          } else if (createdAtDate >= thresholds.thirtyDaysAgo && daysSinceCreation <= 30) {
            agingCounts['15-29 days']++;
          } else if (createdAtDate >= thresholds.threeMonthsAgo && daysSinceCreation <= 90) {
            agingCounts['1-3 months']++;
          } else {
            agingCounts['>=3 months']++;
          }
        }
      });

      const sortedMonthlyPRMap = this.generateSortedMonthlyPRMap(sixMonthsAgo, today, monthPRMap);
      return {
        monthlyPRMap: sortedMonthlyPRMap,
        pullRequestsAging: agingCounts,
        totalCountForPRTrend,
        totalCountForPRAging,
      }
     }
    catch (error) {
      this.logger.error('Error fetching pullrequest:', error as Error);
      throw error;
    }
  }

  async fetchMergedAndApprovedPRs(
    repoName: string,
    repoOwner: string,
    baseUrl: string,
    authToken: string,
    durationInMonths: number,
  ) {
    try {
      this.logger.info(
        `Fetching merged and approved PRs for repo: ${repoName}, owner: ${repoOwner}`,
      ); // Log the start of the operation

      // Normalize baseUrl to remove trailing slash if present
      const normalizedBaseUrl = baseUrl.endsWith('/')
        ? baseUrl.slice(0, -1)
        : baseUrl;

      const sinceDate = new Date();
      sinceDate.setMonth(sinceDate.getMonth() - durationInMonths);
  
      let bitBucketUrl = `${normalizedBaseUrl}/${repoOwner}/${repoName}/pullrequests?q=state="MERGED" AND created_on>=${sinceDate.toISOString()}&pagelen=50`;
      const mergedPRs: any[] = [];

      while (bitBucketUrl) {
        this.logger.info(`Fetching PRs from URL: ${bitBucketUrl}`); // Log the URL being fetched
        const response = await apiRequest('GET', bitBucketUrl, {
          Authorization: `Bearer ${authToken}`,
        }, this.logger);
        const data = await response.json();

        const prs = data.values.map((pr: any) => ({
          id: pr.id,
          createdAt: new Date(pr.created_on),
          mergedAt: pr.state === 'MERGED' ? new Date(pr.updated_on) : null,
        }));
        mergedPRs.push(...prs);
        this.logger.info(`Fetched ${prs.length} PRs from current page`); // Log the number of PRs fetched
        bitBucketUrl = data.next;
      }

      this.logger.info(`Total merged PRs fetched: ${mergedPRs.length}`); // Log the total number of merged PRs

      const detailedPRs = await Promise.all(
        mergedPRs.map(async (pr) => {
          try {
            const prDetailsResponse = await apiRequest(
              'GET',
              `${normalizedBaseUrl}/${repoOwner}/${repoName}/pullrequests/${pr.id}`,
              { Authorization: `Bearer ${authToken}` }, this.logger
            );
            const prDetails = await prDetailsResponse.json();
  
            const approvedParticipant = prDetails.participants
              ?.filter((participant: any) => participant.state === 'approved')
              .sort(
                (a: any, b: any) =>
                  new Date(a.participated_on).getTime() -
                  new Date(b.participated_on).getTime(),
              )
              .shift();

            this.logger.info(
              `Fetched approval details for PR ID: ${pr.id}`,
            ); // Log approval details fetched

            return {
              ...pr,
              approvedAt: approvedParticipant
                ? new Date(approvedParticipant.participated_on)
                : null,
            };
          } catch (error) {
            this.logger.error(
              `Error fetching approval details for PR ID: ${pr.id}`,
              error as Error,
            ); // Log errors for specific PRs
            return { ...pr, approvedAt: null };
          }
        }),
      );

      this.logger.info(
        `Successfully fetched detailed PRs with approval information`,
      ); // Log success

      return detailedPRs.filter((pr) => pr.approvedAt !== null);
    } catch (error) {
      this.logger.error('Error fetching merged and approved PRs:', error as Error); // Log errors
      throw error;
    }
  }


  private calculateDaysAgo(today: Date, date: Date): string {
    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return date.toDateString() === today.toDateString() ? 'Today' : `${daysAgo} days ago`;
  }
  
  generateSortedMonthlyPRMap(startDate: Date, endDate: Date, monthPRMap: { [key: string]: number }) {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const keys = [];
    const currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      const month = monthOrder[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      keys.push(`${month} ${year}`);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  
    const sortedMonthlyPRMap: { [key: string]: number } = {};
    keys.forEach(key => {
      sortedMonthlyPRMap[key] = monthPRMap[key] || 0;
    });
  
    return sortedMonthlyPRMap;
  }
}
