import React, { useState, useEffect } from 'react';


import TestSuiteProject from './TestSuiteProject.js';
import TestSuiteCreateUpdate from './CreateUpdateTestSuite.js';
import TestExecutionsPage from './TestExecution/TestExecutionsPage.js';
import ExecutionDetailsPage from './TestExecution/ExecutionDetailsPage.js';

const TestSuiteProjectMain = () => {

  const [activeTab, setActiveTab] = useState('testsuiteproject');
  const [historyTestExecution, setHistoryTestExecution] = useState(1);
  const [tabDetails, setTabDetails] = useState();
  const [backIconClicked, setbackIconClicked] = useState(false);

  const [projectId, setProjectId] = useState('');
  const [testSuiteId, setTestSuiteId] = useState('');
  

  function backButtonForTestSuiteExecution() {
    setActiveTab(historyTestExecution[0]);
    if (historyTestExecution == 1) {
      setActiveTab('testsuiteproject');
    } else if (historyTestExecution == 2) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('testsuiteproject');
    } else if (historyTestExecution == 3) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('testsuiteexecution');
    } 
  }

  useEffect(() => {
    backButtonForTestSuiteExecution();
  }, [backIconClicked]);

  return (
    <div>
      {activeTab === 'testsuiteproject' && <TestSuiteProject setProjectId={setProjectId} setTestSuiteId={setTestSuiteId} setActiveTab={setActiveTab} setTabDetails={setTabDetails} setHistoryTestExecution={setHistoryTestExecution} />}
      {activeTab === 'testSuiteCreate' && <TestSuiteCreateUpdate setActiveTab={setActiveTab} activeTab={activeTab} setTestSuiteId={setTestSuiteId} testSuiteId={testSuiteId}/>}
      {activeTab === 'testsuiteexecution' && <TestExecutionsPage backIconClicked={backIconClicked} setbackIconClicked={setbackIconClicked} testSuiteId={testSuiteId} setActiveTab={setActiveTab} tabDetails={tabDetails} setTabDetails={setTabDetails} setHistoryTestExecution={setHistoryTestExecution} />}
      {activeTab === 'executiondetails' && <ExecutionDetailsPage backIconClicked={backIconClicked} setbackIconClicked={setbackIconClicked} projectId={projectId} tabDetails={tabDetails} setTabDetails={setTabDetails} setHistoryTestExecution={setHistoryTestExecution} />}
    </div>
  );
};
export default TestSuiteProjectMain;
