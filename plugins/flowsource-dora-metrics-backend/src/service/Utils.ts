export  function  sanitizeInputName(inputName: string): string {
    let isValid:boolean=false;
    if( inputName != null && inputName != undefined){
      if(/^[a-zA-Z0-9,._-]+$/.test(inputName)){
        isValid=true;   
      }      
    }
    if(isValid){
        return inputName;
    }else{
        throw new Error('Invalid appid');
    }
   };