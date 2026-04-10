import { DefaultAzureCredential } from '@azure/identity';
import xss from 'xss';

let token: any = null;
async function getRefreshedToken(credential: any) {
  if (!token || Date.now() > (token.expiresOnTimestamp - 2 * 60 * 1000)) {
    // Refresh if not cached or expiring within 2 minutes
    token = await credential.getToken("https://management.azure.com/.default");
  }
  return token.token;
}

export async function signAzureRequest(req: any, config: any, logger: any) {

  const targetUrl = config.targetUrl;
  const clientID = config.clientID;
  const apiKey = config.apiKey; 
  const credential = new DefaultAzureCredential({
    managedIdentityClientId: clientID
  });

  const token = await getRefreshedToken(credential);
  const jsonPayload = req.body;
  const formData = new FormData();

  // Append scalar fields safely
  for (const key in jsonPayload) {
    if (!jsonPayload.hasOwnProperty(key)) continue;
    if (key === 'images') continue; // handled below
    const val = jsonPayload[key];
    if (val === undefined || val === null) continue;
    formData.append(key, xss(typeof val === 'string' ? val : String(val)));
  }

  // Append images as files: expects [{ format: string; content: number[] }]
  if (Array.isArray(jsonPayload?.images)) {
    try {
      jsonPayload.images.forEach((img: { format: string; content: number[] }, idx: number) => {
        if (!img || !img.content || !img.format) return;
        const bytes = Uint8Array.from(img.content);
        const blob = new Blob([bytes], { type: img.format });
        const ext = img.format.split('/')[1] || 'bin';
        const filename = `image_${idx + 1}.${ext}`;
        formData.append('files', blob, filename);
      });
    } catch (e: any) {
      logger?.warn?.(`Failed to append images to form-data: ${e?.message || e}`);
    }
  }
  try {
    const azureResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'x-api-key': apiKey,
      },
      body: formData,
    });


    const contentType = azureResponse.headers.get('content-type');

    let botResponse: string | null = null;
    let knowledgeBase: Array<{ name: string; content: string }> = [];

    if (contentType && contentType.includes('text/event-stream')) {

      const responseText = await azureResponse.text(); // from fetch

      // Extract JSON array portion
      const start = responseText.indexOf("[");
      const end = responseText.lastIndexOf("]");
      if (start === -1 || end === -1 || end <= start) {
        // If no array found, treat all as outside content
        botResponse = responseText;
      } else {
        let jsonPart = responseText.substring(start, end + 1);

        // Capture outside (non-array) content for UI body
        const before = responseText.substring(0, start).trim();
        const after = responseText.substring(end + 1).trim();
        botResponse = [before, after].filter(Boolean).join("\n\n");

        // Clean control characters in JSON part for safe parsing
        jsonPart = jsonPart
          .replace(/[\u0000-\u001F]+/g, " ")
          .replace(/\t/g, " ")
          .replace(/\n/g, " \n ")
          .replace(/\r/g, " ");

        try {
          const parsed = JSON.parse(jsonPart);
          parsed.forEach((entry: Record<string, string>) => {
            Object.entries(entry).forEach(([name, content]) => {
              knowledgeBase.push({ name, content });
            });
          });
        } catch (err) {
          logger.error("Failed to parse JSON array from event-stream:", err);
          logger.error("Raw JSON part:", jsonPart);
          // Fallback: surface the entire response as outside content
          botResponse = responseText;
        }
      }
    }

    else if (contentType && contentType.includes('application/json')) {
      try {
        const json = await azureResponse.json();
        // If an array of attachments is returned as JSON, separate it
        if (Array.isArray(json) && json.every((e: any) => typeof e === 'object')) {
          json.forEach((entry: Record<string, string>) => {
            Object.entries(entry).forEach(([name, content]) => knowledgeBase.push({ name, content }));
          });
          botResponse = null; 
        } else {
          botResponse = typeof json === 'string' ? json : JSON.stringify(json);
        }
      } catch (error) {
        logger.error("JSON parsing failed");
        throw error;
      }
    } else {
      const text = await azureResponse.text();
      botResponse = text;
    }

    const payload = {
      botResponse: botResponse ?? '',
      knowledgeBase,
    };

    return {
      statusCode: azureResponse.status,
      body: JSON.stringify([payload])
    };
  } catch (error: any) {
    logger.error("Azure API call failed: " + error.message);
    logger.error("Error stack: " + error.stack);
    throw error;
  }
}

// Minimal streaming variant to proxy APIM stream to the caller
export async function signAzureRequestStream(
  req: any,
  config: any,
  logger: any
) {
  if (logger && typeof logger.info === 'function') {
    try { logger.info('PDLC: Starting Azure APIM stream proxy'); } catch {}
  }
  const targetUrl = config.targetUrl;
  const clientID = config.clientID;
  const apiKey = config.apiKey;

  const credential = new DefaultAzureCredential({
    managedIdentityClientId: clientID,
  });

  const token = await getRefreshedToken(credential);
  const jsonPayload = req.body;
  const formData = new FormData();

  // Append scalar fields safely (skip images)
  for (const key in jsonPayload) {
    if (!jsonPayload.hasOwnProperty(key)) continue;
    if (key === 'images') continue;
    const val = jsonPayload[key];
    if (val === undefined || val === null) continue;
    formData.append(key, xss(typeof val === 'string' ? val : String(val)));
  }

  // Append images as files: expects [{ format: string; content: number[] }]
  if (Array.isArray(jsonPayload?.images)) {
    try {
      jsonPayload.images.forEach((img: { format: string; content: number[] }, idx: number) => {
        if (!img || !img.content || !img.format) return;
        const bytes = Uint8Array.from(img.content);
        const blob = new Blob([bytes], { type: img.format });
        const ext = img.format.split('/')[1] || 'bin';
        const filename = `image_${idx + 1}.${ext}`;
        formData.append('files', blob, filename);
      });
    } catch (e: any) {
      logger?.warn?.(`Failed to append images to form-data (stream): ${e?.message || e}`);
    }
  }

  const azureResponse = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token.token}`,
      'x-api-key': apiKey,
    },
    body: formData,
  });

  return azureResponse;
}