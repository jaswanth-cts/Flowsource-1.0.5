import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';
class CodeQualityService {
    authToken: string = ''
    baseUrl: string = ''
    version: string = '';
    headers: any;
    logger: LoggerService;
    constructor(authToken: any, baseUrl: any ,version : any, logger: LoggerService) {
        this.authToken = authToken
        this.baseUrl = baseUrl;
        this.version = version;
        this.headers={
            'Authorization': 'Basic ' + Buffer.from(`${this.authToken}:`).toString('base64'),
        };
        this.logger = logger;
    }

    private async fetchWithAuth(endpoint: string, projectName: string): Promise<any> {
        try
        {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await apiRequest(
                'GET',
                url,
                this.headers,
                this.logger,
            )

            if (!response.ok)
            {
                const errorData = JSON.stringify(await response.json());

                if(errorData.includes(`Component key '${projectName}' not found`)
                    || errorData.includes(`Project '${projectName}' not found`))
                {
                    const customError = new Error(`Project not found`);
                    (customError as any).status = 404; // Attach status code to error object
                    (customError as any).response = {
                        status: 404,
                        data: { message: `Project not found` },
                    };
                    throw customError;
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorData}`);
                }
            }

            return response.json();
        } catch (error: any) {
            throw error;
        }
    }


    getSonarDetails = async (projectKey: string): Promise<any> => {
        try {
            return this.fetchWithAuth(`/api/measures/component?metricKeys=bugs,coverage,code_smells,duplicated_lines_density,vulnerabilities&component=${projectKey}`, projectKey);
        } catch(error: any) {
            throw error;
        }
    }

    getSonarHotspot = async (projectKey: string): Promise<any> => {
        try {
            return this.fetchWithAuth(`/api/hotspots/search?projectKey=${projectKey}&p=1&ps=500&status=REVIEWED&onlyMine=false&sinceLeakPeriod=false`, projectKey);
        } catch(error: any) {
            throw error;
        }
    }

    getSonarHistoricalDetails = async (projectKey: string): Promise<any> => {
        try {
            return this.fetchWithAuth(`/api/measures/search_history?component=${projectKey}&metrics=bugs,code_smells,vulnerabilities`, projectKey);
        } catch(error: any) {
            throw error;
        }
    }

    getSonarHistoricalHotspot = async (projectKey: string): Promise<any> => {
        try {
            return this.fetchWithAuth(`/api/measures/search_history?component=${projectKey}&metrics=security_hotspots`, projectKey);
        } catch(error: any) {
            throw error;
        }
    }

    getSonarDate = async (projectKey: string): Promise<string> => {
        try
        {
            const response = await this.fetchWithAuth(`/api/project_analyses/search?project=${projectKey}`, projectKey);

            const dateTime = new Date(response.analyses[0].date);
            const date = `${dateTime.getDate()}-${dateTime.getMonth() + 1}-${dateTime.getFullYear()}`;
            return date;
        } catch(error: any) {
            throw error;
        }
    }


    getQualityGateStatus = async (projectKey: string): Promise<string> => {
        try
        {
            const response = await this.fetchWithAuth(`/api/qualitygates/project_status?projectKey=${projectKey}`, projectKey);

            let status = response.projectStatus.status;
            if (status === 'OK') {
                status = 'Passed';
            } else if (status === 'ERROR') {
                status = 'Failed';
            }
            return status;
        } catch(error: any) {
            throw error;
        }
    }

    getSonarAlertStatus = async (projectKey: string): Promise<any> => {
        try {
            return this.fetchWithAuth(`/api/measures/search_history?component=${projectKey}&metrics=alert_status`, projectKey);
        } catch(error: any) {
            throw error;
        }
    }

    getSummaryDetails = async (projectKey: string): Promise<any> => {
        try
        {
            const promises = [
                this.getSonarDetails(projectKey),
                this.getSonarHotspot(projectKey),
                this.getSonarHistoricalDetails(projectKey),
                this.getSonarHistoricalHotspot(projectKey),
                this.getSonarDate(projectKey),
                this.getQualityGateStatus(projectKey),
                this.getSonarAlertStatus(projectKey)
            ];

            const results = await Promise.allSettled(promises);

            let isProjectNotFound = false;
            for (let i = 0; i < results.length; i++) {
                if (results[i].status === 'rejected')
                {
                    this.logger.error(`Promise ${i} failed.`);

                    if (JSON.stringify(results[i]).includes('Project not found')) {
                        isProjectNotFound = true;
                        break; // Exit the loop when project not found
                    };
                };
            };

            if (isProjectNotFound) {
                const customError = new Error(`Project not found`);
                (customError as any).status = 404; // Attach status code to error object
                (customError as any).response = {
                    status: 404,
                    data: { message: `Project not found` },
                };
                throw customError;
            };

            const findMeasureByMetric = (measures: any[], metric: string) => {
                const measure = measures.find((m: any) => m.metric === metric);
                return measure ? measure.value : 'No Data Found';
            };

            const sonarDetails = results[0].status === 'fulfilled' ? results[0].value : null;
            const sonarHotspot = results[1].status === 'fulfilled' ? results[1].value : null;
            const sonarHistoricalDetails = results[2].status === 'fulfilled' ? results[2].value : null;
            const sonarHistoricalHotspot = results[3].status === 'fulfilled' ? results[3].value : null;
            const sonarDate = results[4].status === 'fulfilled' ? results[4].value : null;
            const qualityGateStatus = results[5].status === 'fulfilled' ? results[5].value : null;
            const sonarAlertStatus = results[6].status === 'fulfilled' ? results[6].value : null;

            return {
                showUpdatedLabels : this.compareVersions(this.version, '10.4.0'),
                status: qualityGateStatus,
                statusMessage: qualityGateStatus === 'Passed' ? 'All conditions passed' : 'All conditions failed',
                date: sonarDate,
                bugs: findMeasureByMetric(sonarDetails.component.measures, 'bugs') ? findMeasureByMetric(sonarDetails.component.measures, 'bugs') : 'No Data Found',
                coverage: findMeasureByMetric(sonarDetails.component.measures, 'coverage') ? findMeasureByMetric(sonarDetails.component.measures, 'coverage') + '%' : 'No Data Found',
                vulnerabilities: findMeasureByMetric(sonarDetails.component.measures, 'vulnerabilities') ? findMeasureByMetric(sonarDetails.component.measures, 'vulnerabilities') : 'No Data Found',
                codeSmells: findMeasureByMetric(sonarDetails.component.measures, 'code_smells') ? findMeasureByMetric(sonarDetails.component.measures, 'code_smells') : 'No Data Found',
                duplication: findMeasureByMetric(sonarDetails.component.measures, 'duplicated_lines_density') ? findMeasureByMetric(sonarDetails.component.measures, 'duplicated_lines_density') + '%' : 'No Data Found',
                hotspots: sonarHotspot ? sonarHotspot.paging.total.toString() : '',
                sonarDetailsData: sonarDetails,
                sonarHotspotData: sonarHotspot,
                sonarHistoricalDetailsData: sonarHistoricalDetails,
                sonarHistoricalHotspotData: sonarHistoricalHotspot,
                sonarDateData: sonarDate,
                sonarAlertStatusData: sonarAlertStatus,
                activityChartData: sonarHistoricalDetails ? (() => {
                    let dateMap = new Map<string, { metric: string, value: string, date: string }[]>();
                    sonarHistoricalDetails.measures.forEach((measure: any) => {
                        measure.history.forEach((history: any) => {
                            let date = new Date(history.date);
                            let monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            if (!dateMap.has(monthYear)) {
                                dateMap.set(monthYear, []);
                            }
                            dateMap.get(monthYear)!.push({
                                metric: measure.metric,
                                value: history.value,
                                date: history.date
                            });
                        });
                    });


                    // Aggregate data by month, keeping only the latest entry
                    let aggregatedData: { [key: string]: { date: string, bugsData: number, codeSmellData: number, vulnerabilityData: number } } = {};
                    Array.from(dateMap).forEach(([date, histories]) => {
                        // Initialize aggregatedData for the month if not already done
                        if (!aggregatedData[date]) {
                            aggregatedData[date] = {
                                date: date,
                                bugsData: 0,
                                codeSmellData: 0,
                                vulnerabilityData: 0
                            };
                        }

                        // Assign values based on the metric type and log them
                        histories.forEach((history) => {
                            if (history.metric === 'bugs') {
                                aggregatedData[date].bugsData = parseInt(history.value);
                            }
                            if (history.metric === 'code_smells') {
                                aggregatedData[date].codeSmellData = parseInt(history.value);
                            }
                            if (history.metric === 'vulnerabilities') {
                                aggregatedData[date].vulnerabilityData = parseInt(history.value);
                            }
                        });
                    });

                    // Convert the aggregated data object back to an array
                    return Object.values(aggregatedData);
                })() : [],

                qualityGradeData: sonarAlertStatus ? (() => {
                    let rawData = sonarAlertStatus.measures.flatMap((measure: any) => {
                        return measure.history.map((history: any) => {
                            if (measure.metric === 'alert_status') {
                                let date = new Date(history.date);
                                let monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                if (history.value === 'OK') {
                                    return {
                                        date: monthYear,
                                        passedData: '1',
                                    };
                                } else {
                                    return {
                                        date: monthYear,
                                        failedData: '1',
                                    };
                                }
                            }
                            return null;
                        });
                    });

                    // Aggregate data by month, keeping only the latest entry
                    let aggregatedData: { [key: string]: { date: string, passedData?: number, failedData?: number } } = {};
                    rawData.forEach((data: { date: string, passedData?: string, failedData?: string }) => {
                        if (!aggregatedData[data.date]) {
                            aggregatedData[data.date] = {
                                date: data.date,
                                passedData: 0,
                                failedData: 0
                            };
                        }

                        if (data.passedData) {
                            aggregatedData[data.date].passedData = parseInt(data.passedData);
                        }
                        if (data.failedData) {
                            aggregatedData[data.date].failedData = parseInt(data.failedData);
                        }
                    });

                    // Ensure only the latest status is kept for each month
                    Object.keys(aggregatedData).forEach((key) => {
                        const passedData = aggregatedData[key]?.passedData ?? 0;
                        const failedData = aggregatedData[key]?.failedData ?? 0;

                        if (passedData && failedData) {
                            if (failedData > passedData) {
                                delete aggregatedData[key].passedData;
                            } else {
                                delete aggregatedData[key].failedData;
                            }
                        }
                    });

                    // Remove entries with zero values
                    Object.keys(aggregatedData).forEach((key) => {
                        if (aggregatedData[key]?.passedData === 0) {
                            delete aggregatedData[key].passedData;
                        }
                        if (aggregatedData[key]?.failedData === 0) {
                            delete aggregatedData[key].failedData;
                        }
                    });

                    // Convert the aggregated data object back to an array
                    return Object.values(aggregatedData);
                })() : []
            };
        } catch(error: any) {
            throw error;
        }
    }

    compareVersions(v1: string, v2: string) {
        try
        {
            const v1Parts = v1.split('.').map(Number);
            const v2Parts = v2.split('.').map(Number);

            for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
                const v1Part = v1Parts[i] || 0;
                const v2Part = v2Parts[i] || 0;

                if (v1Part > v2Part) return true;
                if (v1Part < v2Part) return false;
            }

            return false;
        } catch(error: any) {
            throw error;
        }
    }

}
export default CodeQualityService;
