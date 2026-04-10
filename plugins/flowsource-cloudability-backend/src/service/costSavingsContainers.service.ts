import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class CostSavingsContainersService {
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

    // -------------------------------- Get cluster name and namespace for given appid --------------------------------
    async getClusterNameAndNamespace(dimensionAppId: string, dimensionEnv: string, envType: string, appId: string, viewId: any): Promise<any> {
        try {
            const date = new Date();
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();

            const end_date = yyyy + '-' + mm + '-' + dd;
            const start_date = yyyy + '-' + mm + '-' + '01';

            const prodClusterInfoArray: { clusterName: any; namespace: any; }[] = [];
            const nonProdClusterInfoArray: { clusterName: any; namespace: any; }[] = [];

            let clusterDataUrl: string | null = `${this.cloudabilityBaseUrl}/internal/reporting/cost/run?dimensions=year_month&dimensions=container_cluster_name&dimensions=container_namespace&dimensions=${dimensionAppId}&dimensions=${dimensionEnv}&end=${end_date}&filters=container_cluster_name!%3D(not%20set)&filters=${dimensionAppId}%3D%3D${appId}&limit=50&metrics=total_amortized_cost&relativePeriods=this_month&sort=${dimensionEnv}DESC&start=${start_date}&viewId=${viewId}`;

            while(clusterDataUrl) {
                try {
                    const res: any = await apiRequest(
                        'GET',
                        clusterDataUrl,
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
                    if (responseData.pagination) {
                        clusterDataUrl = responseData.pagination.next;
                    } else {
                        clusterDataUrl = null; // Stop the loop if there's no more pagination
                    }
    
                    const clusterData = responseData.rows;
    
                    // Iterate over the clusterData from the API response
                    clusterData.forEach((row: { dimensions: any; }) => {
                        const dimensions = row.dimensions;
                        if (dimensions.length >= 5) {
                            const clusterInfo = {
                                clusterName: dimensions[1],
                                namespace: dimensions[2]
                            };
                            if (dimensions[4] === envType) {
                                prodClusterInfoArray.push(clusterInfo);
                            } else {
                                nonProdClusterInfoArray.push(clusterInfo);
                            }
                        }
                    });
                    
                } catch (error) {
                    throw error;
                }
            }
            
            return { prod: prodClusterInfoArray, nonProd: nonProdClusterInfoArray };
        } catch (error) {
            throw error;
        }
    }


    // -------------------------------- Cost Savings Opportunity for Containers --------------------------------
    
    async getCostSavingsFromContainers(
        dimensionAppId: string,
        dimensionEnv: string,
        envType: string,
        appId: string,
        viewId: any,
        kindType?: string
      ): Promise<any> {
        try {
          const clusterData = await this.getClusterNameAndNamespace(
            dimensionAppId,
            dimensionEnv,
            envType,
            appId,
            viewId
          );
      
          let offset = 0;
          let allSavingsData: any[] = [];
      
          while (true) {
            let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/containers/recommendations/workloads?basis=on-demand&duration=thirty-day&filter=recommendations.rank==1&limit=25&maxRecsPerResource=1&offset=${offset}&viewId=${viewId}`;
            const res: any = await apiRequest(
              'GET',
              costSavingsProdUrl,
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
            const savingsData = responseData.result;
            allSavingsData.push(...savingsData);
      
            if (offset + 25 >= responseData.meta.totalCount) {
              break;
            } else {
              offset += 25;
            }
          }
          if (kindType === 'Environment') {
            const envKey = Object.keys(clusterData)[0];
            let cost_savings = 0;
            allSavingsData.forEach((data: any) => {
              const clusterName = data.clusterName;
              const namespace = data.namespace;
              const isInEnv = clusterData[envKey].some(
                (cluster: any) =>
                  cluster.clusterName === clusterName && cluster.namespace === namespace
              );
              if (isInEnv) {
                data.recommendations.forEach((recommendation: any) => {
                  cost_savings += recommendation.savings;
                });
              }
            });
            return cost_savings;
          } else {
            let cost_savings = { "prod": 0, "non-prod": 0 };
            allSavingsData.forEach((data: any) => {
              const clusterName = data.clusterName;
              const namespace = data.namespace;
      
              if (clusterData.prod?.some((cluster: any) =>
                cluster.clusterName === clusterName && cluster.namespace === namespace
              )) {
                data.recommendations.forEach((recommendation: any) => {
                  cost_savings['prod'] += recommendation.savings;
                });
              }
      
              if (clusterData['non-prod']?.some((cluster: any) =>
                cluster.clusterName === clusterName && cluster.namespace === namespace
              )) {
                data.recommendations.forEach((recommendation: any) => {
                  cost_savings['non-prod'] += recommendation.savings;
                });
              }
            });
            return cost_savings;
          }
        } catch (error) {
          throw error;
        }
      }
    
}