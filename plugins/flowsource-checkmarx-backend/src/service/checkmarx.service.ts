import { apiRequest } from './apiRequest';
import CheckmarxCredentials from './model/CheckmarxCredentials';
import ClientCredentials from './model/ClientCredentials';
import ReportType from './model/ReportType';
import AuthService from './auth.service';
import JsonExtractorService from './jsonextractor.service';
import { LoggerService } from '@backstage/backend-plugin-api';


const util = require('util');
const xml2js = require('xml2js');

class CheckmarxService {

  MAX_RETRIES = 5;
  authService: AuthService;
  expiryTimeinMilliseconds: any;
  accessToken!: string;
  jsonExtractorService: JsonExtractorService;
  checkmarxBaseURL: string;
 
  logger: LoggerService;
  checkmarxCredentials: CheckmarxCredentials;
  constructor(checkmarxCredentials: CheckmarxCredentials, logger: LoggerService) {
    this.authService = new AuthService( logger);
    this.checkmarxCredentials = checkmarxCredentials;
    this.logger = logger;
    this.jsonExtractorService = new JsonExtractorService( logger );
    this.checkmarxBaseURL = this.checkmarxCredentials.getBaseUrl();
  }
  async getAuthDetails(): Promise<ClientCredentials | undefined> {
    const authDetails = await this.authService.getCheckmarxAuthToken(this.checkmarxCredentials);
    if (authDetails == null) {
      this.logger.error('Unable to generate auth token');
      return undefined;
    }
    this.logger.info('Recieved the access token')
    this.accessToken = authDetails.access_token;
    this.expiryTimeinMilliseconds = Date.now() + authDetails.expires_in * 1000;
    return authDetails;
  }

