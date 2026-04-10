import GithubHelper from "./githubHelper.service";
import { LoggerService } from '@backstage/backend-plugin-api';

class GithubPullRequestService {

  octokit: any;
  integrations: any;
  githubHelperService: GithubHelper;
  logger: LoggerService;

  constructor( logger: LoggerService) {

    this.githubHelperService = new GithubHelper( logger);
    this.logger = logger;

  }

  async getGithubPullRequestList(repoName: any, repoOwner: any, githubToken: any, durationDaysCatalog: number, durationConfig: number, requestType: any) {
    this.logger.info('Fetching PR details for application: ', repoName);
  
    const durationInDays = durationDaysCatalog || durationConfig;
    const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
    const durationDate = new Date(Date.now() - durationInMilliseconds);
  
    let githubPrResponse;
    try {
        githubPrResponse = await this.fetchGithubPRList(repoOwner, repoName, githubToken, requestType, durationDate);
    } catch (error: any) {

      this.logger.error("Error fetching pull requests:", error as Error);

      if(error.message && error.message.includes("Could not resolve to a Repository with the name"))
      {
        const customError = new Error(`Incorrect git owner or repo`);

        (customError as any).status = 404; // Attach status code to error object
        (customError as any).response = {
          status: 404,
          data: { message: `Incorrect git owner or repo` },
        };

        throw customError;
      } else {
        throw error;
      };
    };

    let githubPullRequestList;
    try {
        githubPullRequestList = await this.extractPRListFromResponse(githubPrResponse);
    } catch (error) {
        this.logger.error("Error processing pull requests list:", error as Error);
    }
    
    return {
        githubPRList: githubPullRequestList,
    };
}

  async getGithubPRCalculation(repoName: any, repoOwner: any, githubToken: any, requestType: any) {
    let githubPrResponse;
    try {
        githubPrResponse = await this.fetchGithubPRList(repoOwner, repoName, githubToken, requestType);
    } catch (error) {
        this.logger.error("Error fetching pull requests:", error as Error);
        return {};
    }

    let githubPullRequestList;
    let monthlyPRMap;
    let pullRequestsAging;
    let totalCountForPRTrend;
    let totalCountForPRAging;
    try {
        githubPullRequestList = await this.extractPRListFromResponse(githubPrResponse);
        const githubPRListForLastSixMonths = await this.fetchLastSixMonthsPR(githubPullRequestList);
        totalCountForPRTrend = githubPRListForLastSixMonths.count;
        monthlyPRMap = await this.mapPRsByMonth(githubPRListForLastSixMonths.prDetails);
        pullRequestsAging = await this.getPRAgingDetails(githubPullRequestList);
        totalCountForPRAging = await this.fetchOpenPRCount(githubPullRequestList);
    } catch (error) {
        this.logger.error("Error processing pull requests list:", error as Error);
        return {};
    }

    return {
        githubPRList: githubPullRequestList,
        monthlyPRMap,
        pullRequestsAging,
        totalCountForPRTrend,
        totalCountForPRAging
    };
  }

  async fetchGithubPRList(
      owner: string,
      repo: string,
      githubToken: any,
      requestType: string,
      durationDate?: Date | undefined,
  ) {

    try
    {
      switch (requestType) {
        case 'open':
            return await this.githubHelperService.fetchGithubPRList(
              owner,
              repo,
              githubToken,
              ['OPEN'],
              false,
              durationDate,
            );
        case 'close':
            return await this.githubHelperService.fetchGithubPRList(
              owner,
              repo,
              githubToken,
              ['CLOSED'],
              false,
              durationDate,
            );
        case 'all':
            return await this.githubHelperService.fetchGithubPRList(
              owner,
              repo,
              githubToken,
              ['OPEN', 'CLOSED', 'MERGED'],
              false,
              durationDate,
            );
        case 'merge':
          return await this.githubHelperService.fetchGithubPRList(
            owner,
            repo,
            githubToken,
            ['MERGED'],
            false,
            durationDate,
          );
        default:
            return await this.githubHelperService.fetchGithubPRListforGraph(
              owner,
              repo,
              githubToken,
              ['OPEN', 'CLOSED', 'MERGED'],
              true
            );
    }
    } catch(error: any) {
      throw error;
    }
  }

