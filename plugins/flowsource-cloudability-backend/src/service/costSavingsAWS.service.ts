import { apiRequest } from './apiRequest';
import { LoggerService } from '@backstage/backend-plugin-api';

export class CostSavingsAWSService {
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

    // -------------------------------- Cost Savings Opportunity for AWS EC2 --------------------------------
    async getCostSavingsFromAwsEc2(
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
            let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/ec2?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=ec2&sort=-recommendations.savings&viewId=${viewId}`;
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
            let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/ec2?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=ec2&sort=-recommendations.savings&viewId=${viewId}`;
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
    // -------------------------------- Cost Savings Opportunity for AWS EC2 ASG --------------------------------
    async getCostSavingsFromAwsEc2Asg(
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
            let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/ec2-asg?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=ec2-asg&sort=-recommendations.savings&viewId=${viewId}`;
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
            let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/ec2-asg?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=ec2-asg&sort=-recommendations.savings&viewId=${viewId}`;
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

     // -------------------------------- Cost Savings Opportunity for AWS EBS --------------------------------
    async getCostSavingsFromAwsEbs(
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
            let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/ebs?basis=on-demand&duration=thirty-day&filter=recommendations.rank%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=ebs&sort=-recommendations.savings&viewId=${viewId}`;
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
            let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/ebs?basis=on-demand&duration=thirty-day&filter=recommendations.rank%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=ebs&sort=-recommendations.savings&viewId=${viewId}`;
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
     // -------------------------------- Cost Savings Opportunity for AWS S3 --------------------------------
    async getCostSavingsFromAwsS3(
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
            let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/s3?basis=on-demand&duration=thirty-day&filter=recommendations.rank%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=s3&sort=-recommendations.savings&viewId=${viewId}`;
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
            let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/s3?basis=on-demand&duration=thirty-day&filter=recommendations.rank%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=s3&sort=-recommendations.savings&viewId=${viewId}`;
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
    // -------------------------------- Cost Savings Opportunity for AWS RDS --------------------------------
    async getCostSavingsFromAwsRds(
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
            let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/rds?basis=on-demand&duration=thirty-day&filter=recommendations.preferenceOrder%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=rds&sort=-recommendations.savings&viewId=${viewId}`;
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
            let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/rds?basis=on-demand&duration=thirty-day&filter=recommendations.preferenceOrder%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=rds&sort=-recommendations.savings&viewId=${viewId}`;
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
    // -------------------------------- Cost Savings Opportunity for AWS Lambda --------------------------------
    async getCostSavingsFromAwsLambda(
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
                let costSavingsUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/lambda?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&limit=0&maxRecsPerResource=1&offset=0&product=lambda&sort=-recommendations.savings&viewId=${viewId}`;
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
                let costSavingsProdUrl: string = `${this.cloudabilityBaseUrl}/rightsizing/aws/recommendations/lambda?basis=on-demand&duration=thirty-day&filter=recommendations.defaultsOrder%3D%3D1&filter=${dimensionAppId}==${appId}&filter=${dimensionEnv}%3D%3D${envType}&limit=25&maxRecsPerResource=1&offset=${offsetProd}&product=lambda&sort=-recommendations.savings&viewId=${viewId}`;
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