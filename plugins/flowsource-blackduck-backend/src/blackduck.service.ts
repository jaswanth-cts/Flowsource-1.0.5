import BlackduckCredentials from './services/model/BlackduckCredentials';
import ClientCredentials from './services/model/ClientCredentials';
import AuthService from './services/auth.service';
import { LoggerService } from '@backstage/backend-plugin-api';
import { apiRequest } from './services/apiRequest';
import { Readable } from 'stream';

class BlackduckService {
  private logger: LoggerService;
  BlackduckCredentials: BlackduckCredentials;
  authService: AuthService;
  accessToken: any;
  BlackduckBaseUrl: string;
  expiryTimeinMilliseconds: any;

  constructor(
    logger: LoggerService,
    BlackduckCredentials: BlackduckCredentials,
  ) {
    this.logger = logger;
    this.authService = new AuthService(logger);
    this.BlackduckCredentials = BlackduckCredentials;
    this.BlackduckBaseUrl = this.BlackduckCredentials.getBaseUrl().replace(
      /\/help$/,
      '',
    );
  }
  async getAuthDetails(): Promise<ClientCredentials | undefined> {
    const start = Date.now();
    this.logger.info('Start: getAuthDetails');

    const authDetails = await this.authService.getBlackduckAuthToken(
      this.BlackduckCredentials,
    );
    if (!authDetails) {
      this.logger.error('Unable to generate auth token');
      return undefined;
    }

    this.accessToken = authDetails.bearerToken;
    this.expiryTimeinMilliseconds =
      Date.now() + authDetails.expiresInMilliseconds;
    this.logger.info(
      `Token will expire at: ${new Date(
        this.expiryTimeinMilliseconds,
      ).toISOString()}`,
    );

    const end = Date.now();
    this.logger.info(`End: getAuthDetails | Duration: ${end - start}ms`);
    return authDetails;
  }
  async isTokenExpired() {
    return !this.accessToken || Date.now() >= this.expiryTimeinMilliseconds;
  }
  async getHighVulnerabilityFromVersion(
    vulnerabilitiesUrl: string,
    headers: any,
  ): Promise<{ items: any[] }> {
    const start = Date.now();
    this.logger.info('Start: getHighVulnerabilityFromVersion');

    const limit = 1000;
    let offset = 0;
    let allItems: any[] = [];

    while (true) {
      const urlWithPaging = `${vulnerabilitiesUrl}?limit=${limit}&offset=${offset}`;
      const response = await apiRequest(
        this.logger,
        'GET',
        urlWithPaging,
        headers,
      );
      if (!response.ok) break;
      const data = await response.json();
      if (!data.items?.length) break;
      allItems = allItems.concat(data.items);
      if (data.items.length < limit) break;
      offset += limit;
    }

    const end = Date.now();
    this.logger.info(
      `End: getHighVulnerabilityFromVersion | Duration: ${end - start}ms`,
    );
    return { items: allItems };
  }
  async getProjectOverview(projectName: any = {}): Promise<any> {
    const start = Date.now();
    this.logger.info(`Start: getProjectOverview for project: ${projectName}`);

    try {
      if (await this.isTokenExpired()) {
        this.logger.info('Token is expired, fetching new auth token');
        await this.getAuthDetails();
      }

      const projectsUrl = `${
        this.BlackduckBaseUrl
      }/api/projects?q=name:${encodeURIComponent(projectName)}`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      };

      const projectsResponse = await apiRequest(
        this.logger,
        'GET',
        projectsUrl,
        headers,
      );
      if (!projectsResponse.ok) return null;

      const projectsData = await projectsResponse.json();
      if (!projectsData.items?.length) return null;

      const project = projectsData.items[0];
      const projectId = project._meta.href.split('/').pop();
      this.logger.info(`Project ID: ${projectId}`);

      const versions = await this.getProjectVersions(projectId);
      if (!versions?.length) return null;

      const sortedVersions = versions
        .filter((v: any) => v.lastScanDate)
        .sort(
          (a: any, b: any) =>
            new Date(b.lastScanDate).getTime() -
            new Date(a.lastScanDate).getTime(),
        );

      const latestVersion = sortedVersions[0];
      const latestVersionId = latestVersion._meta.href.split('/').pop();

      const versionsList = sortedVersions.map((v: any) => ({ 
        versionId: v._meta.href.split('/').pop(), 
        versionName: v.versionName 
      })); 

      const projectData = {
        projectName: project.name,
        latestVersionName: latestVersion.versionName,
        latestVersionId: latestVersionId,
        projectId: projectId,
        versionsList: versionsList, 
      };

      const end = Date.now();
      this.logger.info(`End: getProjectOverview | Duration: ${end - start}ms`);
      return projectData; 
    } catch (error: any) {
      this.logger.error('Error in getProjectOverview:', error);
      throw error;
    }
  }
  async getProjectVersions(projectId: string): Promise<any[]> {
    const start = Date.now();
    this.logger.info(`Start: getProjectVersions for ${projectId}`);

    const limit = 1000;
    let offset = 0;
    let allItems: any[] = [];
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    while (true) {
      const versionsUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions?limit=${limit}&offset=${offset}`;
      const versionsResponse = await apiRequest(
        this.logger,
        'GET',
        versionsUrl,
        headers,
      );
      if (!versionsResponse.ok) break;
      const versionsData = await versionsResponse.json();
      if (!versionsData.items?.length) break;
      allItems = allItems.concat(versionsData.items);
      if (versionsData.items.length < limit) break;
      offset += limit;
    }

    const end = Date.now();
    this.logger.info(`End: getProjectVersions | Duration: ${end - start}ms`);
    return allItems;
  }
  async fetchGraphData(projectId: string, versionId: string): Promise<any> {
    const start = Date.now();
    this.logger.info('Start: fetchGraphData');
  
    if (await this.isTokenExpired()) {
      this.logger.info('Token is expired, fetching new auth token');
      await this.getAuthDetails();
    }
  
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
  
    const url = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}`;
    const response = await apiRequest(this.logger, 'GET', url, headers);
  
    if (!response.ok) return;
  
    const versionData = await response.json();
  
    const issueDistribution = await this.getIssueDistribution(versionData);
    const riskaging = await this.fetchAndProcessComponents(projectId, versionId);
  
    const end = Date.now();
    this.logger.info(`End: fetchGraphData | Duration: ${end - start}ms`);
  
    return {
      issueDistribution,
      riskaging,
      lastScanDate: versionData.lastScanDate || 'N/A',
      versionPhase: versionData.phase || 'N/A',
      versionDistribution: versionData.distribution || 'N/A',
      lastBomUpdateDate: versionData.lastBomUpdateDate || 'N/A',
    };
  }
  async getIssueDistribution(version: any): Promise<any> {
    const start = Date.now();
    this.logger.info(
      `Start: getIssueDistribution for version: ${version.versionName}`,
    );

    const profileNames = [
      'securityRiskProfile',
      'licenseRiskProfile',
      'operationalRiskProfile',
    ];
    const issueDistribution: any = {};

    for (const profileName of profileNames) {
      const profileData = version[profileName];
      issueDistribution[profileName] = { high: 0, medium: 0, low: 0 };
      for (const count of profileData.counts) {
        if (count.countType === 'HIGH') {
          issueDistribution[profileName].high += count.count;
        } else if (count.countType === 'CRITICAL') {
          issueDistribution[profileName].high += count.count;
        } else if (count.countType === 'MEDIUM') {
          issueDistribution[profileName].medium += count.count;
        } else if (count.countType === 'LOW') {
          issueDistribution[profileName].low += count.count;
        }
      }
    }

    const end = Date.now();
    this.logger.info(`End: getIssueDistribution | Duration: ${end - start}ms`);
    return issueDistribution;
  }
  async getHighVulnerability(vulnerabilitiesData: any): Promise<any> {
    const start = Date.now();
    this.logger.info('Start: getHighVulnerability');

    if (!vulnerabilitiesData || !vulnerabilitiesData.items) {
      this.logger.error(
        'vulnerabilitiesData or vulnerabilitiesData.items is undefined',
      );

      return {}; // Return an empty object or handle the error as needed
    }

    const grouped: any[] = []; // Initialize as an array to collect vulnerabilities

    vulnerabilitiesData.items.forEach((item: any) => {
      const {
        componentName,
        securityRiskProfile,
        vulnerabilityWithRemediation,
        componentVersionName,
      } = item;

      const { matchTypes, totalFileMatchCount, severity } =
        vulnerabilityWithRemediation;

      if (severity) {
        const v = {
          componentName,
          securityRiskProfile,
          matchTypes,
          totalFileMatchCount,
          componentVersionName,
        };

        grouped.push(v);
      }
    });

    const end = Date.now();

    this.logger.info(`End: getHighVulnerability | Duration: ${end - start}ms`);

    return grouped;
  }
  async fetchAndProcessComponents(
    projectId: string,
    versionId: string,
  ): Promise<any> {
    const start = Date.now();
    this.logger.info('Start: fetchAndProcessComponents');
    let offset = 0;
    const limit = 1000;

    // Define risk profiles and count types you care about
    const riskProfiles = [
      'securityRiskProfile',
      'licenseRiskProfile',
      'operationalRiskProfile',
    ];
    const MS_PER_DAY = 86400000; // 1000 * 60 * 60 * 24

    // Initialize agingBuckets using the helper
    const agingBuckets: Record<
      string,
      Record<string, Record<string, number>>
    > = {
      '0-15days': {},
      '15-30days': {},
      '1-3Months': {},
      'grt-thn-3Months': {},
    };

    // Initialize all buckets for all risk profiles
    for (const bucket of Object.keys(agingBuckets)) {
      for (const profile of riskProfiles) {
        agingBuckets[bucket][profile] = { HIGH: 0, MEDIUM: 0, LOW: 0 };
      }
    }

    const currentDate = new Date();

    while (true) {
      const componentsUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}/components?filter=bomInclusion%3Afalse&filter=bomMatchInclusion%3Afalse&filter=bomMatchReviewStatus%3Areviewed&limit=${limit}&offset=${offset}`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      };
      const response = await apiRequest(
        this.logger,
        'GET',
        componentsUrl,
        headers,
      );
      if (!response) {
        this.logger.warn('No components found for the latest version');
        break;
      }
      const data = await response.json();
      if (!data.items || data.items.length === 0) break;

      data.items.forEach((component: any) => {
        const releasedOn = new Date(component.releasedOn);
        const daysDifference = Math.floor(
          (currentDate.getTime() - releasedOn.getTime()) / MS_PER_DAY,
        );
        let bucket: string;
        if (daysDifference <= 15) bucket = '0-15days';
        else if (daysDifference <= 30) bucket = '15-30days';
        else if (daysDifference <= 90) bucket = '1-3Months';
        else bucket = 'grt-thn-3Months';

        for (const profile of riskProfiles) {
          const counts = component[profile]?.counts || [];
          for (const count of counts) {
            if (count.countType === 'CRITICAL') {
              agingBuckets[bucket][profile].CRITICAL += count.count;
            } else if (count.countType === 'HIGH') {
              agingBuckets[bucket][profile].HIGH += count.count;
            } else if (count.countType === 'MEDIUM') {
              agingBuckets[bucket][profile].MEDIUM += count.count;
            } else if (count.countType === 'LOW') {
              agingBuckets[bucket][profile].LOW += count.count;
            }
          }
        }
      });

      if (data.items.length < limit) break;
      offset += limit;
    }

    const end = Date.now();
    this.logger.info(
      `End: fetchAndProcessComponents | Duration: ${end - start}ms`,
    );
    return agingBuckets;
  }
  async fetchComponentsData(
    projectId: string,
    versionId: string,
  ): Promise<{ componentsData: any[]; totalBomEntries: number }>  {
    const start = Date.now();
    this.logger.info('Start: fetchComponentsData');
    let offset = 0;

    const limit = 1000;

    const componentsData: any[] = [];
    let totalBomEntries = 0;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    while (true) {
      const componentsUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}/components?limit=${limit}&offset=${offset}`;

      const response = await apiRequest(
        this.logger,
        'GET',
        componentsUrl,
        headers,
      );

      if (!response.ok) {
        this.logger.warn('Failed to fetch components data');
        break;
      }

      const data = await response.json();

      totalBomEntries = data.totalCount;

      if (!data.items || data.items.length === 0) break;

      const formattedData = data.items
        .filter((component: any) => {
          const counts = component.securityRiskProfile?.counts || [];
          const hasRelevantRisk = counts.some(
            (count: any) =>
              ['CRITICAL', 'HIGH', 'MEDIUM'].includes(count.countType) &&
              count.count > 0,
          );
          return hasRelevantRisk;
        })
        .map((component: any) => {
          const formattedComponent = {
            componentName: component.componentName || 'N/A',
            securityRiskProfile: component.securityRiskProfile?.counts || [],
            matchTypes: component.matchTypes || [],
            totalFileMatchCount: component.totalFileMatchCount || 0,
            componentVersionName: component.componentVersionName || 'N/A',
            componentId: component.component
              ? component.component.split('/').pop()
              : 'N/A',
            componentVersionId: component.componentVersion
              ? component.componentVersion.split('/').pop()
              : 'N/A',
            originId:
              component.origins && component.origins[0]?.origin
                ? component.origins[0].origin.split('/').pop()
                : 'N/A',
          };
          return formattedComponent;
        });

      componentsData.push(...formattedData);

      if (data.items.length < limit) break;

      offset += limit;
    }

    const end = Date.now();
    this.logger.info(`End: fetchComponentsData | Duration: ${end - start}ms`);

    return {componentsData, totalBomEntries};
  }
  async fetchVulnerabilitiesData(
    projectId: string,
    versionId: string,
    componentId: string,
    componentVersionId: string,
    originId: string,
  ): Promise<any[]> {
    const vulnerabilitiesUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}/components/${componentId}/versions/${componentVersionId}/origins/${originId}/vulnerabilities`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
  
    const response = await apiRequest(
      this.logger,
      'GET',
      vulnerabilitiesUrl,
      headers,
    );
  
    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to fetch vulnerabilities: ${errorText}`);
      throw new Error(`Failed to fetch vulnerabilities: ${errorText}`);
    }
  
    const data = await response.json();
  
    // Filter vulnerabilities to include only HIGH and MEDIUM severity
    const filteredVulnerabilities = data.items.filter((vulnerability: any) => {
      const severity = vulnerability.cvss3?.severity || 'N/A';
      return severity !== 'LOW'; // Exclude LOW severity, include all others
    });
  
    return filteredVulnerabilities.map((vulnerability: any) => ({
      id: vulnerability.id,
      remediationStatus: vulnerability.remediationStatus,
      severity: vulnerability.cvss3?.severity || 'N/A',
    }));
  }
  async generateAndDownloadReport(versionId: any, projectId: any) {
    const createReportUrl = `${this.BlackduckBaseUrl}/api/versions/${versionId}/reports`;
    const getReportsUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}/reports`;

    // Step 1: Create the report
    const createPayload = {
      reportFormat: 'CSV',
      reportType: 'VERSION',
      categories: [
        'VERSION',
        'CODE_LOCATIONS',
        'COMPONENTS',
        'SECURITY',
        'FILES',
        'LICENSE_CONFLICTS',
        'LICENSE_TERM_FULFILLMENT',
      ],
      includeSubprojects: true,
    };
    const isExpired = await this.isTokenExpired();
    if (isExpired) {
      this.logger.info('Token is expired, fetching new auth token');
      await this.getAuthDetails();
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    const headers_d = {
      'Content-Type': 'application/octet-stream',
      Authorization: `Bearer ${this.accessToken}`,
    };

    console.log('Creating report...');
    const createResponse = await apiRequest(
      this.logger,
      'POST',
      createReportUrl,
      headers,
      createPayload,
    );
    if (!createResponse.ok) {
      throw new Error('Failed to create report');
    }

    // Step 2: Poll for report status
    let reportStatus = 'IN_PROGRESS';
    let downloadUrl = null;

    this.logger.info('Polling for report status...');
    const maxRetries = this.BlackduckCredentials.getMaxRetries();
    this.logger.info(`Max retries set to: ${maxRetries}`);
    let retries = 0;
    while (reportStatus === 'IN_PROGRESS' && retries < maxRetries) {
      const reportsResponse = await apiRequest(
        this.logger,
        'GET',
        getReportsUrl,
        headers,
      );
      const reportsData = await reportsResponse.json();
      // Find the latest VERSION report
      const latestReport = reportsData.items.find(
        (item: any) => item.reportType === 'VERSION',
      );
      if (!latestReport) {
        // No VERSION report yet, wait and try again
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries++;
        continue;
      }
      reportStatus = latestReport.status;

      if (reportStatus === 'COMPLETED') {
        this.logger.info('Report is ready for download');
        // Extract the download URL from the links section
        const downloadLinkObject = latestReport._meta.links.find(
          (link: { rel: string }) => link.rel === 'download',
        );
        if (downloadLinkObject && downloadLinkObject.href) {
          downloadUrl = downloadLinkObject.href;
        } else {
          throw new Error('Download link not found in the report response');
        }
        break;
      }

      this.logger.info('Report is still in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
      retries++;
    }
    if (reportStatus !== 'COMPLETED') {
      throw new Error('Report generation timed out after maximum retries');
    }
    if (!downloadUrl) {
      throw new Error('Failed to retrieve the download URL');
    }
    // Step 3: Download the report
    this.logger.info('Downloading report...');
    const response = await apiRequest(
      this.logger,
      'GET',
      downloadUrl,
      headers_d,
    );

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(
        `HTTP error! status: ${response.status}, Response body: ${errorText}`,
      );
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }

    const readableStream = response.body;
    if (!readableStream) {
      throw new Error('No readable stream in response');
    }
    return Readable.from(readableStream);
  }
  async generateAndDownloadSbomReport(
    versionId: string,
    projectId: string,
  ): Promise<Readable> {
    const createSbomReportUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}/sbom-reports`;
    const getReportsUrl = `${this.BlackduckBaseUrl}/api/projects/${projectId}/versions/${versionId}/reports`;

    // Step 1: Create the SBOM report
    const createPayload = {
      reportType: 'SBOM',
      template: `${this.BlackduckBaseUrl}/api/sbom-templates/00000000-0000-0000-0000-000000000001`,
      sbomType: 'SPDX_23',
      reportFormat: 'JSON',
    };

    const isExpired = await this.isTokenExpired();
    if (isExpired) {
      this.logger.info('Token is expired, fetching new auth token');
      await this.getAuthDetails();
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    const headers_d = {
      'Content-Type': 'application/octet-stream',
      Authorization: `Bearer ${this.accessToken}`,
    };

    this.logger.info('Creating SBOM report...');
    const createResponse = await apiRequest(
      this.logger,
      'POST',
      createSbomReportUrl,
      headers,
      createPayload,
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create SBOM report');
    }

    // Step 2: Poll for report status
    let reportStatus = 'IN_PROGRESS';
    let downloadUrl = null;

    this.logger.info('Polling for SBOM report status...');
    const maxRetries = this.BlackduckCredentials.getMaxRetries();
    this.logger.info(`Max retries set to----sbom: ${maxRetries}`);
    let retries = 0;
    while (reportStatus === 'IN_PROGRESS' && retries < maxRetries) {
      const reportsResponse = await apiRequest(
        this.logger,
        'GET',
        getReportsUrl,
        headers,
      );
      const reportsData = await reportsResponse.json();
      // Find the latest SBOM report
      const latestReport = reportsData.items.find(
        (item: any) => item.reportType === 'SBOM',
      );
      if (!latestReport) {
        // No SBOM report yet, wait and try again
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries++;
        continue;
      }

      reportStatus = latestReport.status;

      if (reportStatus === 'COMPLETED') {
        this.logger.info('SBOM report is ready for download');

        // Extract the download URL from the links section
        const downloadLinkObject = latestReport._meta.links.find(
          (link: { rel: string }) => link.rel === 'download',
        );
        if (downloadLinkObject && downloadLinkObject.href) {
          downloadUrl = downloadLinkObject.href;
        } else {
          throw new Error('Download link not found in the SBOM report response');
        }
        break;
      }

      this.logger.info('SBOM report is still in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
      retries++;
    }
    if (reportStatus !== 'COMPLETED') {
      throw new Error('SBOM report generation timed out after maximum retries');
    }

    if (!downloadUrl) {
      throw new Error('Failed to retrieve the SBOM report download URL');
    }

    // Step 3: Download the SBOM report
    this.logger.info('Downloading SBOM report...');
    const response = await apiRequest(
      this.logger,
      'GET',
      downloadUrl,
      headers_d,
    );

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(
        `HTTP error! status: ${response.status}, Response body: ${errorText}`,
      );
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }

    const readableStream = response.body;
    if (!readableStream) {
      throw new Error('No readable stream in SBOM report response');
    }

    return Readable.from(readableStream);
  }
}
export default BlackduckService;