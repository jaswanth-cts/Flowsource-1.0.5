import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService , RootConfigService } from '@backstage/backend-plugin-api';

import PrismaCloudService from './PrismaCloudService'
import ContainerImageScanService from './containerImageScanService'
import xss from 'xss';

import backEndPackageJson from '../../package.json';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}
 
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;


  const severitiesKey = ['critical', 'moderate', 'high', 'medium', 'low', 'others'];
  const accessKey = config.getOptionalString('prisma-cloud.access_key') || '';
  const secretey = config.getOptionalString('prisma-cloud.secret_access_key') || '';
  const apiUrl = config.getOptionalString('prisma-cloud.api_host') || '';
  const maxRow = config.getString('prisma-cloud.max_row_fetch');


  const packageTypeConfig = config.getConfig(`prisma-cloud.package-types`);
  var configStr = JSON.stringify(packageTypeConfig);
  var configJson = JSON.parse(configStr);
  var jsonPrismaObj = configJson.parent.config.data["prisma-cloud"];
  var packageTypes = jsonPrismaObj.packageTypes;

  let maxRowFetch = parseInt(maxRow);

  const getAuthToken = async (): Promise<any> => {
    try 
    {
      let body = {
        username: accessKey,
        password: secretey,
      };

      const res = await fetch(apiUrl + "login", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      var authToken = await res.json();
      return authToken.token;

    } catch (err) {
      logger.error('Authentication Error ' + err);
      throw "Authentication failed.";
    }
  }



  const groupByPkgTypes = (data: any, pkgTypes: any, _: any) => {

    const pkgLen = pkgTypes?.length;
    const items = new Array(pkgLen).fill(0)

    data.forEach(function (d: any) {
      var index = pkgTypes.findIndex((x: any) => x.packageType.value === d.id);
      items[index] = items[index] + 1;
    })
    return items;

  };

  const groupBySeverity = (data: any) => {
    const items = new Array(6).fill(0)
    data.forEach(function (d: any) {
      switch (d.severity) {
        case 'critical':
          items[0] = items[0] + 1;
          break;
        case 'moderate':
          items[1] = items[1] + 1;
          break;
        case 'high':
          items[2] = items[2] + 1;
          break;
        case 'medium':
          items[3] = items[3] + 1;
          break;
        case 'low':
          items[4] = items[4] + 1;
          break;

        default:
          items[5] = items[5] + 1;
      }
    })
    return items;
  };

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info("PING")
    response.json({ status: 'ok' });
  });

  router.get('/code-scan-summary', async (req, res) => {

    if(!accessKey || !secretey || !apiUrl) {
      const error = new Error(`Service Unavailable: Prisma Cloud Service plugin failed with error 503, missing values in PrismaCloudService`);
      (error as any).status = 503; // Attach status code to error object
      throw error;
    }

    const token = await getAuthToken();
    const prismaCloudService = new PrismaCloudService(apiUrl, token, maxRowFetch);
    if (typeof req.query.reponame === 'undefined') {
      return res.status(400).send('repository name is missing')
    }
    
    if (typeof req.query.branchname === 'undefined') {
      return res.status(400).send('branch name is missing')
    }

    let reponame: string = req.query.reponame ? xss(req.query.reponame.toString()) : '';
    let branchname: string = req.query.branchname ? xss(req.query.branchname.toString()) : '';
    let codecat: string = req.query.codecategry ? xss(req.query.codecategry.toString()) : 'Vulnerabilities';

    try {
      const resData = await prismaCloudService.getCodeReviewSummary(reponame, branchname, codecat);
      return res.status(200).send(xss(JSON.stringify(resData)));
    } catch (err: any) {
      logger.error(err);
      switch (err.status) {
        case 503:
          return res.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in PrismaCloudService'
          });
        case 500:
          return res.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error ' + err.message
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return res.status(500).send({
            success: false,
            error: 'Unexpected Error. ' + err.message
          });
        }
    }
  });

  router.get('/scan-summary-by-code-category', async (req, res) => {

    if(!accessKey || !secretey || !apiUrl) {
      const error = new Error(`Service Unavailable: Prisma Cloud Service plugin failed with error 503, missing values in PrismaCloudService`);
      (error as any).status = 503; // Attach status code to error object
      throw error;
    }

    const token = await getAuthToken();
    const prismaCloudService = new PrismaCloudService(apiUrl, token, maxRowFetch);
    if (typeof req.query.reponame === 'undefined') {
      return res.status(400).send('repository name is missing')
    }
    
    if (typeof req.query.branchname === 'undefined') {
      return res.status(400).send('branch name is missing')
    }

    let reponame: string = req.query.reponame ? xss(req.query.reponame.toString()) : '';
    let branchname: string = req.query.branchname ? xss(req.query.branchname.toString()) : '';
    let codecat: string = req.query.codecategry ? xss(req.query.codecategry.toString()) : 'Vulnerabilities';

    try {
      const resData = await prismaCloudService.getScanSummary(reponame, branchname, codecat);
      logger.info(">>> api fetch status >> " + resData!.status)
      return res.status(200).send(xss(JSON.stringify(resData)));
    } catch (err: any) {
      logger.error(err)
      switch (err.status) {
        case 503:
          return res.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in PrismaCloudService'
          });
        case 500:
          return res.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error' + err.message
          });
        case 404:
          return res.status(404).send({
            success: false,
            error: err.message
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return res.status(500).send({
            success: false,
            error: 'Unexpected Error. ' + err.message
          });
        }
    }

  });

  router.get('/image-scan-result', async (req, res) => {
    try {
      const apiTwistlockUrl = config.getOptionalString('prisma-cloud.twistlock_api_host');

      if(!accessKey || !secretey || !apiUrl || !apiTwistlockUrl) {
        const error = new Error(`Service Unavailable: Prisma Cloud Service plugin failed with error 503, missing values in PrismaCloudService`);
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }

      if (typeof req.query.filter === 'undefined') {
        return res.status(400).send('filter param is missing')
      }

      const authToken = await getAuthToken();

      let filter: string = req.query.filter ? xss(req.query.filter.toString()) : '';

      const scanClient = new ContainerImageScanService(apiTwistlockUrl, authToken);
      const result = await scanClient.getScanResult(filter);

      if (result != null && result != undefined && result.length > 0) {
        const vulnes = result[0].entityInfo.vulnerabilities;
        let packages = new Array();
        let severitiesGroup = new Array();
        let validPackages = new Array()

        packageTypes.forEach(function (pks: any) {
          let validPkg = vulnes.filter(function (el: any) {
            return el.id === pks.packageType.value;
          });

          if (validPkg != null && validPkg != undefined && validPkg.length > 0) {
            validPackages.push(pks);
          }
        })
        severitiesKey.forEach(function (sev) {
          let pcksByVulKey = vulnes.filter(function (el: any) {
            return el.severity == sev;
          });

          if (pcksByVulKey != null && pcksByVulKey != undefined && pcksByVulKey.length > 0) {
            const pkgVulnerabilities = groupByPkgTypes(pcksByVulKey, validPackages, sev);
            severitiesGroup.push({ 'name': sev, vulnerabilities: pkgVulnerabilities })
          }
        })

        /**    group by package types stargs*/
        packageTypes.forEach(function (pk: any, _: any) {
          let pcks = vulnes.filter(function (el: any) {
            return el.id == pk.packageType.value;
          });

          if (pcks != null && pcks != undefined && pcks.length > 0) {
            const pkgVul = groupBySeverity(pcks);
            packages.push({ 'name': pk.packageType.name, vulnerabilities: pkgVul })
          }
        });

        /**    group by package types ends*/
        return res.status(200).send(
         xss(JSON.stringify({
          "dataState": "DATA_AVAILABLE",
          'raw': result[0].entityInfo,
          'packages': packages,
          severities: severitiesGroup,
          vulnerabilitykeys: severitiesKey
        })));
      }
      else {
        return res.status(200).send({
          "dataState": "NO_DATA_AVAILABLE"
        });
      }

    }
    catch (err: any) {
      logger.error(err);
      switch (err.status) {
        case 503:
          return res.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in PrismaCloudService'
          });
        case 500:
          return res.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error ' + err.message
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return res.status(500).send({
            success: false,
            error: 'Unexpected Error. ' + err.message
          });
        }
    }
    return res.status(500).send("Internal error occurred. ");
  });

  router.get('/host-scan-result', async (req, res) => {

    try{
      const apiTwistlockUrl = config.getOptionalString('prisma-cloud.twistlock_api_host');

      if(!accessKey || !secretey || !apiUrl || !apiTwistlockUrl) {
        const error = new Error(`Service Unavailable: Prisma Cloud Service plugin failed with error 503, missing values in PrismaCloudService`);
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }

      let hostnames:string = req.query.hostnames ? xss(req.query.hostnames.toString()) : '';

      const authToken = await getAuthToken();
      const scanClient = new ContainerImageScanService(apiTwistlockUrl, authToken);
      const result = await scanClient.getHostScanResult(hostnames);
      
      return res.status(200).send(xss(JSON.stringify(result))); 

    }catch(err:any){
      logger.error(err);
      switch (err.status) {
        case 503:
          return res.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in PrismaCloudService'
          });
        case 500:
          return res.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error ' + err.message
          });
        case 404:
          return res.status(404).send({
            success: false,
            error: err.message
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return res.status(500).send({
            success: false,
            error: 'Unexpected Error. ' + err.message
          });
        }
    }

  });

  router.get('/container-scan-result', async (req, res) => {
    let clusterName:string = req.query.clusters ? xss(req.query.clusters.toString()) : '';
    let nameSpaces:string = req.query.namespaces ? xss(req.query.namespaces.toString()) : '';
   
    let images:string = req.query.images? xss(req.query.images.toString()) : '';
    let filterOption:any={}
    if(clusterName != null && clusterName!= undefined && clusterName.length > 0){
      if(clusterName.indexOf(",") === -1){
        filterOption.clusters=clusterName
      }
      else{
        logger.error("multiple cluster Names not allowed");
        return res.status(400).send("Bad Request.  multiple cluster Names not allowed.");
      }
    }
    else{
      logger.error("parameter 'cluster Name' required");
      return res.status(400).send("Bad Request.  cluster name required.");
    }

    if(nameSpaces != null && nameSpaces!= undefined && nameSpaces.length > 0){
      filterOption.namespaces=nameSpaces
    }
    else{
      logger.error("parameter 'namespaces' required");
      return res.status(400).send("Bad Request.  namespaces required ");
    }

    if(images != null && images!= undefined && images.length > 0){
      filterOption.image=images
    }
    else{
      logger.error("parameter image name required");
      return res.status(400).send("Bad Request.  image name required ");
    }

    try{
      const apiTwistlockUrl = config.getString('prisma-cloud.twistlock_api_host');
      if(!accessKey || !secretey || !apiUrl || !apiTwistlockUrl) {
        const error = new Error(`Service Unavailable: Prisma Cloud Service plugin failed with error 503, missing values in PrismaCloudService`);
        (error as any).status = 503; // Attach status code to error object
        throw error;
      }
      const authToken = await getAuthToken();
      const scanClient = new ContainerImageScanService(apiTwistlockUrl, authToken);
      const result = await scanClient.getContainerScanResult(filterOption);

      return res.status(200).send(xss(JSON.stringify(result))); 

    }catch(err:any){
      logger.error(err);
      switch (err.status) {
        case 503:
          return res.status(503).send({
            success: false,
            error: 'Service unavailable, missing values credentials in PrismaCloudService'
          });
        case 500:
          return res.status(500).send({
            success: false,
            error: 'Internal Server Error: fetch error ' + err.message
          });
        default:
          // For all other errors, respond with a 500 Internal Server Error
          return res.status(500).send({
            success: false,
            error: 'Unexpected Error. ' + err.message
          });
        }
    }

  });

  router.get('/plugin-versions', async (_request, response) => {

    const backendVersionJson = "{\"version\": \"" + backEndPackageJson.version + "\"}";

    return response.status(200).send(backendVersionJson);

  });

  router.use(errorHandler());
  return router;
}
