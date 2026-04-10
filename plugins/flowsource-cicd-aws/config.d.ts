export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  
    aws: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      awsCodePipeline: {
        /**
         * Frontend root URL
         * @visibility frontend
         */
        enableTrigger: boolean;
      }; // defined in core, but repeated here without doc
    };
  }

