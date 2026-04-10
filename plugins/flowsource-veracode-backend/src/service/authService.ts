import { createHmac, randomBytes } from 'crypto';
import url from 'url';

export default class AuthService {

    async generateAuthHeader(apiId: any, apiKey: any, apiUrl: string, method: any): Promise<string> {

        const preFix = "VERACODE-HMAC-SHA-256";
        const verStr = "vcode_request_version_1";

        var resthost = url.parse(apiUrl).host;
        var path = url.parse(apiUrl).path;

        var hmac256 = (data: any, key: any, format?: any) => {
            var hash = createHmac('sha256', key).update(data);
            // no format = Buffer / byte array
            return hash.digest(format);
        }

        var getByteArray = (hex: any) => {
            var bytes = [];

            for (var i = 0; i < hex.length - 1; i += 2) {
                bytes.push(parseInt(hex.substr(i, 2), 16));
            }

            // signed 8-bit integer array (byte array)
            return Int8Array.from(bytes);
        }

        var data = `id=${apiId}&host=${resthost}&url=${path}&method=${method}`;
        var timestamp = (new Date().getTime()).toString();
        var nonce = randomBytes(16).toString("hex");

        // calculate signature
        var hashedNonce = hmac256(getByteArray(nonce), getByteArray(apiKey));
        var hashedTimestamp = hmac256(timestamp, hashedNonce);
        var hashedVerStr = hmac256(verStr, hashedTimestamp);
        var signature = hmac256(data, hashedVerStr, 'hex');
        return `${preFix} id=${apiId},ts=${timestamp},nonce=${nonce},sig=${signature}`;

    }
}