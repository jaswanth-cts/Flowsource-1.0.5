class BlackduckCredentials {

  private authToken: string;
  private baseUrl: string;
  private maxRetries: number;

  constructor(authToken: string, baseUrl: string, maxRetries: number) {
      this.authToken = authToken;
      this.baseUrl = baseUrl;
      this.maxRetries = maxRetries;
  }

  // Getter for authToken
  getAuthToken(): string {
      return this.authToken;
  }

  // Getter for baseUrl
  getBaseUrl(): string {
      return this.baseUrl;
  }

  // Getter for maxRetries
  getMaxRetries(): number {
      return this.maxRetries;
 }

}

export default BlackduckCredentials;
