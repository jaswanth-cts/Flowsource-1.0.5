class ApiService {
 
  constructor(private baseUrl: string) { }

  private async handleFetch(url: string, requestOptions: any): Promise<any> {
    
    var targetUrl = `${this.baseUrl}${url}`;
    
    const response = await fetch(targetUrl, requestOptions);
    
    if (!response.ok) {
      const errorBody = await response.text(); // Get full error response
            console.error(`-----------------API Error ${response.status}:`, {
                url,
                status: response.status,
                statusText: response.statusText,
                errorBody,
                requestOptions
            });
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  public async get(url: string, requestOptions: any = {}): Promise<any> {
    return await this.handleFetch(url, { ...requestOptions, method: 'GET' });
  }


  public async post(url: string, body: any, requestOptions: any = {}): Promise<any> {
    const options = { 
        ...requestOptions,
        method: 'POST',
        body: body
    };
    return await this.handleFetch(url, options);
}
}
export default ApiService;
