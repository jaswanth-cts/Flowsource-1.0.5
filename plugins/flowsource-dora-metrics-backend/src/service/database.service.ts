
export interface DatabaseService {
     getTrendData(appid: string, tableName: string, selectFields: string, timestampConversion: string, lastMonthsLimit: number, additionalConditions: string) :any ;
}
