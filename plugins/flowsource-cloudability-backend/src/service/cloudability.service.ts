import { apiRequest } from './apiRequest';
import { CostSavingsContainersService } from './costSavingsContainers.service';
import { CostSavingsAWSService } from './costSavingsAWS.service';
import { CostSavingsAzureService } from './costSavingsAzure.service';
import { LoggerService } from '@backstage/backend-plugin-api';

export class CloudabilityService {
    cloudabiltyAuth: string = '';
    cloudabilityBaseUrl: string = '';
    headers: any;
    logger: LoggerService;

    constructor(cloudabiltyToken: string, cloudabilityBaseUrl: string, logger: LoggerService) {
        this.cloudabiltyAuth = "Basic " + btoa(cloudabiltyToken);
        this.cloudabilityBaseUrl = cloudabilityBaseUrl;
        this.headers = {
            'Authorization': this.cloudabiltyAuth,
        };
        this.logger = logger;
    }

    // -------------------------------Method to get view id from view name --------------------------
    async getViewId(view: string): Promise<any> {
        try {
            const res: any = await apiRequest(
                'GET',
                `${this.cloudabilityBaseUrl}/views`,
                this.headers,
                this.logger
            )
            if (!res.ok) {
                const errorText = await res.text();
                const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                (error as any).status = res.status; // Attach status code to error object
                (error as any).response = res; // Attach response object to error object
                throw error;
            }
            const responseData = await res.json();
            const views = responseData.result;

            for (const v of views) {
                if (v.title === view) {
                    return v.id; // return view id if matching view found
                }
            }

            return null; // View not found
        } catch (err) {
            this.logger.error('Error for getting view Id:', err as Error);
            throw err;
        }
    }

    // -------------------------------------- Total Cost ----------------------------------------------

    

    private async getTotalCostCurrentMonth(
        dimensionEnv: string,
        dimensionAppId: string,
        appId: string,
        viewId: number
    ): Promise<any> {
        const { startDate, endDate } = this.getStartAndEndDates();
        let currentMonthTotalCost = 0;
    
        let url: string | null = `${this.cloudabilityBaseUrl}/internal/reporting/cost/run?dimensions=year_month&dimensions=${dimensionEnv}&dimensions=${dimensionAppId}&end=${endDate}&limit=50&metrics=unblended_cost&relativePeriods=this_year&sort=year_monthDESC&start=${startDate}&filters=${dimensionAppId}==${appId}&viewId=${viewId}`;
    
        if (startDate !== endDate) {
            await this.fetchPaginatedData(url, (responseData) => {
                currentMonthTotalCost += parseFloat(responseData.aggregates[0].values[0]);
            });
        }
    
        return currentMonthTotalCost;
    }
    async getEnvTotalCost(dimensionEnv: string, dimensionAppId: string, env: string, appId: string, view: string): Promise<any> {
        const viewId = await this.getViewId(view);
        const envTotalCost = await this.getProdCostCurrentMonth(dimensionEnv, dimensionAppId, env, appId, viewId);
        // Now fetch previous month cost
        const prod_cost_previous_month = await this.getProdCostPreviousMonth(
            dimensionEnv,
            dimensionAppId,
            env,
            appId,
            viewId
        );

        // Calculate difference and sign
        const diff = envTotalCost - prod_cost_previous_month;
        const cost_diff = parseFloat(Math.abs(diff).toFixed(2));
        let sign = '';
        if (diff > 0) sign = '+';
        else if (diff < 0) sign = '-';
        const envCost = {
            total_cost_current_month: envTotalCost,
            costDiff: {
                [env]: {
                    value: cost_diff,
                    sign: sign
                }
            }
        };
        return envCost;
    }

