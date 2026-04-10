import ApiService from './ApiService';

export default class DataService extends ApiService {
    
    authencated: boolean=false;
    options: any = {};
    maxInputFeldLen: number;
    tlsRejectUnauthorized: boolean;


    constructor(hostUrl: string, options = {}, authencated:boolean=false, maxInputFldLen:number=100, tlsRejectUnauthorized:boolean) {
        super(hostUrl);
        this.options = options;
        this.authencated = authencated;
        this.maxInputFeldLen =maxInputFldLen;
        this.tlsRejectUnauthorized=tlsRejectUnauthorized;
    }
    
    isAuthencated=():boolean=>{ 
        return this.authencated;
    }
    
    listCatalog= async ()=>{ 
        return  await this.get('/api/catalog-item-types?max=500&offset=0&sort=name&direction=asc', this.options);
    }

    listInstances= async ()=>{ 
        return  await this.get('/api/instances?max=500&offset=0&showDeleted=false&sort=dateCreated&direction=desc', this.options);
    }

    getMyOrders = async (orederDetails: any) => {
        const orders: any = await this.get('/api/catalog/items?max=500&offset=0&sort=name&direction=asc', this.options);
        
        var myOrders: any[] = new Array();
        
        if (orders && orders.items) {
            // Create a map of API items for quick lookup
            const apiItemsMap = new Map();
            orders.items.forEach((item: any) => {
                apiItemsMap.set(item.id, item);
            });
    
            // Loop through DB records and find matches
            orederDetails.forEach((dbItem: any) => {
                const matchedItem = apiItemsMap.get(dbItem.id);
                if (matchedItem) {
                    myOrders.push(matchedItem);
                }
            });
        }
        
        return myOrders;
    }

    listInstanceTypes = async () => {
        return await this.get('/api/instance-types?max=500&offset=0&sort=name&direction=asc', this.options);
    }

    listActivities = async () => {
        return await this.get('/api/activity?max=250&offset=0&sort=name', this.options);
    }

    getCatalogById = async (catalogId: number) => {
        const targetUrl = '/api/catalog-item-types/' + catalogId
        return await this.get(targetUrl, this.options);
    }

    getOrderDetailById = async (orderId: string) => {
        const targetUrl = '/api/catalog/items/' + orderId
        return await this.get(targetUrl, this.options);
    }

    getInputOptionFor = async (catalogId: any) => {
        const response = await this.getCatalogById(catalogId);
        const optionTypes = response.catalogItemType.optionTypes;
        
        var inputOpt: any = {}
        optionTypes.forEach(function (opt: any) {
            //const required:any =  ". This field is " + opt.required? 'Required': 'optional'
            inputOpt[opt.fieldName] = '//add $' + opt.fieldName + ' with valid input. ' + opt.placeHolder
        });
       
        var data: any = {};
        var inputOption: any = {}
        inputOption.inputOption = inputOpt;

        data.config = inputOption;
        data.config.id = response.catalogItemType.id;
        data.config.name = response.catalogItemType.name;
        return data;
    }


    orderItem = async (userConfig: any) => {
        try {
            const catalogItem = await this.getCatalogById(userConfig.catalogId);
            const catName = catalogItem.catalogItemType.name;
    
            if (this.validateOrderItemUserInput(catalogItem, userConfig)) {
                const inputConfig = {
                    order: {
                        items: [{
                            type: { 
                                id: userConfig.catalogId,
                                name: catName 
                            },
                            config: userConfig.iteminputOptionConfig.config
                        }]
                    }
                };
                // const payload = {
                //     order: {
                //         items: [{
                //             type: {
                //                 id: userConfig.catalogId,
                //                 name: catalogItem.catalogItemType.name
                //             },
                //             config: userConfig.iteminputOptionConfig.config,
                //             // Often required fields:
                //             quantity: 1,
                //             context: "backstage-order"
                //         }]
                //     }
                // };
        
                const options = {
                    headers: {
                        ...this.options.headers,
                        'Content-Type': 'application/json'
                    },
                    agent: this.options.agent
                };
    
                const response = await this.post(
                    '/api/catalog/orders', 
                    JSON.stringify(inputConfig), 
                    options
                );
                
                return response;
            } else {
                throw new Error('Invalid input');
            }
        } catch (err: any) {
            console.error("Order submission error:", err);
            throw new Error(`Error occurred when ordering item: ${err.message}`);
        }
    }
    
    isValidField(fld: any, array: any) {
        return array.indexOf(fld) > -1;
    }
    
    isValidData(_: any) {
        //needs to discuss and implment reg validation
        return true;
    }
    
  
    validateOrderItemUserInput = (configOption: any, orderConfig: any) => {
        const inputOptionTypes = configOption.catalogItemType.optionTypes;
        const reqOptionTypes = inputOptionTypes.filter((fld: any) => fld.required);
    
        // 1. Check all required fields are present
        const inputFields = Object.keys(orderConfig.iteminputOptionConfig.config);
        const missingRequiredFields = reqOptionTypes.some(
            (opt: any) => !inputFields.includes(opt.fieldName)
        );
        
        if (missingRequiredFields) {
            console.log("Missing required fields");
            return false;
        }
    
        // 2. Check no invalid fields are present
        const validFieldNames = inputOptionTypes.map((opt: any) => opt.fieldName);
        const hasInvalidFields = inputFields.some(
            (fieldName) => !validFieldNames.includes(fieldName)
        );
        
        if (hasInvalidFields) {
            console.log("Contains invalid fields");
            return false;
        }
    
        // 3. Validate each field's content
        for (const fieldName of inputFields) {
            const fieldValue = orderConfig.iteminputOptionConfig.config[fieldName];
            
            // Check for placeholder text
            if (typeof fieldValue === 'string' && fieldValue.startsWith("//")) {
                console.log(`Field ${fieldName} contains placeholder text`);
                return false;
            }
            
            // Check max length
            if (typeof fieldValue === 'string' && fieldValue.length > this.maxInputFeldLen) {
                console.log(`Field ${fieldName} exceeds max length`);
                return false;
            }
            
            // Add any additional field-specific validation here
            if (fieldName === 'tomcatVersion' && !['8.5', '9'].includes(fieldValue)) {
                console.log(`Invalid tomcatVersion: ${fieldValue}`);
                return false;
            }
        }
    
        return true;
    }
}