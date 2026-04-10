import React, { useState } from 'react';
import cssClasses from '../TestingMainPageCSS.js';
import TestSuitePage from './TestSuitePage.js';
import TestCasePage from './TestCasePage.js';
import TestCaseStepsPage from './TestCaseStepsPage.js';
import FailedTestCaseStepsPage from './FailedTestCaseStepsPage.js';
import FailureCauseAnalysisPage from './FailureCauseAnalysis/FailureCauseAnalysisPage.js';
import arrow from '../../Icons/arrow.png';
import FailurePredictionPage from './FailureCauseAnalysis/FailurePredictionPage.js';

const TestingExecutionMainPage = () => {

  const [activeTab, setActiveTab] = useState('testexecution');
  const [historyTestExecution, setHistoryTestExecution] = useState(1);
  const [testCaseId, setTestCaseId] = useState('');
  const [testCaseName, setTestCaseName] = useState('');
  const [testExecutionId, setTestExecutionId] = useState('');
  const [failureId, setFailureId] = useState('');
  const [tagName, setTagName] = useState('');
  const [tabDetails, setTabDetails] = useState({
    "tab1": "Execution Summary"
  });
  const [activeButton, setActiveButton] = useState('lastExecution');
  const [failedTestCaseLogs, setFailedTestCaseLogs] = useState('');
  const [activeTabDetails, setActiveTabDetails] = useState('');
  const [iconClicked, setIconClicked] = useState('');

  return (
    <div>
      <RenderTestResultDropDownTab tabNumber={historyTestExecution} setHistoryTestExecution={setHistoryTestExecution}
        activeButton={activeButton} setActiveButton={setActiveButton} 
        activeTab={activeTab} setActiveTab={setActiveTab}
        activeTabDetails={activeTabDetails} setActiveTabDetails={setActiveTabDetails}
        tabDetails={tabDetails} iconClicked={iconClicked} 
      />
      
      {activeTab === 'testexecution' && < TestSuitePage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} setTestCaseId={setTestCaseId} setTestExecutionId={setTestExecutionId} setActiveTabDetails={setActiveTabDetails} activeButton={activeButton} setIconClicked={setIconClicked} />}
      {activeTab === 'testcase' && <TestCasePage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} setTestCaseName={setTestCaseName} />}
      {activeTab === 'teststeps' && <TestCaseStepsPage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} testCaseName={testCaseName} setFailedTestCaseLogs={setFailedTestCaseLogs} />}
      {activeTab === 'failedteststep' && <FailedTestCaseStepsPage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} testCaseName={testCaseName} failedTestCaseLogs={failedTestCaseLogs} />}
      {activeTab === 'failureCauseAnalysis' && <FailureCauseAnalysisPage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testExecutionId={testExecutionId} setFailureId={setFailureId} setTagName={setTagName} />}
      {activeTab === 'failurePrediction' && <FailurePredictionPage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} failureId={failureId} tagName={tagName} />}
    </div>
  );
};



