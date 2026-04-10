
class HttpService {
  constructor(options = {}) {
     
    this.client.interceptors.request.use(function (config) {
      config.headers.Authorization =  options.authToken ? `Bearer ${options.authToken}` : '';
      return config;
    });
 
    this.client.interceptors.response.use(
      this.handleSuccessResponse,
      this.handleErrorResponse
    );
    this.unauthorizedCallback = () => {};
  }

  attachHeaders(headers) {
    Object.assign(this.client.defaults.headers, headers);
  }

  removeHeaders(headerKeys) {
    headerKeys.forEach(key => delete this.client.defaults.headers[key]);
  }

  handleSuccessResponse(response) {
    return response;
  }

  handleErrorResponse = error => {
    try {
      const { status } = error.response;

      switch (status) {
        case 400:
          break;
        case 401:
          this.unauthorizedCallback();
          break;
        default:
          break;
      }

      return Promise.reject(error);
    } catch (e) {
      return Promise.reject(error);
    }
  };

  setUnauthorizedCallback(callback) {
    this.unauthorizedCallback = callback;
  }
}


export default HttpService;