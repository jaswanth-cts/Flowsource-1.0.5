export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  
    unleash: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      unleashBaseUrl: string; // defined in core, but repeated here without doc
    };
  }

