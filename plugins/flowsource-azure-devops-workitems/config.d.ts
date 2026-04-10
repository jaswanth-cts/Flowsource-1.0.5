export interface Config {
  app: {
    /**
     * Frontend root URL
     * @visibility frontend
     */
    baseUrl: string;
  };

  azureDevOps: {
    /**
     * Frontend root URL
     * @visibility frontend
     */
    azureAssignedToMeFilter: boolean; // defined in core, but repeated here without doc
  };
}