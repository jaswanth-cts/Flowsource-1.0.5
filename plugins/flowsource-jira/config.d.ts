export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  
    jiracustom: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      jiraAssignedToMeFilter: boolean; // defined in core, but repeated here without doc
    };
  }

