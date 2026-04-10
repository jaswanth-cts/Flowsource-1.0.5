import { Octokit } from '@octokit/rest';
import GithubHelper from './githubHelper.service';
import { LoggerService } from '@backstage/backend-plugin-api';

class GithubPRMetricService {
  githubHelperService: GithubHelper;
  octokit: any;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    // Initialize the GithubHelper service
    this.githubHelperService = new GithubHelper( logger);
  }

  // Initialize octokit with the provided token
  initializeOctokit(githubToken: any) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  formatDateToMonthYear(date: Date): string {
    const options = { year: 'numeric', month: 'short' } as const;
    return date.toLocaleDateString('en-US', options);
  }

  // Helper function to convert milliseconds to days
  formatTimeInDays(milliseconds: number): number {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalDays = totalSeconds / (3600 * 24);
    return totalDays;
  }

  // Helper function to determine color based on value
  getColor(value: number, min: number, max: number): string {
    if (value <= min) return 'green';
    if (value > min && value <= max) return '#FFBF00';
    return 'red';
  }

  // Fetch pull request metrics for a given repository
  async fetchPRMetrics(
    repoOwner: string,
    repoName: string,
    githubToken: any,
    durationDaysCatalog: number,
    durationConfig: number,
    cycleTimes: any
  ) {
    try {
      // Calculate the duration in milliseconds
      const durationInDays = durationDaysCatalog || durationConfig;
      const durationInMilliseconds = durationInDays * 24 * 60 * 60 * 1000;
      const durationDate = new Date(Date.now() - durationInMilliseconds);

      // Initialize octokit with the provided token
      this.initializeOctokit(githubToken);

      // Use the helper file's GraphQL method to fetch pull requests
      const pullRequests = await this.githubHelperService.fetchAllPRs(
        repoOwner,
        repoName,
        githubToken,
        ['OPEN', 'CLOSED', 'MERGED'],
        durationDate
      );

      // Initialize metrics and monthly counts
      const metrics = {
        prRaisedToApproved: 0,
        prApprovedToMerged: 0,
        prRaisedToMerged: 0,
        prRaisedToApprovedCount: 0,
        prApprovedToMergedCount: 0,
        prRaisedToMergedCount: 0,
      };

      const monthlyCounts: { [key: string]: number } = {};

      // Iterate through each pull request to calculate metrics
      for (const pr of pullRequests) {
        try {
          const createdAt = new Date(pr.createdAt);
          let approvedAt: Date | null = null;
          let mergedAt: Date | null = pr.mergedAt ? new Date(pr.mergedAt) : null;

          // Find the first approval date
          for (const review of pr.reviews) {
            if (review.state === 'APPROVED') {
              approvedAt = new Date(review.submittedAt);
              break;
            }
          }

          // Calculate time from PR raised to approved
          if (approvedAt) {
            const prRaisedToApproved = approvedAt.getTime() - createdAt.getTime();
            metrics.prRaisedToApproved += prRaisedToApproved;
            metrics.prRaisedToApprovedCount++;
          }

          // Calculate time from PR approved to merged
          if (approvedAt && mergedAt && pr.state === 'MERGED') {
            const prApprovedToMerged = mergedAt.getTime() - approvedAt.getTime();
            metrics.prApprovedToMerged += prApprovedToMerged;
            metrics.prApprovedToMergedCount++;
          }

          // Calculate time from PR raised to merged
          if (mergedAt && pr.state === 'MERGED') {
            const prRaisedToMerged = mergedAt.getTime() - createdAt.getTime();
            metrics.prRaisedToMerged += prRaisedToMerged;
            metrics.prRaisedToMergedCount++;
          }

          // Count PRs created and merged in the same month and year
          if (
            createdAt.getMonth() === mergedAt?.getMonth() &&
            createdAt.getFullYear() === mergedAt?.getFullYear()
          ) {
            const monthYear = this.formatDateToMonthYear(createdAt);
            if (!monthlyCounts[monthYear]) {
              monthlyCounts[monthYear] = 0;
            }
            monthlyCounts[monthYear]++;
          }
        } catch (prError) {
          this.logger.error('Error processing pull request:', prError as Error);
          // Handle individual pull request error without stopping the entire process
        }
      }

      // Calculate averages for each metric
      let prRaisedToApprovedAvg = 0;
      let prApprovedToMergedAvg = 0;
      let prRaisedToMergedAvg = 0;

      try {
        prRaisedToApprovedAvg = metrics.prRaisedToApprovedCount > 0 ? metrics.prRaisedToApproved / metrics.prRaisedToApprovedCount : 0;
      } catch (error) {
        this.logger.error('Error calculating prRaisedToApprovedAvg:', error as Error);
      }

      try {
        prApprovedToMergedAvg = metrics.prApprovedToMergedCount > 0 ? metrics.prApprovedToMerged / metrics.prApprovedToMergedCount : 0;
      } catch (error) {
        this.logger.error('Error calculating prApprovedToMergedAvg:', error as Error);
      }

      try {
        prRaisedToMergedAvg = metrics.prRaisedToMergedCount > 0 ? metrics.prRaisedToMerged / metrics.prRaisedToMergedCount : 0;
      } catch (error) {
        this.logger.error('Error calculating prRaisedToMergedAvg:', error as Error);
      }

      // Format metrics to days
      const formattedMetrics = {
        prRaisedToApproved: this.formatTimeInDays(prRaisedToApprovedAvg),
        prApprovedToMerged: this.formatTimeInDays(prApprovedToMergedAvg),
        prRaisedToMerged: this.formatTimeInDays(prRaisedToMergedAvg),
      };

      // Add color coding to metrics
      const coloredMetrics = {
        prRaisedToApproved: {
          value: `${formattedMetrics.prRaisedToApproved.toFixed(2)} days`,
          color: this.getColor(
            formattedMetrics.prRaisedToApproved,
            cycleTimes.prReviewCycleTimeMin,
            cycleTimes.prReviewCycleTimeMax
          ),
        },
        prApprovedToMerged: {
          value: `${formattedMetrics.prApprovedToMerged.toFixed(2)} days`,
          color: this.getColor(
            formattedMetrics.prApprovedToMerged,
            cycleTimes.prMergeCycleTimeMin,
            cycleTimes.prMergeCycleTimeMax
          ),
        },
        prRaisedToMerged: {
          value: `${formattedMetrics.prRaisedToMerged.toFixed(2)} days`,
          color: this.getColor(
            formattedMetrics.prRaisedToMerged,
            cycleTimes.prCycleTimeMin,
            cycleTimes.prCycleTimeMax
          ),
        },
        totalCounts: metrics.prRaisedToApprovedCount + metrics.prApprovedToMergedCount + metrics.prRaisedToMergedCount,
      };

      // Sort monthlyCounts by month in ascending order
      const sortedMonthlyCounts = Object.fromEntries(
        Object.entries(monthlyCounts).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      );

      // Return the metrics and sorted monthly counts
      return {
        metrics: coloredMetrics,
        monthlyCounts: sortedMonthlyCounts,
      };
    } catch (error) {
      this.logger.error('Error fetching PR metrics:', error as Error);
      throw new Error('Failed to fetch PR metrics');
    }
  }
}

export default GithubPRMetricService;