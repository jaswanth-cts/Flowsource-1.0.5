import HttpService from './HttpService';

class ApiService {
  constructor(options = {}) {
    this.api = new HttpService(options);
    this.apiClient = this.api.client;
  }
  setAuthToken( token ){
    let header = {
      Authorization :  token
    };
    this.api.attachHeaders(header);
  } 
}
export default ApiService;
