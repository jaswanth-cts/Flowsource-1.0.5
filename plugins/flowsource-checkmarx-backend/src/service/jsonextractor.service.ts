const _ = require('lodash');
import { LoggerService } from '@backstage/backend-plugin-api';

class JsonExtractorService {
    logger: LoggerService;
    constructor(logger: LoggerService) {
        this.logger = logger;
    }
    async getTopFiveVulnerabilities(scanReport: any = {}) {
        if (!scanReport || !scanReport.CxXMLResults || !scanReport.CxXMLResults.Query) {
          this.logger.info('Scan report doesnot have Query tag');
          return undefined;
        }
        let sortedTopFiveVulnerabilities: any[] = [];
        let { CxXMLResults }: any = scanReport;
        const { Query } = CxXMLResults;
    
        // Return the query$.name and query.Result after mapping
        const vulnerabilitiesIdentified = Query?.map((query: any) => ({
            name: query.$.name,
            count: query.Result.length,
            severity: query.$.Severity
        })) || [];
    
        if (vulnerabilitiesIdentified.length > 0) {
          const vulnerabilities = vulnerabilitiesIdentified.filter((vulnerability: any) => vulnerability.severity === 'High');
          const mediumSeverityVulnerabilities = vulnerabilitiesIdentified.filter((vulnerability: any) => vulnerability.severity === 'Medium');
          const lowSeverityVulnerabilities = vulnerabilitiesIdentified.filter((vulnerability: any) => vulnerability.severity === 'Low');
    
          if (mediumSeverityVulnerabilities.length > 0) {
            const sortedMediumVulnerabilities = _.orderBy(mediumSeverityVulnerabilities, ['count'], ['desc']);
            vulnerabilities.push(...sortedMediumVulnerabilities); //spread operator
          }
    
          if (lowSeverityVulnerabilities.length > 0) {
            const sortedLowVulnerabilities = _.orderBy(lowSeverityVulnerabilities, ['count'], ['desc']);
            vulnerabilities.push(...sortedLowVulnerabilities);
          }
    
          const topFiveVulnerabilities = vulnerabilities.slice(0, 5);
          sortedTopFiveVulnerabilities = _.orderBy(topFiveVulnerabilities, ['count'], ['desc']);
        }
        return sortedTopFiveVulnerabilities;
    }
    
      getStringAfterLastSlash = (path: any) => {
        const lastIndex = path.lastIndexOf('/');
        if (lastIndex !== -1) {
          return path.substring(lastIndex + 1);
        }
        return path;
      }
    
      async getTopFiveVulnerableFiles(scanReport: any = {}, sortedTopFiveVulnerabilities: any = []) {
        let { CxXMLResults }: any = scanReport;
        const { Query } = CxXMLResults;
    
        let sortedPathNodeCounts: any = [];
        sortedTopFiveVulnerabilities?.forEach((vulnerability: any) => {
          ['High', 'Medium', 'Low'].forEach((severity: any) => {
            const matchingQuery = Query?.find((query: any) => query.$.name === vulnerability.name && query.$.Severity === severity);
            let mostVulnerableFile: any = {};
            if (matchingQuery) {
              let pathNodeCounts: { [fileName: string]: number } = {};
              matchingQuery.Result.forEach((result: any) => {
                result.Path.forEach((path: any) => {
                  path.PathNode.forEach((pathNode: any) => {
                    const fileName = pathNode.FileName[0];
                    if (pathNodeCounts[fileName]) {
                      pathNodeCounts[fileName]++;
                    } else {
                      pathNodeCounts[fileName] = 1;
                    }
                  });
                });
    
                mostVulnerableFile = Object.entries(pathNodeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 1)
                  .reduce((_obj: any, [fileName, count]) => {
                    return {
                      mostVulnerableFile: this.getStringAfterLastSlash(fileName),
                      mostVulnerableFileCount: count
                    };
                  }, {});
              });
    
              sortedPathNodeCounts.push({
                vulnerability,
                ...mostVulnerableFile
              });
            }
          });
        });
    
        return sortedPathNodeCounts;
      }
    
    
      async getProjectSummary(scanReport: any = {}) {

        this.logger.info('fetching project summary from json report');
        if (!scanReport || !scanReport.CxXMLResults) {
          this.logger.info('Scan report doesnot have CxXMLResults tag');
          return undefined;
        }
        let { CxXMLResults }: any = scanReport;
        const { Query } = CxXMLResults;
        let totalVulnerabilityCount = 0;
        const vulnerabilitiesIdentified = Query?.map((query: any) => ({
          severity: query.$.Severity,
          result: query.Result || []
        })) || [];
    
        const linesOfCodeScanned = CxXMLResults.$.LinesOfCodeScanned;
        let density: string | undefined;
        if (vulnerabilitiesIdentified.length > 0) {
          vulnerabilitiesIdentified?.forEach((vulnerability: any) => {
            const results = vulnerability.result || [];

            results.forEach((result: any) => {
              const severity = result.$.Severity;
              if (severity === 'High' || severity === 'Medium' || severity === 'Low') {
                totalVulnerabilityCount++;
              }
              density = parseFloat(((totalVulnerabilityCount / linesOfCodeScanned) * 1000).toFixed(2)) + '/1000';
            });
          });
        }
        const projectSummary = {
          preset: CxXMLResults.$.Preset,
          name: CxXMLResults.$.ProjectName,
          lastScane: CxXMLResults.$.ScanStart,
          linesOfCodeScanned: CxXMLResults.$.LinesOfCodeScanned,
          filesScanned: CxXMLResults.$.FilesScanned,
          scanType: CxXMLResults.$.ScanType,
          density: density
        };
        return projectSummary;
      }
    
    
      async getOverallIssuesSummary(scanReport: any = {}) {

        if (!scanReport || !scanReport.CxXMLResults || !scanReport.CxXMLResults.Query) {
          this.logger.info('Scan report doesnot have Query tag');
          return undefined;
        }
        this.logger.info('fetching overall summary from json report');
        let { CxXMLResults }: any = scanReport;
        const { Query } = CxXMLResults;
        let highVulnerabilityCount = 0;
        let mediumVulnerabilityCount = 0;
        let lowVulnerabilityCount = 0;
    
        const vulnerabilitiesIdentified = Query?.map((query: any) => ({
            severity: query.$.Severity,
            result: query.Result || []
        })) || [];
    
        let overallIssuesSummary;
        if (vulnerabilitiesIdentified.length > 0) {
          vulnerabilitiesIdentified?.forEach((vulnerability: any) => {
            const results = vulnerability.result || [];

            results?.forEach((result: any) => {
              const severity = result.$.Severity;
              if (severity === 'High') {
                highVulnerabilityCount++;
              } else if (severity === 'Medium') {
                mediumVulnerabilityCount++;
              } else if (severity === 'Low') {
                lowVulnerabilityCount++;
              }
            });
          });
          const totalVulnerabilityCount = highVulnerabilityCount + mediumVulnerabilityCount + lowVulnerabilityCount;

          const calculatePercentage = (count: any) => {
            const percentage = (count / totalVulnerabilityCount) * 100;
            return parseFloat(percentage.toFixed(2)); // Rounds to 2 decimal places
          };

          overallIssuesSummary = {
            high: calculatePercentage(highVulnerabilityCount),
            medium: calculatePercentage(mediumVulnerabilityCount),
            low: calculatePercentage(lowVulnerabilityCount)
          };
        }
        return overallIssuesSummary;
      }
    
