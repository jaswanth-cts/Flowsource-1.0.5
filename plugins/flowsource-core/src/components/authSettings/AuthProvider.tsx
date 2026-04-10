import React, { useState } from 'react';
import AuthProvderList from './AuthProviderList';
import AuthProviderPage from './AuthProviderPage';
const AuthProvider = (_:any) => {
    const [show, setShow] = useState(true);
    return (
      <div>
        {show ? (<AuthProvderList setShowList={setShow}/>) : (<AuthProviderPage setShowList={setShow}/>)}
      </div>
    );
  
  };
  
  export default AuthProvider;