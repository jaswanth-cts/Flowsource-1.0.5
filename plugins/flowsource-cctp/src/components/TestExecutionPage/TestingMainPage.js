import React, { useState, useEffect } from 'react';

import cssClasses from './TestingMainPageCSS.js';
import TestSuitePlan from './TestResult/TestSuitePlan.js';
import TestPlanParentPage from './TestPlan/TestPlanParentPage.js';
import QueuePage from './Queue/QueuePage.js';

import TestSuiteProjectMain from './TestSuite/TestSuiteProjectMain.js';



const TestingMainPage = () => {
  const classes = cssClasses();

  const [activeTab, setActiveTab] = useState('testplan');

  useEffect(async () => {
  }, []);

  return (
    <div className={`w-100 card mt-2`}>
      <div className={`${classes.mainPageTab}`}>
        <div
          className={`${classes.tab} ${activeTab === 'testplan'
            ? `${classes.activeTab} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } ${classes.active}`}
          onClick={() => setActiveTab('testplan')}
        >
          TEST PLAN
        </div>
        <div>
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'project' || activeTab === 'testSuiteCreate'
            ? `${classes.active} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } `}
          onClick={() => setActiveTab('project')}
        >
          TEST SUITES
        </div>
        <div>
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'queue'
            ? `${classes.active} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } `}
          onClick={() => setActiveTab('queue')}
        >
          QUEUE
        </div>
        <div>
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'report'
            ? `${classes.active} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } `}
          onClick={() => setActiveTab('report')}
        >
          REPORTS
        </div>
      </div>
      <hr />

      {activeTab === 'testplan' && <TestPlanParentPage />}
      {activeTab === 'report' && <TestSuitePlan />}
      {activeTab === 'queue' && <QueuePage />}
      {activeTab === 'project' && <TestSuiteProjectMain />}
    </div>
  );
};
export default TestingMainPage;
