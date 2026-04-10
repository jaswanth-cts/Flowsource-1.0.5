export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  
    pullRequestCycleTime: {
      /**
       * PR Raised to Merged Min
       * @visibility frontend
       */
      PRCycleTimeMin: number; 
      /**
       * PR Raised to Merged Max
       * @visibility frontend
       */   
      PRCycleTimeMax: number;
      /**
       * PR Raised to Approved Min
       * @visibility frontend
       */
      PRReviewCycleTimeMin: number;
      /**
       * PR Raised to Merged Max
       * @visibility frontend
       */  
      PRReviewCycleTimeMax: number;
      /**
       * PR Approved to Merged Min
       * @visibility frontend
       */
      PRMergeCycleTimeMin: number;
      /**
       * PR Raised to Merged Max
       * @visibility frontend
       */
      PRMergeCycleTimeMax: number;
    };
  }

