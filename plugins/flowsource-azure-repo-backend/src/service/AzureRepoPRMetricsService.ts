import AzureRepoService from "./AzureRepoService";

class AzureRepoPRMetricsService {
  azureRepoService: AzureRepoService;

  constructor(azureRepoService: AzureRepoService) {
    this.azureRepoService = azureRepoService;
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

// Fetch and calculate PR metrics
async fetchPRMetrics(
  projectName: string,
  repositoryName: string,
  cycleTimes: any,
  durationDays: number
) {
  try {
    const pullRequests = await this.azureRepoService.fetchCompletedPRs(
      projectName,
      repositoryName,
      durationDays
    );

    const metrics = {
      prRaisedToApproved: 0,
      prApprovedToMerged: 0,
      prRaisedToMerged: 0,
      prRaisedToApprovedCount: 0,
      prApprovedToMergedCount: 0,
      prRaisedToMergedCount: 0,
    };

    const monthlyCounts: { [key: string]: number } = {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - durationDays);
    
    // Initialize monthly cycle time sums and counts
    const monthlyCycleTimes: {
      [key: string]: { totalCycleTime: number; count: number };
    } = {};

    const endDate = new Date();

    // Generate all months in the range
    const monthsInRange = [];
    let currentDate = new Date(startDate);
    const maxIterations = 100; // Limit to 100 iterations
    let iterationCount = 0;

    while (currentDate <= endDate) {
      const monthYear = this.formatDateToMonthYear(currentDate);
      monthsInRange.push(monthYear);
      currentDate.setMonth(currentDate.getMonth() + 1);
      iterationCount++;

      if (iterationCount > maxIterations) {
        console.error("Exceeded maximum iterations, breaking the loop to prevent infinite loop.");
        break;
      }
    }

    // Initialize monthlyCounts with all months in the range
    monthsInRange.forEach((month) => {
      if (!monthlyCounts[month]) {
        monthlyCounts[month] = 0; // Ensure all months are initialized to 0
      }
    });

    // Initialize monthlyCycleTimes with all months in the range
    monthsInRange.forEach((month) => {
    if (!monthlyCycleTimes[month]) {
      monthlyCycleTimes[month] = { totalCycleTime: 0, count: 0 }; // Ensure all months are initialized
    }
  });

    for (const pr of pullRequests) {
      const createdAt = new Date(pr.createdAt);

      if (createdAt >= startDate) {
        const approvedAt = new Date(pr.approvedAt);
        const mergedAt = new Date(pr.mergedAt);

        const prRaisedToApproved = approvedAt.getTime() - createdAt.getTime();
        metrics.prRaisedToApproved += prRaisedToApproved;
        metrics.prRaisedToApprovedCount++;

        const prApprovedToMerged = mergedAt.getTime() - approvedAt.getTime();
        metrics.prApprovedToMerged += prApprovedToMerged;
        metrics.prApprovedToMergedCount++;

        const prRaisedToMerged = mergedAt.getTime() - createdAt.getTime();
        metrics.prRaisedToMerged += prRaisedToMerged;
        metrics.prRaisedToMergedCount++;

        const monthYear = this.formatDateToMonthYear(createdAt);

         // Initialize the month entry if not present
         if (!monthlyCycleTimes[monthYear]) {
          monthlyCycleTimes[monthYear] = { totalCycleTime: 0, count: 0 };
        }

        // Add the cycle time to the month's total and increment the count
        monthlyCycleTimes[monthYear].totalCycleTime += prRaisedToMerged;
        monthlyCycleTimes[monthYear].count++;    
      }
    }

    // Calculate the total PR count for the selected duration
    const totalPRCount = Object.values(monthlyCycleTimes).reduce(
      (acc, data) => acc + data.count,
      0
    );

    // Calculate average cycle time for each month
    const monthlyAvgCycleTimes: { [key: string]: number } = {};
    Object.entries(monthlyCycleTimes).forEach(([month, data]) => {
      const avgCycleTime =
        data.count > 0
          ? this.formatTimeInDays(data.totalCycleTime / data.count)
          : 0;

      monthlyAvgCycleTimes[month] = avgCycleTime; // Store the average cycle time in days
    });   

    // Calculate averages
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
    };

    return {
      metrics: coloredMetrics,
      monthlyAvgCycleTimes,
      totalPRCount, 
    };
  } catch (error) {
    console.error("Error fetching PR metrics:", error);
    throw error;
  }
}
}
export default AzureRepoPRMetricsService;
