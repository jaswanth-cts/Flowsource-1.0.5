interface Link {
    rel: string;
    uri: string;
  }
  
  interface EmailNotifications {
    failedScan: string[];
    beforeScan: string[];
    afterScan: string[];
  }
  
  interface ScanConfiguration {
    project: {
      id: number;
      link: Link;
    };
    preset: {
      id: number;
      link: Link;
    };
    engineConfiguration: {
      id: number;
      link: Link;
    };
    postScanAction: {
      id: number;
      link: Link;
    };
    emailNotifications: EmailNotifications;
  }
  
  export default ScanConfiguration;
  