export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };

    jenkins: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
        enableTrigger: boolean;
      }; // defined in core, but repeated here without doc
    };
  