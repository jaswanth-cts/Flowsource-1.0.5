export class AuthService {
    private username: string;
    private password: string;
    private token: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
        this.token = this.generateToken();
    }

    private generateToken(): string {
        return Buffer.from(`${this.username}:${this.password}`).toString('base64');
    }

    public getAuthHeader(): any {
        return {
            'Authorization': `Basic ${this.token}`,
        };
    }
}
