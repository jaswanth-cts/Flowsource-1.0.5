import React, { useState } from 'react';

import arrow from '../../Icons/arrow.png';

import AccessibilityTwo from './Accessibility/AccessibilityTwo';
import ClientSidePerformanceAccessibilityPage from './ClientSidePerformanceAccessibilityPage';
import AccessibilityOne from './Accessibility/AccessibilityOne';
import CSPDetailsOne from './ClientSidePerformance/CSPDetailsOne/CSPDetailsOne.js';
import CSPDetailsTwo from './ClientSidePerformance/CSPDetailsTwo/CSPDetailsTwo.js';
import cssClasses from './ClientSidePerformanceAccessibilityCSS.js';

const ClientSidePerformanceAccessibilityMain = () => {

  const [activeTab, setActiveTab] = useState('CSPMainPage');
  const [historyTestExecution, setHistoryTestExecution] = useState(1);
  const [testCaseId, setTestCaseId] = useState('');
  const [testCaseName, setTestCaseName] = useState('');
  const [testSuiteName, setTestSuiteName] = useState('');
  const [tabDetails, setTabDetails] = useState({ });
  const [activeButton, setActiveButton] = useState('lastExecution');

  return (
    <div>
      <RenderCSPATabs tabNumber={historyTestExecution} activeButton={activeButton} 
        setActiveButton={setActiveButton} tabDetails={tabDetails} 
        historyTestExecution={historyTestExecution} setHistoryTestExecution={setHistoryTestExecution} 
        activeTab={activeTab} setActiveTab={setActiveTab}
      />
      
      {activeTab === 'CSPMainPage' && < ClientSidePerformanceAccessibilityPage setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} setTestCaseId={setTestCaseId}  activeButton={activeButton} />}
      
      {activeTab === 'accessibilityone' && <AccessibilityOne setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} setTestCaseId={setTestCaseId} testCaseName={testCaseName} setTestCaseName={setTestCaseName} setTestSuiteName={setTestSuiteName}/>}
      {activeTab === 'accessibilitytwo' && <AccessibilityTwo setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} testCaseName={testCaseName} testSuiteName={testSuiteName}  />}

      {activeTab === 'CSPPageOne' && <CSPDetailsOne setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} setTestCaseName={setTestCaseName}/>}
      {activeTab === 'CSPPageTwo' && <CSPDetailsTwo setActiveTab={setActiveTab} setHistoryTestExecution={setHistoryTestExecution} tabDetails={tabDetails} setTabDetails={setTabDetails} testCaseId={testCaseId} testCaseName={testCaseName}/>}
    </div>
  );
};


function RenderCSPATabs({ tabNumber, activeButton, setActiveButton, tabDetails, historyTestExecution, setHistoryTestExecution, activeTab, setActiveTab}) {

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
        <div className={`row justify-content-start mt-1 ms-1 pb-0`}>
          <div className={`col-12 mt-1 d-flex justify-content-end ${classes.tabDiv1}`}>
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
    //display two tab
    if (tabNumber == 2) {
      return (
        <div className="row justify-content-between align-items-center mt-0 ms-1 pb-0">
          <div className="col d-flex align-items-center">
            <div className={`${classes.tab2Div1}`}>
              <RenderCSPAMainTab tabNumber={1} activeTab={activeTab} tabDetails={tabDetails} />
            </div>
            <div className={`${classes.tab2Div2}`} >
              <RenderArrow />
            </div>
            <RenderCSPATabOne tabNumber={2} tabDetails={tabDetails} />
          </div>
          <div className={`col-auto ${classes.tab2Div3}`}>
            <RenderBackButton historyTestExecution={historyTestExecution} setHistoryTestExecution={setHistoryTestExecution}
              setActiveTab={setActiveTab} tabDetails={tabDetails}
            />
          </div>
        </div>
      );
    }
    //display three tab
    if (tabNumber == 3) {
      return (
        <div className="row justify-content-between align-items-center mt-0 ms-1 pb-0">
          <div className="col d-flex align-items-center">
            <div className={`${classes.tab3Div1}`}>
              <RenderCSPAMainTab tabNumber={1} activeTab={activeTab} tabDetails={tabDetails} />
            </div>
            <div className={`${classes.tab3Div2}`} >
              <RenderArrow />
            </div>
            <div className={`${classes.tab3Div3}`} >
              <RenderCSPATabOne tabNumber={2} tabDetails={tabDetails} />
            </div>
            <div className={`${classes.tab3Div3}`} >
              <RenderArrow />
            </div>
            <RenderCSPATabTwo tabNumber={3} tabDetails={tabDetails} />
          </div>
          <div className={`col-auto ${classes.tab3Div4}`}>
            <RenderBackButton historyTestExecution={historyTestExecution} setHistoryTestExecution={setHistoryTestExecution}
              setActiveTab={setActiveTab} tabDetails={tabDetails}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <>
      { renderTabs() } 
    </>
  );
}


function RenderCSPAMainTab({ tabNumber, activeTab, tabDetails }) {
  
  const classes = cssClasses();

  if (tabNumber == 1) {
    return (
      <div className={`col-3 sm-1`}>
        <div
          className={`${classes.tab} ${activeTab === 'CSPMainPage'
            ? `${classes.activeTab}`
            : `${classes.disableTab}`
            } ${classes.active}`}
        >
          <div className={`mt-3 ${classes.activeTab}`}>
            {tabDetails.tab1}
          </div>
        </div>
      </div>
    );
  }
}

function RenderCSPATabOne({ tabNumber, tabDetails }) {

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
}

function RenderCSPATabTwo({ tabNumber, tabDetails }) {
  
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
}

function RenderBackButton({ historyTestExecution, setHistoryTestExecution, setActiveTab, tabDetails }) {

  const classes = cssClasses();

  return (
    <div className={`col-3 sm-1 text-end ${classes.cspamDiv1}`} >
    <a href='#' onClick={() => {
      setActiveTab(historyTestExecution[0]);
      if (historyTestExecution == 1) 
      {
        setActiveTab('CSPMainPage');
      } 
      else if (historyTestExecution == 2) 
      {
        setHistoryTestExecution(historyTestExecution - 1);

        setActiveTab('CSPMainPage');
      } 
      else if (historyTestExecution == 3)
      {
        setHistoryTestExecution(historyTestExecution - 1);
        
        if(tabDetails.tab1 === 'Client Side Performance') {
          setActiveTab('CSPPageOne');
        } else if (tabDetails.tab1 === 'Accessibility') {
          setActiveTab('accessibilityone');
        }
      }
    }}><pre className={`${classes.backbutton}`} >&lt; BACK</pre>
    </a>
  </div>
  );
}


export default ClientSidePerformanceAccessibilityMain;