    private async getProdCostCurrentMonth(
        dimensionEnv: string,
        dimensionAppId: string,
        envType: string,
        appId: string,
        viewId: number
    ): Promise<any> {
        const { startDate, endDate } = this.getStartAndEndDates();
        let prodCostCurrentMonth = 0;
    
        let url: string | null = `${this.cloudabilityBaseUrl}/internal/reporting/cost/run?dimensions=year_month&dimensions=${dimensionEnv}&dimensions=${dimensionAppId}&end=${endDate}&limit=50&metrics=unblended_cost&relativePeriods=this_year&sort=year_monthDESC&start=${startDate}&filters=${dimensionAppId}==${appId}&filters=${dimensionEnv}==${envType}&viewId=${viewId}`;
    
        if (startDate !== endDate) {
            await this.fetchPaginatedData(url, (responseData) => {
                const rows = responseData.rows;
                if (rows && rows.length > 0) {
                    for (const row of rows) {
                        if (row.metrics && row.metrics.length > 0) {
                            prodCostCurrentMonth += parseFloat(Number(row.metrics[0].sum).toFixed(2));
                        }
                    }
                }
            });
        }
    
        return prodCostCurrentMonth;
    }
    private async getCurrentMonthCost(dimensionEnv: string, dimensionAppId: string, envType: string, appId: string, viewId: number): Promise<any> {
        try {
            let total_cost_current_month = { "prod": 0, "non-prod": 0 };

            const [current_month_total, current_month_prod] = await Promise.all([
                this.getTotalCostCurrentMonth(dimensionEnv, dimensionAppId, appId, viewId),
                this.getProdCostCurrentMonth(dimensionEnv, dimensionAppId, envType, appId, viewId)
            ]);
            total_cost_current_month['prod'] = current_month_prod;

            total_cost_current_month['non-prod'] = current_month_total - total_cost_current_month['prod'];
            total_cost_current_month['non-prod'] = parseFloat(Number(total_cost_current_month['non-prod']).toFixed(2));

            return total_cost_current_month;

        } catch (error) {
            this.logger.error("Error fetching data for current month in getCurrentMonthCost:", error as Error);
            throw error;
        }
    }

    private async getTotalCostPreviousMonth(
        dimensionEnv: string,
        dimensionAppId: string,
        appId: string,
        viewId: number
    ): Promise<any> {
        try {
            const { startDate: previous_month_start_date, endDate: previous_month_end_date } = this.getPreviousMonthDates();
    
            let previousMonthTotalCost = 0;
    
            let totalCostPreviousMonthUrl: string | null = `${this.cloudabilityBaseUrl}/internal/reporting/cost/run?dimensions=year_month&dimensions=${dimensionEnv}&dimensions=${dimensionAppId}&end=${previous_month_end_date}&limit=50&metrics=unblended_cost&relativePeriods=this_year&sort=year_monthDESC&start=${previous_month_start_date}&filters=${dimensionAppId}==${appId}&viewId=${viewId}`;
    
            if (previous_month_start_date !== previous_month_end_date) {
                await this.fetchPaginatedData(totalCostPreviousMonthUrl, (responseData) => {
                    previousMonthTotalCost += parseFloat(responseData.aggregates[0].values[0]);
                });
            }
    
            return previousMonthTotalCost;
        } catch (error) {
            this.logger.error("Error fetching data for previous month in getTotalCostPreviousMonth:", error as Error);
            throw error;
        }
    }


