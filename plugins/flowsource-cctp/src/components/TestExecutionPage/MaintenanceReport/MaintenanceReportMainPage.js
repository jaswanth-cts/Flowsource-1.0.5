import React, { useState } from 'react';
import cssClasses from './MaintenanceReportCss.js';
import MaintenanceReport from './MaintenanceReport.js';
import MaintenanceStatus from './MaintenanceStatus.js';

const MaintenanceReportMainPage = () => {

  const [activeTab, setActiveTab] = useState('maintenancereport');
  const [historyMaintenanceReport, setHistoryMaintenanceReport] = useState(1);
  const [tabDetails, setTabDetails] = useState({
    "tab1": "Maintenance Report"
  });


  return (
    <div>
      <RenderMaintenanceReportTab tabNumber={historyMaintenanceReport} tabDetails={tabDetails}
        setHistoryMaintenanceReport={setHistoryMaintenanceReport} setActiveTab={setActiveTab} 
      />
     
      {activeTab === 'maintenancereport' && (
        <MaintenanceReport
          setActiveTab={setActiveTab}
          setHistoryMaintenanceReport={setHistoryMaintenanceReport}
          tabDetails={tabDetails}
          setTabDetails={setTabDetails}
        />
      )}
      {activeTab === 'maintenancestatus' && (
        <MaintenanceStatus />
      )}

    </div>
  );
};

function RenderMaintenanceReportTab({ tabNumber, tabDetails, setHistoryMaintenanceReport, setActiveTab }) {
  
  const classes = cssClasses();
  
  if (tabNumber == 1) {
    return (
      <div>

      </div>
    );
  }
  //display two tab
  if (tabNumber == 2) {
    return (
      <div className="row justify-content-between align-items-center mt-0 ms-1 pb-2">
        <div className="col d-flex align-items-center">
          <RenderMaintenanceStatus tabNumber={2} tabDetails={tabDetails} />
        </div>
        <div className={`col-auto ${classes.mrTab2}`}>
          <RenderBackButton historyMaintenanceReport={tabNumber} 
            setHistoryMaintenanceReport={setHistoryMaintenanceReport} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }
};

function RenderMaintenanceStatus({ tabNumber, tabDetails }) {
  
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

function RenderBackButton({ historyMaintenanceReport, setHistoryMaintenanceReport, setActiveTab }) {

  const classes = cssClasses();

  return (
    <div className={`col-3 sm-1 text-end ${classes.backButtonDiv}`}  >
      <a href='#' onClick={() => {
        setActiveTab(historyMaintenanceReport[0]);
        if (historyMaintenanceReport == 1) {
          setActiveTab('maintenancereport');
        } else if (historyMaintenanceReport == 2) {
          setHistoryMaintenanceReport(historyMaintenanceReport - 1);
          setActiveTab('maintenancereport');
        }

      }}><pre className={classes.backButtonPre}>&lt; BACK</pre>
      </a>
    </div>
  );
};

export default MaintenanceReportMainPage;
