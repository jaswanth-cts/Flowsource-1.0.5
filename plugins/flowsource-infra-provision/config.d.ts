export interface Config {
    morpheus: { 
         /**
         * morpheus environment
         * @visibility frontend
         */
        environment: {
            /**
             * morpheus enableServiceNowEnvMapping
             * @visibility frontend
             */
            enableServiceNowEnvMapping: boolean;
        };
    };
}