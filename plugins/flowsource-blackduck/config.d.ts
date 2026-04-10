export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  
    blackduck: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      blackduckBaseUrl: string; // defined in core, but repeated here without doc
    };
  }

