import ApiService from './ApiService';

export default class ContainerImageScanService extends ApiService {
    
    private authToken: string;
    
    constructor(baseUrl: string, token: string) {
        super(baseUrl);
        this.authToken = token;
    }
    
    getScanResult = async (filters: any) => {
        try 
        {
            const targeturl = 'api/v32.04/scans?type=ciImage&limit=1&reverse=true&search=' + filters;
            
            var options = { headers: { 'Accept': 'application/json', 'x-redlock-auth': this.authToken } }
            
            return await this.get(targeturl, options);
        } catch (err) {
            throw err;
        }
    }

    getHostScanResult = async (hostNames: any) => {
        try 
        {
            const validationUrl = `/api/v1/hosts?compact=true&limit=1&hostname=${hostNames}`;
            const validationOptions = { headers: { 'Accept': 'application/json', 'x-redlock-auth': this.authToken } };
    
            const validationResponse = await this.get(validationUrl, validationOptions);
            // Check if the host exists
            if (!validationResponse || validationResponse.length === 0) {
                const error = new Error(`Host '${hostNames}' does not exist.`);
                (error as any).status = 404;
                throw error;
            }
            const targeturl = '/api/v1/hosts?compact=true&limit=17&offset=0&project=Central+Console&reverse=true&sort=vulnerabilityRiskScore&hostname=' + hostNames;
           
            var options = { headers: { 'Accept': 'application/json', 'x-redlock-auth': this.authToken } }
           
            return await this.get(targeturl, options);
        } catch (err) {
            throw err;
        }
    }

    getContainerScanResult = async (filterOption: any) => {
        try 
        {
          
            let filter="";
            Object.keys(filterOption).forEach(function(key) {
                var value = filterOption[key];

               if(filter.length > 0){
                filter+='&' + key + '=' + value
               }
               else{
                filter=key+'='+value
               }
            });

            const targeturl = 'api/v32.07/containers?' + filter;
            var options = { headers: { 'Accept': 'application/json', 'x-redlock-auth': this.authToken } }
            const resData =  await this.get(targeturl, options);
            let grouped:{[key: string]: any} ={};
            for (var i=0,len=resData.length,p;i<len;i++) { // fas
                p = resData[i];
                let oKey = p.info.name  + "$" + p.info.namespace
               if (grouped[oKey] === undefined) 
               {
                    grouped[oKey] = [];
               }
               grouped[oKey].push(p);
            }
            return grouped;
            
        } catch (err) {
            throw err;
        }
    }
}