  async getProjectDetails(projectName: any = {}) {
    this.logger.info('Fetching project details for app: ' + projectName);
    try {
      const url = this.checkmarxCredentials.getBaseUrl() + 'cxrestapi/help/projects?projectName=' + projectName + '&showAlsoDeletedProjects=false';
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }
      const headers = {
        'Content-Type': 'application/json;v=5.0',
        'Authorization': 'Bearer ' + this.accessToken
      };

      const responseData = await this.fetchDetailsForProjectName(url, headers);

      if (responseData === undefined) {
        this.logger.info('Project details response is undefined for app: ' + projectName);
        return undefined;
      }

      const response = JSON.parse(responseData);
      const projectId = response[0].id;
      this.logger.info('projectId ===> ', projectId);
      const lastScanReponse = await this.getLastScanDetails(projectId);
      if (lastScanReponse === undefined) {
        this.logger.info('last scan details response is undefined for project Id: ' + projectId);
        return undefined;
      }
      const lastScanDetailsReponse = JSON.parse(lastScanReponse);
      const scanId = lastScanDetailsReponse[0].id;
      this.logger.info('scan Id ===> ', scanId);
      const reportDetailsResponse = await this.getReportId(scanId, ReportType.XML);
      if (reportDetailsResponse === undefined) {
        this.logger.info('XML Report details response is undefined for scan Id: ' + scanId);
        return undefined;
      }
      const reportId = reportDetailsResponse.reportId;
      this.logger.info('Report Id ===> ', reportId);

      let status = '';
      let count = 0;
      do {
        status = await this.getReportStatus(reportId);
        await new Promise(resolve => setTimeout(resolve, 3000));
        count++;
      } while (status !== 'Created' && count < this.MAX_RETRIES);

      this.logger.info("Report status ===> ", status as any);
      if (status === 'Created') {
        const xmlData = await this.getXmlReport(reportId);
        if (xmlData === undefined) {
          this.logger.info('XmlData is undefined for report Id: ' + reportId);
          return undefined;
        }
        const parseXml = util.promisify(xml2js.parseString);
        let jsonScanReport = await parseXml(xmlData);
        if (jsonScanReport == null || jsonScanReport === '') {
          this.logger.error('Unable to parse XML to JSON for reportId: ', reportId);
          return undefined;
        }
        // Set the parsed JSON data to state
        const topFiveVulnerabilities = await this.jsonExtractorService.getTopFiveVulnerabilities(jsonScanReport);
        let topFiveVulnerableFiles;
        if (topFiveVulnerabilities) {
          topFiveVulnerableFiles = await this.jsonExtractorService.getTopFiveVulnerableFiles(jsonScanReport, topFiveVulnerabilities);
        }
        const overallIssuesSummary = await this.jsonExtractorService.getOverallIssuesSummary(jsonScanReport);
        const projectSummary = await this.jsonExtractorService.getProjectSummary(jsonScanReport);
        const newIssuesSummary = await this.jsonExtractorService.getNewIssuesSummary(jsonScanReport);
        const vulnerabilityAsOfCurrentDate = await this.jsonExtractorService.getVulnerabilityAsOfCurrentDate(jsonScanReport);

        return {
          topFiveVulnerabilities: topFiveVulnerableFiles,
          projectSummary,
          overallIssuesSummary,
          newIssuesSummary,
          vulnerabilityAsOfCurrentDate,
          scanId,
          projectId
        };
      }
      this.logger.info("Report is not generated for Id: ", reportId);
    } catch (error) {
      this.logger.info('Error fetching checkmarx summary', error as Error);
      throw error;
    }
    return undefined;
  }

  async getReportStatus(reportId: any) {
    this.logger.info('Check if the report is generated for Id: ', reportId);
    try {

      if (reportId == null || reportId === '') {
        this.logger.info('Report id is null');
        return undefined;
      }
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }
      const url = this.checkmarxBaseURL + 'cxrestapi/reports/sastScan/' + reportId + '/status';
      const headers = {
        'Content-Type': 'application/json;v=1.0',
        'Authorization': 'Bearer ' + this.accessToken
      };
      const response = await this.fetchDetails(url, headers);
      if (response === undefined) {
        this.logger.info('Report status details response is undefined for report id: ' + reportId);
        return undefined;
      }
      const data = JSON.parse(response);
      const status = data.status.value;
      this.logger.info('Report is ', status);
      return status;
    } catch (error) {
      this.logger.error('Error fetching report status details for id: ' + reportId, error as Error);
    }
    return undefined;
  }

  async getLastScanDetails(projectId: any) { //last scan date and scan type
    this.logger.info('Fetching last scan details for projectId: ' + projectId);
    try {
      if (projectId == null || projectId === '') {
        this.logger.info('Project id is null');
        return undefined;
      }
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }
      const url = this.checkmarxCredentials.getBaseUrl() + 'cxrestapi/help/sast/scans?last=1&projectId=' + projectId;
      const headers = {
        'Content-Type': 'application/json;v=5.0',
        'Authorization': 'Bearer ' + this.accessToken,
      };
      const response = await this.fetchDetails(url, headers);
      return response;
    } catch (error) {
      this.logger.error('Error fetching last scan details', error as Error);
    }
    return undefined;
  }

  async getReportId(scanId: any = {}, reportType: ReportType) { //last scan date and scan type
    this.logger.info('Fetching report id for scanId: ' + scanId);
    try {
      if (scanId == null || scanId === '') {
        this.logger.info('Scan id is null');
        return undefined;
      }
      const url = this.checkmarxCredentials.getBaseUrl() + 'cxrestapi/help/reports/sastScan';
      const requestBody = {
        reportType: reportType,
        scanId: scanId
      };
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }
      const headers = {
        'Content-Type': 'application/json;v=1.0',
        'Authorization': 'Bearer ' + this.accessToken,
      }
      const response = await apiRequest(
        'POST',
        url,
        headers,
        this.logger,
        requestBody,
      )
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.text();
      const responseData = JSON.parse(data);
      if (responseData) {
        return responseData;
      }
    } catch (error) {
      this.logger.error('Error generating xml report Id for scan Id: ' + scanId, error as Error);
      throw error;
    }
    return undefined;
  }


  async getXmlReport(reportId: any = {}) { //last scan date and scan type
    this.logger.info('fetching xml report for reportId: ' + reportId);
    try {
      if (reportId == null || reportId === '') {
        this.logger.info('report id is null');
        return undefined;
      }
      const url = this.checkmarxBaseURL + 'cxrestapi/reports/sastScan/' + reportId;
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }
      const headers = {
        'Authorization': 'Bearer ' + this.accessToken,
        'Accept': 'application/xml;v=1.0'
      };
      const response = await this.fetchDetails(url, headers);
      return response;
    } catch (error) {
      this.logger.error('Error fetching xml report', error as Error);
    }
    return undefined;
  }

  async fetchDetailsForProjectName(url: string, headers: Record<string, string>) {
    try {
      const response = await apiRequest(
        'GET',
        url,
        headers,
        this.logger,
      )
      if (!response.ok) {
        const error = await response.text();

        if (error.includes('No project found for the provided filter.'))
        {
          const customError = new Error(`No project found for the provided filter.`);

          (customError as any).status = 404; // Attach status code to error object
          (customError as any).response = {
            status: 404,
            data: { message: `No project found for the provided filter.` },
          };

          throw customError;
        }
        else
        {
          const customError = new Error(`HTTP error! status: ${response.status}, Response body: ${error}`);
          (customError as any).status = response.status; // Attach status code to error object
          (customError as any).response = response; // Attach response object to error object
          throw customError;
        }
      }

      const data = await response.text();
      if (data) {
        return data;
      }

    } catch (error) {
      this.logger.error('Error fetching response for url: ' + url, error as Error);
      throw error;
    }
    return undefined;
  }

  // Refactor repeated logic into reusable functions for readability
  async fetchDetails(url: string, headers: Record<string, string>) {
    try {
      const response = await apiRequest(
        'GET',
        url,
        headers,
        this.logger,
      )
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      const data = await response.text();
      if (data) {
        return data;
      }
    } catch (error) {
      this.logger.error('Error fetching response for url: ' + url, error as Error);
    }
    return undefined;
  }

  async isTokenExpired() {
    if (!this.accessToken || Date.now() >= this.expiryTimeinMilliseconds) {
      return true;
    }
    return false;
  }

  async downloadPdfReport(scanId: any = {}) {
    this.logger.info('Downloading PDF report...');
    this.logger.info('scan id is : ' + scanId);
    try {

      const pdfReportIdDetailsRes = await this.getReportId(scanId, ReportType.PDF);
      if (pdfReportIdDetailsRes === undefined) {
        this.logger.info('PDF Report details response is undefined for scan Id: ' + scanId);
        return undefined;
      }
      const reportId = pdfReportIdDetailsRes.reportId;
      this.logger.info('Report Id ===> ', reportId);

      let status = '';
      let count = 0;
      do {
        status = await this.getReportStatus(reportId);
        await new Promise(resolve => setTimeout(resolve, 3000));
        count++;
      } while (status !== 'Created' && count < this.MAX_RETRIES)

      const url = this.checkmarxBaseURL + 'cxrestapi/reports/sastScan/' + reportId;
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }
      const headers = {
        'Authorization': 'Bearer ' + this.accessToken,
      };
      const response = await apiRequest(
        'GET',
        url,
        headers,
        this.logger,
      )
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, Response body: ${errorText}`);
        (error as any).status = response.status; // Attach status code to error object
        (error as any).response = response; // Attach response object to error object
        throw error;
      }
      if (response.body) {
        return response.body;
      }
    } catch (error) {
      this.logger.error('Error fetching PDF:', error as Error);
    }
    return undefined;
  }

}

export default CheckmarxService;