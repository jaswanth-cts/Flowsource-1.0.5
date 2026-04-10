import { BitbucketBackendDataService } from './bitbucketBackendData.service';
import { LoggerService } from '@backstage/backend-plugin-api';

class BitbucketPRMetricsService {
  bitbucketService: BitbucketBackendDataService;
  logger: LoggerService;

  constructor(logger: LoggerService) {
    this.bitbucketService = new BitbucketBackendDataService(logger);
    this.logger = logger; // Assign the logger instance
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

  // Fetch and calculate PR metrics
  async fetchPRMetrics(
    repoName: string,
    repoOwner: string,
    baseUrl: string,
    authToken: string,
    cycleTimes: any,
    durationInMonths: number,
  ) {
    try {
      this.logger.info(`Fetching PR metrics for repo: ${repoName}, owner: ${repoOwner}`); // Log the start of the operation

      const pullRequests =
        await this.bitbucketService.fetchMergedAndApprovedPRs(
          repoName,
          repoOwner,
          baseUrl,
          authToken,
          durationInMonths,
        );

      this.logger.info(`Fetched ${pullRequests.length} pull requests`); // Log the number of pull requests fetched

      const metrics = {
        prRaisedToApproved: 0,
        prApprovedToMerged: 0,
        prRaisedToMerged: 0,
        prRaisedToApprovedCount: 0,
        prApprovedToMergedCount: 0,
        prRaisedToMergedCount: 0,
      };

      const monthlyCounts: { [key: string]: number } = {};
      const durationDate = new Date();
      durationDate.setMonth(durationDate.getMonth() - durationInMonths);

      const monthlyCycleTimes: {
        [key: string]: { totalCycleTime: number; count: number };
      } = {};

      for (const pr of pullRequests) {
        const createdAt = new Date(pr.createdAt);
        const approvedAt = pr.approvedAt ? new Date(pr.approvedAt) : null;
        const mergedAt = pr.mergedAt ? new Date(pr.mergedAt) : null;

        if (approvedAt) {
          const prRaisedToApproved = approvedAt.getTime() - createdAt.getTime();
          metrics.prRaisedToApproved += prRaisedToApproved;
          metrics.prRaisedToApprovedCount++;
        }

        if (approvedAt && mergedAt) {
          const prApprovedToMerged = mergedAt.getTime() - approvedAt.getTime();
          metrics.prApprovedToMerged += prApprovedToMerged;
          metrics.prApprovedToMergedCount++;
        }

        if (mergedAt) {
          const prRaisedToMerged = mergedAt.getTime() - createdAt.getTime();
          metrics.prRaisedToMerged += prRaisedToMerged;
          metrics.prRaisedToMergedCount++;

          const monthYear = createdAt.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });

          if (!monthlyCycleTimes[monthYear]) {
            monthlyCycleTimes[monthYear] = { totalCycleTime: 0, count: 0 };
          }

          monthlyCycleTimes[monthYear].totalCycleTime += prRaisedToMerged;
          monthlyCycleTimes[monthYear].count++;
        }

        if (createdAt >= durationDate) {
          const monthYear = createdAt.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });
          if (!monthlyCounts[monthYear]) {
            monthlyCounts[monthYear] = 0;
          }
          monthlyCounts[monthYear]++;
        }
      }

      const sortedMonthlyCounts = Object.fromEntries(
        Object.entries(monthlyCounts)
          .filter(([key]) => {
            const date = new Date(key + ' 1');
            if (isNaN(date.getTime())) {
              this.logger.warn(`Invalid date encountered: ${key}`); // Log invalid dates
              return false;
            }
            return true;
          })
          .sort(
            ([a], [b]) =>
              new Date(a + ' 1').getTime() - new Date(b + ' 1').getTime(),
          ),
      );

      const monthlyAvgCycleTimes: { [key: string]: number } = {};
      Object.entries(monthlyCycleTimes).forEach(([month, data]) => {
        const avgCycleTime =
          data.count > 0
            ? this.formatTimeInDays(data.totalCycleTime / data.count)
            : 0;
        monthlyAvgCycleTimes[month] = avgCycleTime;
      });

      const sortedMonthlyAvgCycleTimes = Object.fromEntries(
        Object.entries(monthlyAvgCycleTimes).sort(
          ([a], [b]) =>
            new Date(a + ' 1').getTime() - new Date(b + ' 1').getTime(),
        ),
      );

      const prRaisedToApprovedAvg =
        metrics.prRaisedToApprovedCount > 0
          ? metrics.prRaisedToApproved / metrics.prRaisedToApprovedCount
          : 0;
      const prApprovedToMergedAvg =
        metrics.prApprovedToMergedCount > 0
          ? metrics.prApprovedToMerged / metrics.prApprovedToMergedCount
          : 0;
      const prRaisedToMergedAvg =
        metrics.prRaisedToMergedCount > 0
          ? metrics.prRaisedToMerged / metrics.prRaisedToMergedCount
          : 0;

      const formattedMetrics = {
        prRaisedToApproved: this.formatTimeInDays(prRaisedToApprovedAvg),
        prApprovedToMerged: this.formatTimeInDays(prApprovedToMergedAvg),
        prRaisedToMerged: this.formatTimeInDays(prRaisedToMergedAvg),
      };

      const coloredMetrics = {
        prRaisedToApproved: {
          value: `${formattedMetrics.prRaisedToApproved.toFixed(2)} days`,
          color: this.getColor(
            formattedMetrics.prRaisedToApproved,
            cycleTimes.prReviewCycleTimeMin,
            cycleTimes.prReviewCycleTimeMax,
          ),
        },
        prApprovedToMerged: {
          value: `${formattedMetrics.prApprovedToMerged.toFixed(2)} days`,
          color: this.getColor(
            formattedMetrics.prApprovedToMerged,
            cycleTimes.prMergeCycleTimeMin,
            cycleTimes.prMergeCycleTimeMax,
          ),
        },
        prRaisedToMerged: {
          value: `${formattedMetrics.prRaisedToMerged.toFixed(2)} days`,
          color: this.getColor(
            formattedMetrics.prRaisedToMerged,
            cycleTimes.prCycleTimeMin,
            cycleTimes.prCycleTimeMax,
          ),
        },
        totalCounts: pullRequests.length,
      };

      this.logger.info('Successfully calculated PR metrics'); // Log success

      return {
        metrics: coloredMetrics,
        monthlyCounts: sortedMonthlyCounts,
        monthlyAvgCycleTimes: sortedMonthlyAvgCycleTimes,
      };
    } catch (error) {
      this.logger.error('Error fetching PR metrics:', error as Error); // Log errors
      throw error;
    }
  }
}

export default BitbucketPRMetricsService;
