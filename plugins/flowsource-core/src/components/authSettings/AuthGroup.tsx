import React, { useState } from 'react';
import GroupMappingPage from './GroupMappingPage';
import GroupMappingList from './GroupMappingList';
const AuthGroup = (_:any) => {
    const [show, setShow] = useState(true);
    return (
      <div>
        {show ? (<GroupMappingList setShowList={setShow}/>) : (<GroupMappingPage setShowList={setShow}/>)}
       
      </div>
    );
  
  };
  
  export default AuthGroup;