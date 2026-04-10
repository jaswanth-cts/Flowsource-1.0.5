
// export class JiraBot {

//     private botBaseUrl: string;

//     constructor(botBaseUrl: string) {
//         this.botBaseUrl = botBaseUrl;
//     }

//     /**
//      * Uploads a file to the server using multipart/form-data.
//      * @param fileBuffer Buffer of the file to upload
//      * @param filename Name of the file
//      * @returns Promise with the upload response
//      */
//     async uploadFile(fileBuffer: Buffer, filename: string): Promise<any> {
//         const FormData = require('form-data');
//         const fetch = require('node-fetch');

//         const form = new FormData();
//         form.append('file', fileBuffer, filename);

//         const response = await fetch(`${this.botBaseUrl}/api/uploadfile`, {
//             method: 'POST',
//             body: form,
//             headers: form.getHeaders(),
//         });

//         if (!response.ok) {
//             throw new Error(`File upload failed: ${response.statusText}`);
//         }

//         return await response.json();
//     }

// }
