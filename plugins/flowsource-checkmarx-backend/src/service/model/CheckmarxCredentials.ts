class CheckmarxCredentials {

    private clientId: string;
    private clientSecret: string;
    private username: string;
    private password: string;
    private grantType: string;
    private baseUrl: string;
    private baseAuthUrl: string;

    constructor(clientId: string, clientSecret: string, username: string, password: string, 
        grantType: string, baseUrl: string, baseAuthUrl: string) {

        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.username = username;
        this.password = password;
        this.grantType = grantType;
        //this.authToken = authToken;
        this.baseUrl = baseUrl;
        this.baseAuthUrl = baseAuthUrl;
    }

    // Getter and Setter for clientId
  getClientId(): string {
    return this.clientId;
  }

  getClientSecret(): string {
    return this.clientSecret;
  }

  getUsername(): string {
    return this.username;
  }

  getPassword(): string {
    return this.password;
  }

  getGrantType(): string {
    return this.grantType;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getBaseAuthUrl(): string {
    return this.baseAuthUrl;
  }
}

export default CheckmarxCredentials;