    private async getProdCostPreviousMonth(
        dimensionEnv: string,
        dimensionAppId: string,
        envType: string,
        appId: string,
        viewId: number
    ): Promise<any> {
        try {
            const { startDate: previous_month_start_date, endDate: previous_month_end_date } = this.getPreviousMonthDates();
    
            let previousMonthTotalCost = 0;
    
            let totalProdCostPreviousMonthUrl: string | null = `${this.cloudabilityBaseUrl}/internal/reporting/cost/run?dimensions=year_month&dimensions=${dimensionEnv}&dimensions=${dimensionAppId}&end=${previous_month_end_date}&limit=50&metrics=unblended_cost&relativePeriods=this_year&sort=year_monthDESC&start=${previous_month_start_date}&filters=${dimensionAppId}==${appId}&filters=${dimensionEnv}==${envType}&viewId=${viewId}`;
    
            if (previous_month_start_date !== previous_month_end_date) {
                await this.fetchPaginatedData(totalProdCostPreviousMonthUrl, (responseData) => {
                    const rows = responseData.rows;
                    if (rows && rows.length > 0) {
                        for (const row of rows) {
                            if (row.metrics && row.metrics.length > 0) {
                                previousMonthTotalCost += parseFloat(Number(row.metrics[0].sum).toFixed(2));
                            }
                        }
                    }
                });
            }
    
            return previousMonthTotalCost;
        } catch (error) {
            this.logger.error("Error fetching data for previous month prod total cost in getProdCostPreviousMonth:", error as Error);
            throw error;
        }
    }
    private getPreviousMonthDates(): { startDate: string; endDate: string } {
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
    
        let previousMonthDate = Number(dd);
        let previousMonth = Number(mm) - 1;
        let previousYear = yyyy;
    
        if ([2, 4, 6, 9, 11].includes(previousMonth) && previousMonthDate === 31) {
            previousMonthDate -= 1;
        }
    
        const previousMonthDateFormatted = previousMonthDate < 10 ? '0' + previousMonthDate : previousMonthDate.toString();
    
        if (previousMonth < 1) {
            previousMonth = 12; // December
            previousYear -= 1; // Previous year
        }
    
        const previousMonthFormatted = previousMonth < 10 ? '0' + previousMonth : previousMonth;
    
        const endDate = `${previousYear}-${previousMonthFormatted}-${previousMonthDateFormatted}`;
        const startDate = `${previousYear}-${previousMonthFormatted}-01`;
    
        return { startDate, endDate };
    }

    private async getPreviousMonthCost(dimensionEnv: string, dimensionAppId: string, envType: string, appId: string, viewId: number): Promise<any> {
        try {
            let total_cost_previous_month = { "prod": 0, "non-prod": 0 };

            const [previous_month_total, previous_month_prod] = await Promise.all([
                this.getTotalCostPreviousMonth(dimensionEnv, dimensionAppId, appId, viewId),
                this.getProdCostPreviousMonth(dimensionEnv, dimensionAppId, envType, appId, viewId)
            ]);
            total_cost_previous_month['prod'] = previous_month_prod;

            total_cost_previous_month['non-prod'] = previous_month_total - total_cost_previous_month['prod'];
            total_cost_previous_month['non-prod'] = parseFloat(Number(total_cost_previous_month['non-prod']).toFixed(2));

            return total_cost_previous_month;

        } catch (error) {
            this.logger.error("Error fetching data for previous month in getPreviousMonthCost:", error as Error);
            throw error;
        }
    }

    async getTotalCost(dimensionEnv: string, dimensionAppId: string, envType: string, appId: string, view: string): Promise<any> {
        try {
            const viewId = await this.getViewId(view);

            const [total_cost_current_month, total_cost_previous_month] = await Promise.all([
                this.getCurrentMonthCost(dimensionEnv, dimensionAppId, envType, appId, viewId),
                this.getPreviousMonthCost(dimensionEnv, dimensionAppId, envType, appId, viewId)
            ]);
            let cost = { total_cost_current_month, costDiff: { "prod": { "value": 0, "sign": '' }, "non-prod": { "value": 0, "sign": '' } } };

            const diff_prod = total_cost_current_month['prod'] - total_cost_previous_month['prod'];
            const diff_non_prod = total_cost_current_month['non-prod'] - total_cost_previous_month['non-prod'];

            const cost_diff_prod = parseFloat((Math.abs(diff_prod)).toFixed(2));
            const cost_diff_non_prod = parseFloat(Math.abs(diff_non_prod).toFixed(2));

            // Determine sign for prod
            let sign_prod = '';
            if (diff_prod > 0) {
                sign_prod = '+';
            }
            else if (diff_prod < 0) {
                sign_prod = '-';
            }

            // Determine sign for non-prod
            let sign_non_prod = '';
            if (diff_non_prod > 0) {
                sign_non_prod = '+';
            }
            else if (diff_non_prod < 0) {
                sign_non_prod = '-';
            }

            cost = { total_cost_current_month, costDiff: { "prod": { "value": cost_diff_prod, "sign": sign_prod }, "non-prod": { "value": cost_diff_non_prod, "sign": sign_non_prod } } };
            return cost;
        } catch (error) {
            this.logger.error('Error fetching total cost:', error as Error);
            throw error;
        }
    }