  async extractPRListFromResponse(githubPrResponse: any[]) {
    this.logger.info('Filter PR list data...');
    const today = new Date();
    const prList = githubPrResponse.map((pr: any) => {
      const createdAtDate = new Date(pr.createdAt);
      const updatedAtDate = new Date(pr.updatedAt);
  
      // Calculate the difference in days between today and the creation date
      let createdAtDays = (Math.floor((today.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24))).toString();
      // If the creation date is today, set createdAtDays to today
      if (createdAtDate.toDateString() === today.toDateString()) {
        createdAtDays = 'Today';
      } else {
        createdAtDays += ' days ago';
      }
  
      // Calculate the difference in days between today and the update date
      let updatedAtDays = (Math.floor((today.getTime() - updatedAtDate.getTime()) / (1000 * 60 * 60 * 24))).toString();
      // If the update date is today, set updatedAtDays to today
      if (updatedAtDate.toDateString() === today.toDateString()) {
        updatedAtDays = 'Today';
      } else {
        updatedAtDays += ' days ago';
      }
  
      const url = pr.url.replace('api.github.com', 'github.com');
      const url1 = url.replace('\/repos', '');
      const repoUrl = url1.replace('pulls', 'pull');
  
      return {
        number: pr.number,
        state: pr.state,
        url: repoUrl,
        creator: pr.author,
        createdAt: createdAtDays,
        createdAtDate: pr.createdAt,
        updatedAt: updatedAtDays,
        updatedAtDate: pr.updatedAt,
        title: pr.title,
        isDraft: pr.isDraft,
        reviewDecision: pr.reviewDecision,
        closed: pr.closed,
        labels: pr.labels,
        unresolvedReviewThreadsCount: pr.unresolvedReviewThreadsCount,
        comments: pr.comments,
        totalCommentsCount: pr.totalCommentsCount,
        reviews: pr.reviews,
        reviewRequests: pr.reviewRequests,
        author: pr.author,
        assignees: pr.assignees,
      };
    });
    return prList;
  }

  async fetchLastSixMonthsPR(pullRequests: any[]) {
    this.logger.info('Fetching last 6 months PR...');
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
    const filteredPRs = pullRequests.filter((pr: any) => new Date(pr.createdAtDate) > sixMonthsAgo);
    const prCount = filteredPRs.length;
  
    return {
      count: prCount,
      prDetails: filteredPRs
    };
  }

  async fetchOpenPRCount(pullRequests: any[]) {
    this.logger.info('Fetching PR with state as OPEN...');
    const filteredPRs = pullRequests.filter((pr: any) => pr.state === 'OPEN');
    const openPRCount = filteredPRs.length;
    return openPRCount;
  }
  
  async mapPRsByMonth(pullRequests: any[]) {
    this.logger.info('Mapping monthly count for last six months...');
    const monthPRMap: { [key: string]: number } = {};
  
    // Initialize the map with the last six months set to 0
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthPRMap[monthYear] = 0;
      date.setMonth(date.getMonth() - 1);
    }
    
    // Iterate through pull requests and count the number of PRs created each month
    pullRequests.forEach((pr: any) => {
      const createdDate = new Date(pr.createdAtDate);
      const monthYear = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthPRMap[monthYear]) {
        monthPRMap[monthYear]++;
      } else {
        monthPRMap[monthYear] = 1;
      }
    });
  
    // Convert object to array of key-value pairs
    const monthlyPRArray = Object.entries(monthPRMap);
  
    // Sort the array based on the keys (month and year combinations)
    monthlyPRArray.sort(([key1], [key2]) => {
      const [month1, year1] = key1.split(' ');
      const [month2, year2] = key2.split(' ');
      // Compare years first
      if (year1 !== year2) {
        return parseInt(year1) - parseInt(year2);
      }
      // If years are equal, compare months
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(month1) - monthOrder.indexOf(month2);
    });
  
    // Convert the sorted array back to an object
    const sortedMonthlyPRMap: { [key: string]: number } = {};
    monthlyPRArray.forEach(([key, value]) => {
      sortedMonthlyPRMap[key] = value;
    });
  
    return sortedMonthlyPRMap;
  }
  
  async getPRAgingDetails(pullRequests: any) {
    // Define the thresholds for each age category
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
  
    // Initialize counters for each age category
    let count0to15Days = 0;
    let count15to30Days = 0;
    let count1to3Months = 0;
    let countMoreThan3Months = 0;
  
    // Iterate through the pull requests and count them based on their age category
    pullRequests.forEach((pr: any) => {
      if (pr.state === 'OPEN') {
        const createdDate = new Date(pr.createdAtDate);
        const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
  
        if (createdDate >= fifteenDaysAgo && daysSinceCreation <= 15) {
          count0to15Days++;
        } else if (createdDate >= thirtyDaysAgo && daysSinceCreation <= 30) {
          count15to30Days++;
        } else if (createdDate >= threeMonthsAgo && daysSinceCreation <= 90) {
          count1to3Months++;
        } else {
          countMoreThan3Months++;
        }
      }
    });
  
    const pullRequestsAging = {
      '0-14 days': count0to15Days,
      '15-29 days': count15to30Days,
      '1-3 months': count1to3Months,
      '>=3 months': countMoreThan3Months,
    };
    return pullRequestsAging;
  }

}

export default GithubPullRequestService;