      async getNewIssuesSummary(scanReport: any = {}) {

        if (!scanReport || !scanReport.CxXMLResults || !scanReport.CxXMLResults.Query) {
          this.logger.info('Scan report doesnot have Query tag');
          return undefined;
        }
        this.logger.info('fetching new issues summary from json report');
        let { CxXMLResults }: any = scanReport;
        const { Query } = CxXMLResults;
        let newHighVulnerabilityCount = 0;
        let newMediumVulnerabilityCount = 0;
        let newLowVulnerabilityCount = 0;
    
        const vulnerabilitiesIdentified = Query?.map((query: any) => ({
            severity: query.$.Severity,
            result: query.Result || []
        })) || [];
    
        let newIssuesSummary;
        if (vulnerabilitiesIdentified.length > 0) {
          vulnerabilitiesIdentified?.forEach((vulnerability: any) => {
            const severity = vulnerability.severity;
            const results = vulnerability.result || [];

            results?.forEach((result: any) => {
              const status = result.$.Status;
              if (status === 'New') {
                if (severity === 'High') {
                  newHighVulnerabilityCount++;
                } else if (severity === 'Medium') {
                  newMediumVulnerabilityCount++;
                } else if (severity === 'Low') {
                  newLowVulnerabilityCount++;
                }
              }
            });
          });

          const totalNewVulnerabilityCount = newHighVulnerabilityCount + newMediumVulnerabilityCount + newLowVulnerabilityCount;
          const calculatePercentage = (count: any) => {
            const percentage = (count / totalNewVulnerabilityCount) * 100;
            return parseFloat(percentage.toFixed(2)); // Rounds to 2 decimal places
          };

          newIssuesSummary = {
            "high": calculatePercentage(newHighVulnerabilityCount),
            "medium": calculatePercentage(newMediumVulnerabilityCount),
            "low": calculatePercentage(newLowVulnerabilityCount)
          };
        }
        return newIssuesSummary;
      }
    
    
      async getVulnerabilityAsOfCurrentDate(scanReport: any = {}) {
        this.logger.info('fetching vulnerability as of current date from json report');
        if (!scanReport || !scanReport.CxXMLResults || !scanReport.CxXMLResults.Query) {
          this.logger.info('Scan report doesnot have Query tag');
          return undefined;
        }
        let { CxXMLResults }: any = scanReport;
        const { Query } = CxXMLResults;
        const currentDate = new Date();
    
        const vulnerabilitiesByCategory: Record<string, Record<string, number>> = {
            '0-15 days': { High: 0, Medium: 0, Low: 0 },
            '15-30 days': { High: 0, Medium: 0, Low: 0 },
            '1-3 months': { High: 0, Medium: 0, Low: 0 },
            '>3 months': { High: 0, Medium: 0, Low: 0 },
        };
        
        const vulnerabilitiesIdentified = Query?.map((query: any) => ({
            severity: query.$.Severity,
            result: query.Result || []
        })) || [];
        
        vulnerabilitiesIdentified?.forEach((vulnerability: any) => {
            const results = vulnerability.result || [];
            results?.forEach((result: any) => {
                const detectionDate = new Date(result.$.DetectionDate);
                //this.logger.log('Detection Date ===> ', detectionDate);
                const diffTime = Math.abs(currentDate.getTime() - detectionDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days
    
                let category: string;
    
                if (diffDays >= 0 && diffDays <= 15) {
                    category = '0-15 days';
                } else if (diffDays > 15 && diffDays <= 30) {
                    category = '15-30 days';
                } else if (diffDays > 30 && diffDays <= 90) {
                    category = '1-3 months';
                } else {
                    category = '>3 months';
                }
    
                const severity = result.$.Severity;
                vulnerabilitiesByCategory[category][severity]++;
            });
        }); 
        //this.logger.log('Vulnerabilities by Category:', vulnerabilitiesByCategory);
        return vulnerabilitiesByCategory;
      }

}

export default JsonExtractorService;