    // ---------------------------------- Cost Savings Opportunity ---------------------------------
    async getTotalCostSavings(dimensionEnv: string, dimensionAppId: string, envType: string, appId: string, view: string, cloudProvider: string | null, kindType: string): Promise<any> {
        try {
            const viewId = await this.getViewId(view);

            const isEnv = kindType === 'Environment';
            const cost_savings: Record<string, number> = isEnv
                ? { [envType]: 0 }
                : { prod: 0, 'non-prod': 0 };
            const costSavingsContainers = new CostSavingsContainersService(this.cloudabiltyAuth, this.cloudabilityBaseUrl, this.logger);
            const costSavingsFromContainersPromise = costSavingsContainers.getCostSavingsFromContainers(dimensionAppId, dimensionEnv, envType, appId, viewId, kindType);

            let awsApiCalls: Promise<any>[] = [];
            let azureApiCalls: Promise<any>[] = [];

            if (cloudProvider && cloudProvider.toLowerCase() === "aws") {
                const costSavingsAWS = new CostSavingsAWSService(this.cloudabiltyAuth, this.cloudabilityBaseUrl, this.logger);

                awsApiCalls = [
                    costSavingsAWS.getCostSavingsFromAwsEc2(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAWS.getCostSavingsFromAwsEc2Asg(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAWS.getCostSavingsFromAwsEbs(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAWS.getCostSavingsFromAwsS3(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAWS.getCostSavingsFromAwsRds(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAWS.getCostSavingsFromAwsLambda(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType)
                ];
            } else if (cloudProvider && cloudProvider.toLowerCase() === "azure") {
                const costSavingsAzure = new CostSavingsAzureService(this.cloudabiltyAuth, this.cloudabilityBaseUrl, this.logger);

                azureApiCalls = [
                    costSavingsAzure.getCostSavingsFromAzureCompute(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAzure.getCostSavingsFromAzureDisk(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType),
                    costSavingsAzure.getCostSavingsFromAzureSQL(dimensionEnv, dimensionAppId, envType, appId, viewId, kindType)
                ];
            }
            const [
                costSavingsFromContainers,
                ...cloudResults
            ] = await Promise.all([costSavingsFromContainersPromise, ...awsApiCalls, ...azureApiCalls]);

            if (isEnv) {
                cost_savings[envType] += costSavingsFromContainers;
            } else {
                cost_savings.prod += costSavingsFromContainers.prod;
                cost_savings['non-prod'] += costSavingsFromContainers['non-prod'];
            }
            function addSavings(target: any, result: any, envType: string) {
                if (typeof result === 'number') {
                    target[envType] += result;
                } else if (result && typeof result === 'object') {
                    target.prod += result.prod || 0;
                    target['non-prod'] += result['non-prod'] || 0;
                }
            }


            if (awsApiCalls.length > 0) {
                const [
                    awsEC2CostSaving,
                    awsEC2AsgCostSaving,
                    awsEbsCostSaving,
                    awsS3CostSaving,
                    awsRdsCostSaving,
                    awsLambdaCostSaving
                ] = cloudResults;
                [
                    awsEC2CostSaving,
                    awsEC2AsgCostSaving,
                    awsEbsCostSaving,
                    awsS3CostSaving,
                    awsRdsCostSaving,
                    awsLambdaCostSaving
                ].forEach(result => addSavings(cost_savings, result, envType));
            } else if (azureApiCalls.length > 0) {
                const [
                    azureComputeCostSaving,
                    azureDiskCostSaving,
                    azureSqlCostSaving
                ] = cloudResults;
                [
                    azureComputeCostSaving,
                    azureDiskCostSaving,
                    azureSqlCostSaving
                ].forEach(result => addSavings(cost_savings, result, envType));
            }

            if (isEnv) {
                cost_savings[envType] = parseFloat(Math.abs(cost_savings[envType]).toFixed(2));
                return { [envType]: cost_savings[envType] };
            } else {
                cost_savings.prod = parseFloat(Math.abs(cost_savings.prod).toFixed(2));
                cost_savings['non-prod'] = parseFloat(Math.abs(cost_savings['non-prod']).toFixed(2));
                return cost_savings;
            }
        } catch (error) {
            this.logger.error("Error fetching cost savings data in getTotalCostSavings:", error as Error);
            throw error;
        }
    }



    // -------------------------------------- Adhoc Cost ----------------------------------------------
    async getAdhocCost(
        dimensionDeploymentType: string,
        dimensionAppId: string,
        appId: string,
        view: string
    ): Promise<any> {
        const viewId = await this.getViewId(view);
        const { startDate, endDate } = this.getStartAndEndDates();
        let totalCost = 0;
    
        let url: string | null = `${this.cloudabilityBaseUrl}/internal/reporting/cost/run?dimensions=year_month&dimensions=${dimensionDeploymentType}&dimensions=${dimensionAppId}&end=${endDate}&filters=${dimensionDeploymentType}==adhoc&filters=${dimensionAppId}==${appId}&limit=50&metrics=total_amortized_cost&relativePeriods=this_year&reportId=13194274&sort=year_monthDESC&start=${startDate}&viewId=${viewId}`;
    
        if (startDate !== endDate) {
            await this.fetchPaginatedData(url, (responseData) => {
                const rows = responseData.rows;
                if (rows && rows.length > 0) {
                    for (const row of rows) {
                        if (row.metrics && row.metrics.length > 0) {
                            totalCost += parseFloat(row.metrics[0].sum);
                        }
                    }
                }
            });
        }
    
        return parseFloat(Math.abs(totalCost).toFixed(2)).toString();
    }
    //----------------------------------------Budgeted Cost--------------------------------------------
    async getBudgetedCost(budgetName: string): Promise<any> {
        try {
            const res: any = await apiRequest(
                'GET',
                `${this.cloudabilityBaseUrl}/budgets`,
                this.headers,
                this.logger
            );
            if (!res.ok) {
                const errorText = await res.text();
                const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                (error as any).status = res.status;
                (error as any).response = res;
                throw error;
            }
            const responseData = await res.json();
            // Filter by budget name
            const matchedBudget = responseData.result.find((b: any) => b.name === budgetName);
            return matchedBudget || null;
        } catch (error) {
            this.logger.error('Error fetching budgeted cost:', error as Error);
            throw error;
        }
    }

    private getStartAndEndDates(): { startDate: string; endDate: string } {
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
    
        const endDate = `${yyyy}-${mm}-${dd}`;
        const startDate = `${yyyy}-${mm}-01`;
    
        return { startDate, endDate };
    }
    private async fetchPaginatedData(
        url: string | null, // The starting URL for the API request. It will be updated for each paginated page.
        accumulateFn: (data: any) => void // A function provided by the caller to process and accumulate data from the API response.
    ): Promise<void> {
        // The loop continues as long as there is a valid URL to fetch data from.
        while (url) {
            try {
                const res: any = await apiRequest('GET', url, this.headers, this.logger);
    
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    throw error;
                }
    
                // Parse the JSON response body into a JavaScript object.
                const responseData = await res.json();
    
                /**
                 * Process the data using the `accumulateFn` callback function.
                 * 
                 * The `accumulateFn` is a function provided by the caller of this method. It is called with the
                 * parsed JSON data (`responseData`) from the API response. The caller defines the logic for
                 * processing the data, such as:
                 * - Summing up specific values from the response.
                 * - Collecting rows of data into an array.
                 * - Extracting specific fields or metrics from the response.
                 * 
                 * This design makes the `fetchPaginatedData` method generic and reusable, as it delegates the
                 * responsibility of handling the response data to the caller.
                 */
                accumulateFn(responseData);
    
                /**
                 * Update the `url` variable to the `next` URL for pagination.
                 * 
                 * The `pagination.next` field in the API response indicates the URL for the next page of data.
                 * If the `pagination.next` field is `null` or does not exist, the `url` variable is set to `null`,
                 * which will terminate the `while` loop.
                 */
                url = responseData.pagination?.next || null;
            } catch (error) {
                this.logger.error("Error fetching paginated data:", error as Error);
                throw error;
            }
        }
    }

}