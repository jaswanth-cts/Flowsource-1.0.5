import React, { useState, useEffect } from 'react';
import cssClasses from './CCTPsettingsPageCSS.js';

import FrameworksPage from './Frameworks/FrameworksPage.js';
import NewFrameworksPage from './Frameworks/NewFrameworkPage.js';
import RobotsMainPage from './Robots/RobotsMainPage.js';
import CreateRobot from './Robots/CreateRobot.js';
import UpdateRobotDetails from './Robots/UpdateRobotDetails.js';
import GeneralSettingsPage from './General/GeneralSettingsPage.js';
import EnvironmentsPage from './Environments/EnvironmentsPage.js';
import UpdateEnvironmentDetails from './Environments/UpdateEnvironmentDetails.js';
import CreateEnvironment from './Environments/CreateEnvironment.js';
import ApplicationsPage from './Application/ApplicationPage.js';
import CreateApplication from './Application/CreateApplication.js';
import ProjectSettingPage from './Projects/ProjectSettingsPage.js';
import AddProjectPage from './Projects/AddProjectPage.js';
import CloudSettingsMain from './CloudSettings/CloudSettingMain.js';


const CCTPSettingsPage = () => {
  const classes = cssClasses();

  const [activeTab, setActiveTab] = useState('projects');
  const [frameworkId, setFrameworkId] = useState(null);
  const [robotId, setRobotId] = useState(null);
  const [environmentId, setEnvironmentId] = useState(null);

  const [propValues, setPropValues] = useState({ title: 'CREATE PROPERTIES', buttonTitle: 'CREATE', name: '', value: '', type: '' });
  useEffect(async () => {
  }, []);

  return (
    <div className={`w-100 card mt-2`}>
      <div className={`${classes.mainPageTab}`}>
      <div
            className={`${classes.tab} ${activeTab === 'projects' || activeTab === 'addprojects'
                ? `${classes.activeTab} ${classes.activeTabUnderline}`
                : `${classes.disableTab}`
              } ${classes.active}`}
            onClick={() => setActiveTab('projects')}
          >
            PROJECTS
        </div>
        <div >
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
            className={`${classes.tab} ${activeTab === 'frameworks' || activeTab === 'newframework'
                ? `${classes.activeTab} ${classes.activeTabUnderline}`
                : `${classes.disableTab}`
              } ${classes.active}`}
            onClick={() => setActiveTab('frameworks')}
          >
            FRAMEWORKS
        </div>
        <div >
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'cloudsettings'
            ? `${classes.activeTab} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } ${classes.active}`}
          onClick={() => setActiveTab('cloudsettings')}
        >
          CLOUD SETTINGS
        </div>
        <div >
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'robots' || activeTab === 'createNewRobot' || activeTab === 'updateRobot'
            ? `${classes.activeTab} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } ${classes.active}`}
          onClick={() => setActiveTab('robots')}
        >
          ROBOTS
        </div>
        <div >
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'environments' || activeTab === 'createNewEnvironment' || activeTab === 'updateEnvironment'
            ? `${classes.activeTab} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } ${classes.active}`}
          onClick={() => setActiveTab('environments')}
        >
          ENVIRONMENTS
        </div>
        <div >
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
              className={`${classes.tab} ${activeTab === 'applications' || activeTab === 'createNewApplication' || activeTab === 'updateApplication'
                  ? `${classes.activeTab} ${classes.activeTabUnderline}`
                  : `${classes.disableTab}`
                } ${classes.active}`}
              onClick={() => setActiveTab('applications')}
            >
              APPLICATION
          </div>
          <div >
          <div className={`${classes.verticalLine}`}></div>
        </div>
        <div
          className={`${classes.tab} ${activeTab === 'general'
            ? `${classes.activeTab} ${classes.activeTabUnderline}`
            : `${classes.disableTab}`
            } ${classes.active}`}
          onClick={() => setActiveTab('general')}
        >
          GENERAL
        </div>
      </div>
      <hr />
      {activeTab === 'projects' && <ProjectSettingPage setActiveTab={setActiveTab} setPropValues={setPropValues} />}
      {activeTab === 'addproject' && <AddProjectPage setActiveTab={setActiveTab} propValues={propValues}/>}
      {activeTab === 'frameworks' && <FrameworksPage setActiveTab={setActiveTab} setFrameworkId={setFrameworkId}/>}
      {activeTab === 'newframework' && <NewFrameworksPage setActiveTab={setActiveTab} frameworkId={frameworkId}/>}
      {activeTab === 'cloudsettings' && <CloudSettingsMain setActiveTab={setActiveTab}/>}
      {activeTab === 'robots' && <RobotsMainPage setActiveTab={setActiveTab} setRobotId={setRobotId} />}
      {activeTab === 'createNewRobot' && <CreateRobot setActiveTab={setActiveTab} />}
      {activeTab === 'updateRobot' && <UpdateRobotDetails setActiveTab={setActiveTab} robotId={robotId} />}
      {activeTab === 'general' && <GeneralSettingsPage />}
      {/* Environment Tab */}
      {activeTab === 'environments' && <EnvironmentsPage setActiveTab={setActiveTab} setEnvironmentId={setEnvironmentId} />}
      {activeTab === 'createNewEnvironment' && <CreateEnvironment setActiveTab={setActiveTab} />}
      {activeTab === 'updateEnvironment' && <UpdateEnvironmentDetails setActiveTab={setActiveTab} environmentId={environmentId} />}
      {/* Application Tab */}
      {activeTab === 'applications' && <ApplicationsPage setActiveTab={setActiveTab} />}
      {activeTab === 'createNewApplication' && <CreateApplication setActiveTab={setActiveTab} />}


    </div>

  );
};
export default CCTPSettingsPage;