function RenderTestResultDropDownTab({  tabNumber, setHistoryTestExecution,
  activeButton, setActiveButton,
  activeTab, setActiveTab,
  activeTabDetails, setActiveTabDetails,
  tabDetails, iconClicked  }) {

  const classes = cssClasses();

  const getButtonStyles = (buttonState, activeButton) => ({
    backgroundColor: activeButton === buttonState ? '#000048' : 'transparent',
    color: activeButton === buttonState ? 'white' : '#000048',
    border: `1px solid #000048`,
    height: '28px',
    borderRadius: '0', // Ensure edges are sharp
  });

  const handleButtonClick = (activeButton) => {
    setActiveButton(activeButton);
  };

  function renderTabs() {
    if (tabNumber == 1) {
      return (
        <div className={`row justify-content-start mt-1 ms-1`}>
          <RenderTestExecution tabNumber={1} activeTab={activeTab} 
            activeTabDetails={activeTabDetails} tabDetails={tabDetails} 
          />
          <div className={`col-9 mt-2 d-flex justify-content-end`} style={{ marginLeft: '-1rem' }}>
            <div>
              <button
                className={`${classes.buttonStyle}`}
                style={getButtonStyles('lastExecution', activeButton)}
                onClick={() => handleButtonClick('lastExecution')}
              >
                Last Execution
              </button>
              <button
                className={`${classes.buttonStyle}`}
                style={getButtonStyles('AllExecution', activeButton)}
                onClick={() => handleButtonClick('AllExecution')}
              >
                All Executions
              </button>
            </div>
          </div>
        </div>
      );
    }
    //display second tab
    if (tabNumber == 2) {
      return (
        <div className="row justify-content-between align-items-center mt-0 ms-1 pb-2">
          <div className="col d-flex align-items-center">
            <div style={{ marginTop: '-1rem', marginRight: '10px', color: '#13215E' }}>
              <RenderTestExecution tabNumber={1} activeTab={activeTab} 
                activeTabDetails={activeTabDetails} tabDetails={tabDetails} 
              />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderArrow />
            </div>
            <RenderTestCase tabNumber={2} tabDetails={tabDetails}/>
          </div>
          <div className="col-auto" style={{ marginRight: '1rem', marginTop: '0.7rem' }}>
            <RenderBackButton historyTestExecution={tabNumber} setHistoryTestExecution={setHistoryTestExecution} 
              iconClicked={iconClicked} setActiveTab={setActiveTab} 
              setActiveTabDetails={setActiveTabDetails} tabDetails={tabDetails}
            />
          </div>
        </div>
      );
    }
    //display third tab
    if (tabNumber == 3) {
      return (
        <div className="row justify-content-between align-items-center mt-0 ms-1 pb-2">
          <div className="col d-flex align-items-center">
            <div style={{ marginTop: '-1rem', marginRight: '10px' }}>
              <RenderTestExecution tabNumber={1} activeTab={activeTab} 
                activeTabDetails={activeTabDetails} tabDetails={tabDetails} 
              />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderArrow />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderTestCase tabNumber={2} tabDetails={tabDetails} />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderArrow />
            </div>
            <RenderTestSteps tabNumber={3} tabDetails={tabDetails} />
          </div>
          <div className="col-auto" style={{ marginRight: '1rem', marginTop: '0.7rem' }}>
            <RenderBackButton historyTestExecution={tabNumber} setHistoryTestExecution={setHistoryTestExecution} 
              iconClicked={iconClicked} setActiveTab={setActiveTab} 
              setActiveTabDetails={setActiveTabDetails} tabDetails={tabDetails}
            />
          </div>
        </div>
      );
    }
    //display fourth tab
    if (tabNumber == 4) {
      return (
        <div className="row justify-content-between align-items-center mt-0 ms-1 pb-2">
          <div className="col d-flex align-items-center">
            <div style={{ marginTop: '-1rem', marginRight: '10px' }}>
              <RenderTestExecution tabNumber={1} activeTab={activeTab} 
                activeTabDetails={activeTabDetails} tabDetails={tabDetails} 
              />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderArrow />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderTestCase tabNumber={2} tabDetails={tabDetails}/>
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderArrow />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderTestSteps tabNumber={3} tabDetails={tabDetails} />
            </div>
            <div style={{ marginRight: '10px' }} >
              <RenderArrow />
            </div>
            <RenderFailedTestSteps tabNumber={4} tabDetails={tabDetails} />
          </div>
          <div className="col-auto" style={{ marginRight: '1rem', marginTop: '0.7rem' }}>
            <RenderBackButton historyTestExecution={tabNumber} setHistoryTestExecution={setHistoryTestExecution} 
              iconClicked={iconClicked} setActiveTab={setActiveTab} 
              setActiveTabDetails={setActiveTabDetails} tabDetails={tabDetails}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <>
      { renderTabs() }
    </>
  );
};

function RenderTestExecution({ tabNumber, activeTab, activeTabDetails, tabDetails }) {
  
  const classes = cssClasses();

  if (tabNumber == 1) {
    return (
      <div className={`col-3 sm-1`}>
        <div
          className={`${classes.tab} ${activeTab === 'testexecution'
            ? `${classes.activeTab}`
            : `${classes.disableTab}`
            } ${classes.active}`}
        >
          <div className={`mt-3 ${classes.activeTab}`}>
            {activeTabDetails === 'Failure Cause Analysis' ? 'Failure Cause Analysis' : (
              tabDetails.tab1
            )}
          </div>
        </div>
      </div>
    );
  }
}

function RenderArrow() {
  return (
    <div className={`col-auto`} >
      <div>      <img
        src={arrow}
        alt="Arrow Icon"
        className={`float-end`}
      /></div>
    </div>
  );
};

function RenderTestCase({ tabNumber, tabDetails }) {

  const classes = cssClasses();

  if (tabNumber == 2) {
    return (
      <div className={`col-2 sm-1`}>
        <div
          className={`${classes.tab} ${classes.activeTab}`}
        >
          {tabDetails.tab2}
        </div>
      </div>
    );
  }
};

function RenderTestSteps({ tabNumber, tabDetails }) {

  const classes = cssClasses();

  if (tabNumber == 3) {
    return (
      <div className={`col-1 sm-1`}>
        <div
          className={`${classes.tab} ${classes.activeTab}`}
        >
          {tabDetails.tab3}
        </div>
      </div>

    );
  }
};

function RenderFailedTestSteps({ tabNumber, tabDetails }) {

  const classes = cssClasses();

  if (tabNumber == 4) {
    return (
      <div className={`col-1 sm-1`}>
        <div
          className={`${classes.tab} ${classes.activeTab}`}
        >
          {tabDetails.tab4}
        </div>
      </div>

    );
  }
}


function RenderBackButton({ historyTestExecution, setHistoryTestExecution, iconClicked, 
  setActiveTab, setActiveTabDetails, tabDetails }) {

  const classes = cssClasses();

  function backButton() {
    if (iconClicked === "buttonForTestExecution") {
      backButtonForTestExecution();
    } else {
      backButtonForFailureCauseAnalysis();
    }
  }

  function backButtonForTestExecution() {
    setActiveTab(historyTestExecution[0]);
    if (historyTestExecution == 1) {
      setActiveTab('testexecution');
    } else if (historyTestExecution == 2) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('testexecution');
    } else if (historyTestExecution == 3) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('testcase');
    } else if (historyTestExecution == 4) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('teststeps');
    }
  }

  function backButtonForFailureCauseAnalysis() {
    setActiveTab(historyTestExecution[0]);
    if (historyTestExecution == 1) {
      setActiveTab('testexecution');
    } else if (historyTestExecution == 2) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('testexecution');
      setActiveTabDetails(tabDetails.tab1);
    } else if (historyTestExecution == 3) {
      setHistoryTestExecution(historyTestExecution - 1);
      setActiveTab('failureCauseAnalysis');
    }
  }

  return (
    <div className={`col-3 sm-1 text-end`} style={{ float: "right" }} >
      <a href='#' onClick={() => backButton()}>
        <pre className={classes.backbutton} style={{ float: "right", fontSize: "12px" }}>&lt; BACK</pre>
      </a>
    </div>
  );
};
export default TestingExecutionMainPage;
