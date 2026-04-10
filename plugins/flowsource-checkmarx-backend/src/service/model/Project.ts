
interface CustomField {
    isMandatory: boolean;
    projectId: number;
    id: number;
    value: string;
    name: string;
  }
  
  interface Link {
    rel: string;
    uri: string;
  }
  
  interface Project {
    id: number;
    teamId: number;
    name: string;
    isPublic: boolean;
    customFields: CustomField[];
    links: Link[];
    owner: string;
    isDeprecated: boolean;
    projectQueueSettings: {
      queueKeepMode: string;
      scansType: string;
      includeScansInProcess: boolean;
      identicalCodeOnly: boolean;
    };
    isBranched: boolean;
    originalProjectId: string;
    branchedOnScanId: string;
    relatedProjects: number[];
  }

  export default Project;