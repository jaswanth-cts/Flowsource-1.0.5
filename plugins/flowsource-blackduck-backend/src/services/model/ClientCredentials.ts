interface ClientCredentials {

    bearerToken: string;
    expiresInMilliseconds: number; // Expiry time in milliseconds

}

export default ClientCredentials;