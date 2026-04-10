class ApiService {
 
  constructor(private baseUrl: string) { }

  private async handleFetch(url: string, requestOptions: any): Promise<any> {
    
    var targetUrl = `${this.baseUrl}${url}`;
    
    const response = await fetch(targetUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  }
  
  public async get(url: string, requestOptions: any = {}): Promise<any> {
    return await this.handleFetch(url, { ...requestOptions, method: 'GET' });
  }

  public post(url: string, body: any, requestOptions: any = {}): Promise<any> {
    return this.handleFetch(url, { ...requestOptions, method: 'POST', body: JSON.stringify(body) });
  }
}
export default ApiService;
