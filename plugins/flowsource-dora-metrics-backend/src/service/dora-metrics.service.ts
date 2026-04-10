import { LoggerService } from '@backstage/backend-plugin-api';
import { DatabaseService } from "./database.service";
import { AzureDatabaseService } from './azure-database.service';
import { AwsDatabaseService } from './aws-database.service';
import { GoogleDatasetService } from './google-dataset.service';

const TABLE_DETAILS = {
    deploymentFrequency: 'ci_prod_deployment_data',
    leadTimeForChanges: 'scm_leadtime_data',
    meanTimeToRecover: 'apm_event_data',
    changeFailureRate: 'itsm_incident_data',
};

export class doraMetricsService {

    private logger: LoggerService;
    private databaseService: DatabaseService;
    private lastMonthsLimit: number;

    constructor(logger: LoggerService, dbDetails: any,cloudProvider:string, lastMonthsLimit: number) {
        this.logger = logger;
        this.lastMonthsLimit = lastMonthsLimit;
        if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='aws'){
           this.databaseService = new AwsDatabaseService(logger, dbDetails);
        }else if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='azure'){
           this.databaseService = new AzureDatabaseService(logger, dbDetails);
        }else if(cloudProvider.trim() !== '' && cloudProvider.toLowerCase()==='gcp'){
            this.databaseService = new GoogleDatasetService(logger, dbDetails);
        }else{
            throw new Error('Invalid database configuration. Please provide either aws or azure as Cloud Provider.');
        }
    }

    private calculateAverageMetricFromTrend(trendMetric: any) {
        const average = trendMetric.reduce((total: any, item: any) => total + parseFloat(item.count), 0) / trendMetric.length;
        return parseFloat(average.toFixed(2));
    }

    private epochToJsDate(ts: any){
        // ts = epoch timestamp
        // returns date obj
        return new Date(ts*1000);
    }

    private formatDate(date: any) {
        // Extract date components
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2); // Get last two digits of year
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
    
        // Convert hours from 24-hour to 12-hour format
        const formattedHours = hours % 12 || 12;
        
        // Add leading zero to minutes and seconds if needed
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
    
        // Construct the formatted date string
        return `${day}-${month}-${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    }

    async getDeploymentSuccessFrequency(appid: string) {
        this.logger.info(`Querying deployment frequency for appid - ${appid}`);
        const deploymentTrend = await this.getDeploymentSuccessTrend(appid);
        const averageDeploymentFrequency = this.calculateAverageMetricFromTrend(deploymentTrend);

        const lastUpdateTime = await this.getDeploymentSuccessFrequencyLastUpdateTime(appid);
        return {metricValue: averageDeploymentFrequency, lastUpdateTime: lastUpdateTime};
    }

    async getDeploymentSuccessFrequencyLastUpdateTime(appid: string) {
        this.logger.info(`Querying deployment frequency last update time for appid - ${appid}`);
        const lastUpdateTime = await this.getDeploymentSuccessTrendLastUpdateTime(appid);
        let formattedDate:any;
        if(lastUpdateTime.length > 0) {
            const date: any = this.epochToJsDate(lastUpdateTime[0].count);
            formattedDate = this.formatDate(date);
        }
        else {
            formattedDate = '-';
        }
        return formattedDate;
    }

    async getLeadTimeForChanges(appid: string) {
        this.logger.info(`Querying lead time for changes for appid - ${appid}`);
        const leadTimeTrend = await this.getLeadTimeForChangesTrend(appid);
        const averageLeadTime = this.calculateAverageMetricFromTrend(leadTimeTrend);

        const lastUpdateTime = await this.getLeadTimeForChangesLastUpdateTime(appid);
        return {metricValue: averageLeadTime, lastUpdateTime: lastUpdateTime};
    }

    async getLeadTimeForChangesLastUpdateTime(appid: string) {
        this.logger.info(`Querying lead time for changes last update time for appid - ${appid}`);
        const lastUpdateTime = await this.getLeadTimeForChangesTrendLastUpdateTime(appid);
        let formattedDate:any;
        if(lastUpdateTime.length > 0) {
            const date: any = this.epochToJsDate(lastUpdateTime[0].count);
            formattedDate = this.formatDate(date);
        }
        else {
            formattedDate = '-';
        }
        return formattedDate;
    }

    async getMeanTimeToRecover(appid: string) {
        this.logger.info(`Querying mean time to recover for appid - ${appid}`);
        const recoveryTimeTrend = await this.getMeanTimeToRecoverTrend(appid);
        const averageRecoveryTime = this.calculateAverageMetricFromTrend(recoveryTimeTrend);

        const lastUpdateTime = await this.getMeanTimeToRecoverLastUpdateTime(appid);
        return {metricValue: averageRecoveryTime, lastUpdateTime: lastUpdateTime};
    }

    async getMeanTimeToRecoverLastUpdateTime(appid: string) {
        this.logger.info(`Querying mean time to recover last update time for appid - ${appid}`);
        const lastUpdateTime = await this.getMeanTimeToRecoverTrendLastUpdateTime(appid);
        let formattedDate:any;
        if(lastUpdateTime.length > 0) {
            const date: any = this.epochToJsDate(lastUpdateTime[0].count);
            formattedDate = this.formatDate(date);
        }
        else {
            formattedDate = '-';
        }
        return formattedDate;
    }

    async getChangeFailureRate(appid: string) {
        this.logger.info(`Querying change failure rate for appid - ${appid}`);
        const changeFailureTrend = await this.getChangeFailureRateTrend(appid);
        const averageChangeFailureRate = this.calculateAverageMetricFromTrend(changeFailureTrend);
        
        const lastUpdateTime = await this.getChangeFailureRateLastUpdateTime(appid);
        return {metricValue: averageChangeFailureRate, lastUpdateTime: lastUpdateTime};
    }

    async getChangeFailureRateLastUpdateTime(appid: string) {
        this.logger.info(`Querying change failure rate last update time for appid - ${appid}`);
        const lastUpdateTime = await this.getIncidentCountTrendLastUpdateTime(appid);
        let formattedDate:any;
        if(lastUpdateTime.length > 0) {
            const date: any = this.epochToJsDate(lastUpdateTime[0].count);
            formattedDate = this.formatDate(date);
        }
        else {
            formattedDate = '-';
        }
        return formattedDate;
    }

    async getChangeFailureRateTrend(appid: string) {
        this.logger.info(`Querying change failure rate trend for appid - ${appid}`);

        // Get deployment trend
        const deploymentTrend = await this.getDeploymentSuccessTrend(appid);

        // Get trend of incidents count with unique deployment_id
        const incidentCountTrend = await this.getIncidentCountTrend(appid);

        // Calculate change failure rate for each month
        const result: { label: string, count: string }[] = [];
        const sumOfIncidentsByMonthObj = Object.fromEntries(incidentCountTrend.map((item: { label: any; }) => [item.label, item]));
        deploymentTrend.forEach((item: any) => {
            const incident = sumOfIncidentsByMonthObj[item.label];
            if (incident) {
                result.push({
                    label: incident.label,
                    count: (incident.count / item.count).toFixed(2)
                });
            }
        });
        return result;
    }

    async getDeploymentSuccessTrend(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.deploymentFrequency,
                                'COUNT(DISTINCT build_url) AS deployment_count',
                                'flowsource_time',
                                this.lastMonthsLimit,
                                "build_status = 'SUCCESS' AND");
    }

    async getDeploymentSuccessTrendLastUpdateTime(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.deploymentFrequency,
                                'MAX(engine_execution_time)',
                                'flowsource_time',
                                this.lastMonthsLimit,'');
    }

    async getLeadTimeForChangesTrend(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.leadTimeForChanges,
                                'ROUND(AVG(CAST(lead_time_in_days AS FLOAT)), 2)',
                                'flowsource_time',
                                this.lastMonthsLimit,'');
    }

    async getLeadTimeForChangesTrendLastUpdateTime(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.leadTimeForChanges,
                                'MAX(engine_execution_time)',
                                'flowsource_time',
                                this.lastMonthsLimit,'');
    }
    
    async getMeanTimeToRecoverTrend(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.meanTimeToRecover,
                                'ROUND(AVG(CAST(recovery_time AS DECIMAL) / 3600), 2)',
                                'flowsource_time',
                                this.lastMonthsLimit,'');
    }

    async getMeanTimeToRecoverTrendLastUpdateTime(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.meanTimeToRecover,
                                'MAX(engine_execution_time)',
                                'flowsource_time',
                                this.lastMonthsLimit,'');
    }

    private async getIncidentCountTrend(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.changeFailureRate,
                                'COUNT(DISTINCT deployment_id) AS incident_count',
                                'flowsource_time',
                                this.lastMonthsLimit,
                                "incident_state = 'New' AND");
    }

    private async getIncidentCountTrendLastUpdateTime(appid: string) {
        return this.databaseService.getTrendData(appid,
                                TABLE_DETAILS.changeFailureRate,
                                'MAX(engine_execution_time)',
                                'flowsource_time',
                                this.lastMonthsLimit,'');
    }

}
