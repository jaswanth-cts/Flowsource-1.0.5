import ApiService from "./ApiService";

export default class PrismaCloudService extends ApiService {
  
  private authToken: string;
  
  constructor(baseUrl: string, token: string, private maxRowFetch: number) {
    super(baseUrl);
    this.authToken = token;
  }

  getRepositoryDetail = async (repoName: any, branchName: any) => {
    try 
    {
      const repos = await this.getRepositories(repoName);

      let filteredRepos = repos.data?.filter((repo: any) => {
        return repo.repository === repoName && repo.defaultBranch === branchName;
      });
      
      if (filteredRepos != null && filteredRepos != undefined && filteredRepos.length > 0) {
        return filteredRepos[0]
      } else {
        return null;
      }

    } catch (err) {
      return null
    }
  }

  getRepositories = async (repoName: any) => {
    try 
    {
      var options = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        }
      }
      
      var resData = await this.get('code/api/v1/repositories/search?repoName=' + repoName, options);
      
      return resData;

    } catch (err) {
      throw err;
    }
  }

  getCodeReviewRuns = async (repoName: any) => {
    try 
    {
      var options = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        }
      }

      const resData = await this.get('code/api/v1/development-pipeline/code-review/runs/data?sortBy=scanTime&search=' + repoName, options);
      return resData;

    } catch (err) {
      throw err;
    }
  }

  getCodeReviewScan = async (filterData: any) => {

    let next = true;
    const limit = 10;
    let offset = 0;
    let responseData: any = [];
    let count = 0
    var options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authToken
      }
    }

    while (next === true && this.maxRowFetch > count) {
      offset = offset + limit;
      count += limit;
      filterData.filters.offset = offset;

      const resData = await this.post('code/api/v2/errors/code_review_scan/resources', filterData, options);
      responseData = [...responseData, ...resData.data];

      next = resData.hasNext;
    }

    return responseData;
  }


  // extract all policies realted to the failed resources.
  getResourcePolicyScan = async (resources: any, repoId: any, scanRunId: any) => {
    
    let processedData: any = [];
    const limit = 10;

    if (Array.isArray(resources) && resources.length > 0) 
    {
      //let  alloProccessCound = resources.length>5?5:resources.length;
      let alloProccessCound = resources.length;
      for (var i = 0; i < alloProccessCound; i++) 
      {
        var policyfilter = {
          filters: {
            repositories: repoId,
            runId: scanRunId,
            checkStatus: "Error",
            codeCategories: [resources[i].codeCategory]
          }
          , offset: 0
          , limit: 10
          , codeCategory: resources[i].codeCategory
          , resourceUuid: resources[i].resourceUuid
        };

        let next = true;
        let offset = 0;
        let count = 0

        //iterate all failed resouces policieis and store it in array to download
        //each iteration required offset & limit to fetch
        //maxRowFetch litmit the fetch iteration if number failed resource policies mores.
        //maxRowFetch configired in app-config.yaml
        var options = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.authToken
          }
        }

        while (next === true && this.maxRowFetch > count) {
          count += limit;
          policyfilter.offset = offset;
          policyfilter.limit = count;
          try {
            let response = await this.post('code/api/v2/errors/code_review_scan/resources/policies', policyfilter, options)
            if (Array.isArray(response.data) && response.data.length) {
              response.data.forEach((el: any) => {
                if (el['resourceCode'] !== undefined && el.resourceCode != null && el.resourceCode !== undefined) {
                  el.resourceCode = el.resourceCode?.replaceAll("\n", " ");
                }

              })
              processedData = [...processedData, ...response.data];
            }
            next = response.hasNext;
            offset = offset + limit;
          }
          catch (err) {
            offset = offset + limit;
          }

        } //while loop ends


      }//forloop ends

    }

    return processedData;
  }

  getCodeReviewSummary = async (repoName: any, branchName: any, codecat: any) => {

    let response: any = {}
    //getCodeReviewRuns fetches all available runs.
    // needs to be fixed by using right api to fetch run details
    //till the time find hte alternate solution fetch all available runs and filtered the required run in code usig custom solution
    const runs = await this.getCodeReviewRuns(repoName);
    response.runsData = runs?.data;

    if (runs?.data != null && runs?.data.length > 0) {
      response.reposData = runs?.data;
      let filteredRuns = runs?.data.filter((run: any) => {
        return run.repository === repoName && run.repo_id === runs?.data[0].id;
      });

      if (filteredRuns != null && filteredRuns.length > 0) {

        let codeCategorys = [];

        if (codecat instanceof Array) {
          codeCategorys = codecat;
        }
        else if (codecat instanceof String) {
          codeCategorys = [codecat];
        }


        // extract all failed resources in the current scan.
        const codeReviewScan = await this.getCodeReviewScan({
          filters: {
            repositories: filteredRuns[0].repo_id,
            runId: filteredRuns[0].id,
            codeCategories: codeCategorys,
            violationStatuses: ["OPEN"]
          },
          offset: 0,
          limit: 10
        });
        
        response.CodeReviewScan = await this.getResourcePolicyScan(codeReviewScan, filteredRuns[0].repo_id, filteredRuns[0].id)
      }
      else {
        let exceptionMessage = `No  date data forund for te given repository : ${repoName} or branch name: ${branchName}`
        throw new Error(exceptionMessage);
      }
    }
    else {
      const checkRepoExist = await this.getRepositoryDetail(repoName, branchName);
          let exceptionMessage = `No data forund for the given repository : ${repoName} or branch name: ${branchName}`
          if(checkRepoExist === null){
              exceptionMessage = `No repository found with the repo name ${repoName} and branch name ${branchName}. Please check the repository and branch and try again.`
          }
          const RepositoryNotFoundError = new Error(exceptionMessage);
          (RepositoryNotFoundError as any).status = 404; // Set status to 404 for "Not Found"
          throw RepositoryNotFoundError;
    }

    return response;
  }


  getScanSummary = async (repoName: any, branchName: any, codecat: any) => {

    try {
      let response: any = {}
      const runs = await this.getCodeReviewRuns(repoName);

        if (runs?.data != null && runs?.data != undefined && runs?.data.length > 0) {
          response.runsData = runs?.data[0];
          if (response.runsData.scanStatus == "PASS") {
            response.runsData.results = {
              PASS: 1,
            }
          }
        }

        let codeCategorys = [];

        if (codecat instanceof Array) {
          codeCategorys = codecat;
        }
        else if (codecat instanceof String) {
          codeCategorys = [codecat];
        }

        if (runs?.data != null && runs?.data.length > 0) {
          let dataFilter = {
            filters: {
              repositories: runs?.data[0].repo_id,
              runId: runs?.data[0].id,
              codeCategories: codeCategorys,
              violationStatuses: ["OPEN"]
            }
          }
          var options = {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': this.authToken
            }
          }

          const resData = await this.post('code/api/v2/summaries/codeReview', dataFilter, options);
          response.summaryData = resData;

        }
        else {
          const checkRepoExist = await this.getRepositoryDetail(repoName, branchName);
          let exceptionMessage = `No data forund for the given repository : ${repoName} or branch name: ${branchName}`
          if(checkRepoExist === null){
              exceptionMessage = `No repository found with the repo name ${repoName} and branch name ${branchName}. Please check the repository and branch and try again.`
          }
          const RepositoryNotFoundError = new Error(exceptionMessage);
          (RepositoryNotFoundError as any).status = 404; // Set status to 404 for "Not Found"
          throw RepositoryNotFoundError;
        }
      return response;

    } catch (err) {
      throw err;
    }
  }
}

