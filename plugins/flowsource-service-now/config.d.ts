export interface Config {

    serviceNow: {
        /**
         * serviceNow instance URL
         * @visibility frontend
         */
        instanceUrl: string;
        
         /**
         * serviceNow environment URL
         * @visibility frontend
         */
        environment: {
            /**
             * serviceNow agenticAIOpsLink URL
             * @visibility frontend
             */
            agenticAIOpsLink: string;
        };
    };
}