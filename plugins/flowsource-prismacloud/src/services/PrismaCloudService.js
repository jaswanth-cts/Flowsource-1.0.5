import ApiService from './ApiService';
class PrismaCloudService extends ApiService {
   
  constructor(options = {}) {
    super(options);
  }
 
  getCodeReviewSummary = async (rName, bName, codeCategory) =>{

  const  resData  =  await this.apiClient.get('api/code-security/code-scan-summary', {
    params: {
      reponame: rName, 
      branchname: bName,
      codecategry:codeCategory
    }
});
  return resData;
}

getScanSummary = async (rName, bName, codeCategory) =>{
  const  resData  =  await this.apiClient.get('api/code-security/scan-summary-by-code-category', {
    params: {
      reponame: rName, 
      branchname: bName,
      codecategry:codeCategory
    }
});
  return resData;
}



 

 
getImageScanResult = async (filter) =>{
  const  resData  =  await this.apiClient.get('api/code-security/image-scan-result',{
    params:{filter:filter}
  });
  return resData;
}
}

export default PrismaCloudService;
