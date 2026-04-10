export const sanitizeInputName = (inputName, includeAdditionChars) => {

  if( inputName != null && inputName != undefined)
  {  
    let whitelist = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-,_ .';
    
    if(includeAdditionChars != null && includeAdditionChars !== undefined && includeAdditionChars.length > 0){
      whitelist = whitelist + includeAdditionChars
    }

    let sanitized = '';
    for (const char of inputName) {
      if (whitelist.indexOf(char) !== -1) {
        sanitized += char;
      }
    }

    return sanitized;
  }
  else{
    return inputName;
  }
 };