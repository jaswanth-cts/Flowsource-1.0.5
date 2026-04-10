import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';
export class CostSavingsAzureService {
    cloudabiltyAuth: string = '';
    cloudabilityBaseUrl: string = '';
    headers: any;
    logger: LoggerService;

    constructor(cloudabiltyAuth:string, cloudabilityBaseUrl:string, logger: LoggerService) {
        this.cloudabilityBaseUrl = cloudabilityBaseUrl;
        this.headers = {
            'Authorization': cloudabiltyAuth,
        };
        this.logger = logger;

    }

    // -------------------------------- Cost Savings Opportunity for Azure Compute --------------------------------
    async getCostSavingsFromAzureCompute(
        dimensionEnv: string,
        dimensionAppId: string,
        envType: string,
        appId: string,
        viewId: any,
        kindType?: string
    ): Promise<any> {
        try {
            let offsetProd = 0;
            let allSavingsDataProd: any[] = [];
            let totalSavings = 0;
    
            // Only fetch total savings for Component case
            if (kindType !== 'Environment') {
                let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/azure/recommendations/compute?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=compute&sort=-recommendations.savings&viewId=${viewId}`;
                const res: any = await apiRequest('GET', costSavingsUrl, this.headers, this.logger);
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    (error as any).status = res.status;
                    (error as any).response = res;
                    throw error;
                }
                const responseData = await res.json();
                const totalSavingsData = responseData.meta;
                totalSavings = totalSavingsData.aggregates[0].rightsizeSavings;
            }
    
            // Fetch savings data for prod (or any environment)
            while (true) {
                let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/azure/recommendations/compute?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=compute&sort=-recommendations.savings&viewId=${viewId}`;
                const res: any = await apiRequest('GET', costSavingsProdUrl, this.headers, this.logger);
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    (error as any).status = res.status;
                    (error as any).response = res;
                    throw error;
                }
                const responseData = await res.json();
                const savingsData = responseData.result;
                allSavingsDataProd.push(...savingsData);
    
                if (offsetProd + 25 >= responseData.meta.totalCount) {
                    break;
                } else {
                    offsetProd += 25;
                }
            }
    
            if (kindType === 'Environment') {
                let cost_savings = 0;
                allSavingsDataProd.forEach((data: any) => {
                    const recommendations = data.recommendations;
                    recommendations.forEach((recommendation: any) => {
                        cost_savings += recommendation.savings;
                    });
                });
                return cost_savings;
            } else {
                let cost_savings = { "prod": 0, "non-prod": 0 };
                allSavingsDataProd.forEach((data: any) => {
                    const recommendations = data.recommendations;
                    recommendations.forEach((recommendation: any) => {
                        cost_savings.prod += recommendation.savings;
                    });
                });
                cost_savings['non-prod'] = parseFloat(Math.abs(totalSavings - cost_savings['prod']).toFixed(2));
                return cost_savings;
            }
        } catch (error) {
            throw error;
        }
    }
    // -------------------------------- Cost Savings Opportunity for Azure Disk --------------------------------
    async getCostSavingsFromAzureDisk(
        dimensionEnv: string,
        dimensionAppId: string,
        envType: string,
        appId: string,
        viewId: string,
        kindType?: string
    ): Promise<any> {
        try {
            let offsetProd = 0;
            let allSavingsDataProd: any[] = [];
            let totalSavings = 0;
    
            // Only fetch total savings for Component case
            if (kindType !== 'Environment') {
                let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/azure/recommendations/disk?basis=on-demand&duration=thirty-day&filter=recommendations.rank%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=disk&sort=-recommendations.savings&viewId=${viewId}`;
                const res: any = await apiRequest('GET', costSavingsUrl, this.headers, this.logger);
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    (error as any).status = res.status;
                    (error as any).response = res;
                    throw error;
                }
                const responseData = await res.json();
                const totalSavingsData = responseData.meta;
                totalSavings = totalSavingsData.aggregates[0].rightsizeSavings;
            }
    
            // Fetch savings data for prod (or any environment)
            while (true) {
                let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/azure/recommendations/disk?basis=on-demand&duration=thirty-day&filter=recommendations.rank%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=disk&sort=-recommendations.savings&viewId=${viewId}`;
                const res: any = await apiRequest('GET', costSavingsProdUrl, this.headers, this.logger);
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    (error as any).status = res.status;
                    (error as any).response = res;
                    throw error;
                }
                const responseData = await res.json();
                const savingsData = responseData.result;
                allSavingsDataProd.push(...savingsData);
    
                if (offsetProd + 25 >= responseData.meta.totalCount) {
                    break;
                } else {
                    offsetProd += 25;
                }
            }
    
            if (kindType === 'Environment') {
                let cost_savings = 0;
                allSavingsDataProd.forEach((data: any) => {
                    const recommendations = data.recommendations;
                    recommendations.forEach((recommendation: any) => {
                        cost_savings += recommendation.savings;
                    });
                });
                return cost_savings;
            } else {
                let cost_savings = { "prod": 0, "non-prod": 0 };
                allSavingsDataProd.forEach((data: any) => {
                    const recommendations = data.recommendations;
                    recommendations.forEach((recommendation: any) => {
                        cost_savings.prod += recommendation.savings;
                    });
                });
                cost_savings['non-prod'] = parseFloat(Math.abs(totalSavings - cost_savings['prod']).toFixed(2));
                return cost_savings;
            }
        } catch (error) {
            throw error;
        }
    }
     // -------------------------------- Cost Savings Opportunity for Azure SQL --------------------------------
    async getCostSavingsFromAzureSQL(
        dimensionEnv: string,
        dimensionAppId: string,
        envType: string,
        appId: string,
        viewId: string,
        kindType?: string
    ): Promise<any> {
        try {
            let offsetProd = 0;
            let allSavingsDataProd: any[] = [];
            let totalSavings = 0;
    
            // Only fetch total savings for Component case
            if (kindType !== 'Environment') {
                let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/azure/recommendations/sql?basis=on-demand&duration=thirty-day&filter=recommendations.preferenceOrder%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=sql&sort=-recommendations.savings&viewId=${viewId}`;
                const res: any = await apiRequest('GET', costSavingsUrl, this.headers, this.logger);
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    (error as any).status = res.status;
                    (error as any).response = res;
                    throw error;
                }
                const responseData = await res.json();
                const totalSavingsData = responseData.meta;
                totalSavings = totalSavingsData.aggregates[0].rightsizeSavings;
            }
    
            // Fetch savings data for prod (or any environment)
            while (true) {
                let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/azure/recommendations/sql?basis=on-demand&duration=thirty-day&filter=recommendations.preferenceOrder%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=sql&sort=-recommendations.savings&viewId=${viewId}`;
                const res: any = await apiRequest('GET', costSavingsProdUrl, this.headers, this.logger);
                if (!res.ok) {
                    const errorText = await res.text();
                    const error = new Error(`HTTP error! status: ${res.status}, Response body: ${errorText}`);
                    (error as any).status = res.status;
                    (error as any).response = res;
                    throw error;
                }
                const responseData = await res.json();
                const savingsData = responseData.result;
                allSavingsDataProd.push(...savingsData);
    
                if (offsetProd + 25 >= responseData.meta.totalCount) {
                    break;
                } else {
                    offsetProd += 25;
                }
            }
    
            if (kindType === 'Environment') {
                let cost_savings = 0;
                allSavingsDataProd.forEach((data: any) => {
                    const recommendations = data.recommendations;
                    recommendations.forEach((recommendation: any) => {
                        cost_savings += recommendation.savings;
                    });
                });
                return cost_savings;
            } else {
                let cost_savings = { "prod": 0, "non-prod": 0 };
                allSavingsDataProd.forEach((data: any) => {
                    const recommendations = data.recommendations;
                    recommendations.forEach((recommendation: any) => {
                        cost_savings.prod += recommendation.savings;
                    });
                });
                cost_savings['non-prod'] = parseFloat(Math.abs(totalSavings - cost_savings['prod']).toFixed(2));
                return cost_savings;
            }
        } catch (error) {
            throw error;
        }
    }
}
