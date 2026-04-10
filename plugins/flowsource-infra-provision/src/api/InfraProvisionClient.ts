export class InfraProvisionClient {
  baseUrl:string;
  // authToken:string;
  headers:any;
  constructor(baseUrl:string){
    this.baseUrl = baseUrl;
    // this.authToken = authToken;
    // if(this.authToken != null && this.authToken != undefined && this.authToken.trim().length> 0 ){
    //   this.headers={
    //     'Content-Type': 'application/json', 
    //     'Accept': 'application/json', 
    //     'Authorization':`Bearer ${this.authToken}`
    //   }
    // } else{
    //   this.headers={
    //     'Content-Type': 'application/json', 
    //     'Accept': 'application/json' 
    //   }
    // }
  
}

  async get( targetUrl:any, params:any) {
      return await fetch(`${targetUrl}?${params}`, {
        headers: this.headers
    });
  }
  
  async getHostUrl() {
    const targetUrl = this.baseUrl+'/api/flowsource-morpheus/host-url'
    return this.get(targetUrl, {})
  }

  async canSubmitOrder() {
    const targetUrl = this.baseUrl+'/api/flowsource-morpheus/can-submit-order'
    return this.get(targetUrl, {})
  }


  async getCatalogItems() {
    const targetUrl = this.baseUrl+'/api/flowsource-morpheus/catalogs';
    return this.get(targetUrl,  { catalogId:false})
  }
  
  async getInstances() {
    const targetUrl = this.baseUrl+'/api/flowsource-morpheus/my-orders'
    return this.get(targetUrl, {})
  }
  
  
  async getInputOptionFor(catId: any) {
      const targetUrl = this.baseUrl+'/api/flowsource-morpheus/input-options'
      return this.get(targetUrl, { catalogId:catId})
  }
  
  async orderItem(userCatalogConfig:any) {
  const targetUrl = this.baseUrl+'/api/flowsource-morpheus/order-item'
  let config = {
    method: 'post',
    headers: this.headers,
    body : JSON.stringify(userCatalogConfig)
  };
  try{
    const response =   await fetch(targetUrl, config);
    if (response.status >= 400) { 
      throw response; 
    }

  }
  catch(err){
    throw err
  }
}
}