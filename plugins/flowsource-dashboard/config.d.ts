export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  
    dashboard: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string; // defined in core, but repeated here without doc
    };
  }

