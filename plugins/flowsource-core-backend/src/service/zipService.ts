import path from 'path';
import { decodeJwt } from 'jose';
import { LoggerService } from '@backstage/backend-plugin-api';

//Note: The role entity is changed to Group
const defaultRole = 'group:default/default-group';

export const downloadZip = (req: any, response: any, logger: LoggerService) => {
  const authToken = req.header('authorization');
  let roleMatched: boolean = false;
  const idToken = decodeJwt(authToken);
  let roleArray: any = [];
  if (idToken.ent) {
    roleArray = idToken.ent;
  }
  roleArray.forEach((role: string) => {
    if (role === defaultRole) {
      roleMatched = true;
    }
  });

  if (roleMatched) {
    const currentDir = __dirname;
    const rootDirpath = currentDir.endsWith('dist')
      ? path.dirname(__dirname)
      : path.dirname(path.dirname(__dirname));

    // Determine the exact file path based on the fileName query parameter
    let filePath;
    const fileName = req.query.fileName;
    if (fileName === 'VSCode-cognizant-code-companion-prompt-library-3.1.1.zip') {
      filePath = path.join(rootDirpath, 'downloads/promptlibrary', fileName);
    } else if (fileName === 'IntelliJ-Cognizant-Code-Companion-Prompt-Library-4.1.1.zip') {
      filePath = path.join(rootDirpath, 'downloads/promptlibrary', fileName);
    } else if (
      fileName === 'cognizant-Fetch-OpenAPI-Spec-utility-3.0.0.zip'
    ) {
      filePath = path.join(rootDirpath, 'downloads/swaggerutility', fileName);
    } else {
      logger.error('Invalid file requested');
      response.status(400).send('Invalid file requested');
      return;
    }
    try {
      response.download(filePath);
    } catch (error) {
      logger.error('An error occurred while downloading the file:', error as Error);
      response.status(500).send('An error occurred while downloading the file');
    }
  } else {
    logger.error('User is not authorized');
    response.status(403).send('User is not authorized');
  }
};