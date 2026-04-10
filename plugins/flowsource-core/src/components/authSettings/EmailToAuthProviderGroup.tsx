import React, { useState } from 'react';


import EmailToAuthProviderGroupList from './EmailToAuthProviderGroupList';
import EmailToGroupPage from './EmailToGroupPage';
const EmailToAuthProviderGroup = (_:any) => {
    const [show, setShow] = useState(true);
    return (
      <div>
        {show ? (<EmailToAuthProviderGroupList setShowList={setShow}/>) : (<EmailToGroupPage setShowList={setShow}/>)}
      </div>
    );
  
  };
  
  export default EmailToAuthProviderGroup;