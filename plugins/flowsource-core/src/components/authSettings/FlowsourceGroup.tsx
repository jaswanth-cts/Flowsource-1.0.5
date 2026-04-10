import React, { useState } from 'react';
import FlowsourceGroupPage from './FlowsourceGroupPage';
import FlowsourceGroupList from './FlowsourceGroupList';
const FlowsourceGroup = (_:any) => {
    const [show, setShow] = useState(true);
    return (
      <div>
        {show ? (<FlowsourceGroupList setShowList={setShow}/>) : (<FlowsourceGroupPage setShowList={setShow}/>)}
      </div>
    );
  
  };
  
  export default FlowsourceGroup;