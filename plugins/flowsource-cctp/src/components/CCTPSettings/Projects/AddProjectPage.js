import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from './ProjectSettingsPageCSS.js';

import log from 'loglevel';

const AddProjectPage = (props) => {
  const classes = cssClasses();
  const [selectedType, setSelectedType] = useState('TEXT');
  const [inputFields, setInputFields] = useState([{ id: 1, value: '' }]);
  const [nameExists, setNameExists] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [applicationData, setApplicationData] = useState([]);
  const [isApiError, setIsApiError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [arctypeData, setArctypeData] = useState(["Generic", "SFDC", "Guidewire", "SAP"]);
  const [formData, setFormData] = useState({
    id: '',
    projectName: '',
    applicationName: '',
    archeType: ''
  });
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
  const handleButtonClick = (step) => {
    setSelectedButton(step);
    setInputFields([{ id: 1, value: '' }]);
  };
  const handleNameFieldChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    await checkIfProjectNameAlreadyTaken(value);
  };
  const handleTypeChange = (e) => {
    setInputFields([{ id: 1, value: '' }]);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (formData.projectName === '') {
        setErrorMessage("Validation Error: Project Name is required.");
        setIsApiError(true);
        return;
      }
      if (nameExists) {
        setErrorMessage("Validation Error: Project Name already exists.");
        setIsApiError(true);
        return;
      }
      setProcessLoading(true);
      const requestBody = {
        type: "jenkins",
        version: "2.0",
        platform: "linux",
        name: formData.projectName,
        applicationName: formData.applicationName,
        archetype: formData.archeType,
        applicationId: formData.id,
        ci: {
          name: "jenkins",
          type: "docker",
          docker: {
            name: "jenkins"
          },
          pipeline: {
            stages: [
              {
                id: "pipeline-config",
                parallel: false,
                toolId: "pipeline-config",
                type: "config",
                data: {
                  type: "pipeline",
                  steps: []
                }
              }
            ]
          }
        }
      };
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/projects`, {
          method: props.propValues.requestType,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const payload = { "name":formData.projectName, "description":"Created by leap-workbench"}
        const dashboard_response = await fetch(`${backendBaseApiUrl}cctp-proxy/reports/dashboard/projects`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const execution_response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/execution/projects`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) { 
          throw new Error('Network response was not ok'); 
        } 
        log.info(`Project has been added successfully.`);
    } catch (error) { 
      log.error('Error deleting Project:', error);
    } finally {
      setProcessLoading(false);
    }
    props.setActiveTab('projects');
  };
  const handleCancel = () => {
    props.setActiveTab('projects');
    setInputFields([{ id: 1, value: '' }]);
  };
  useEffect(async () => {
    const app_res = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/applications`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    const res_json = await app_res.json();
    const app_data = res_json.map((appname) => { return appname.name });
    if (!app_res.ok) {
      throw new Error('Network response was not ok');
    }
    if (props.propValues.applicationName) {
      app_data.splice(app_data.indexOf(props.propValues.applicationName, 1));
      app_data.unshift(props.propValues.applicationName);
    }
    if (props.propValues.archeType) {
      const archeType = arctypeData;
      archeType.splice(app_data.indexOf(props.propValues.archeType, 1));
      archeType.unshift(props.propValues.archeType);
    }
    setApplicationData(app_data);
    const selectedRow = {
      id: props.propValues.id,
      projectName: props.propValues.projectName,
      applicationName: '',
      archeType: ''
    };
    setFormData(selectedRow);
  }, []);
  const handleApplicationChange = (e) => {
    setFormData(prevData => ({ ...prevData, applicationName: e.target.value }));
  };
  const handleArcheTypeChange = (e) => {
    setFormData(prevData => ({ ...prevData, archeType: e.target.value }));
  };
  const checkIfProjectNameAlreadyTaken = async (projectName) => {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/projects`);
      if (response.status === 200) {
        const data = await response.json();
        const allProjects = data.map((item) => item.name);
        setNameExists(allProjects.includes(projectName));
      } else if (response.status === 404) {
        setNameExists(false);
      } else {
        log.error("Unexpected response status:", response.status);
        setNameExists(false);
      }
    } catch (error) {
      log.error('Error in checkIfProjectNameAlreadyTaken function: ', error);
      setNameExists(false);
    }
  };
  return (
    <div>
      {processLoading ? (
        <div className={`App p-3 ${classes.loading}`}>
          Processing...
        </div>
      ) : (
        <div className={`w-80 mt-2 ${classes.parentDiv}`}>
          <div className={`${classes.newFrameworkTitle}`}>
            {props.propValues.title}
          </div>
          <form className={`${classes.form}`} onSubmit={(e) => handleCreate(e)}>
            <div className={`${classes.formGroup}`}>
              <label htmlFor="projectName" className={`${classes.label}`}>Name {formData.projectName === '' && <span style={{ color: 'red' }}>*</span>}</label>
              <input type="text" id="projectName" name="projectName" value={formData.projectName} className={`${classes.input}`}
                onChange={(e) => handleNameFieldChange(e)}
              />
              {nameExists && (
                <span
                  style={{
                    width: '8rem',
                    color: 'red',
                    fontSize: '0.9em',
                    marginLeft: '1rem'
                  }}
                  title="Name already exists"
                >
                  Name already exists
                </span>
              )}
            </div>
            <div className={`${classes.formGroup}`}>
              <label htmlFor="applicationName" className={`${classes.label}`}>Application</label>
              <select id="applicationName" name="applicationName" className={`${classes.dropdown1}`} value={formData.applicationName} onChange={(e) => handleApplicationChange(e)}>
                <option value="" disabled hidden></option>
                {applicationData.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className={`${classes.formGroup}`}>
              <label htmlFor="archeType" className={`${classes.label}`}>Archtype</label>
              <select id="archeType" name="archeType" className={`${classes.dropdown1}`} value={formData.archeType} onChange={(e) => handleArcheTypeChange(e)}>
                <option value="" disabled hidden></option>
                {arctypeData.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className={`${classes.addPropertybuttonContainer}`}>
              <button type="submit" className={nameExists ? classes.disableButton : classes.submitCancelButton} disabled={nameExists}>
                {props.propValues.buttonTitle}
              </button>
              <button type="button" onClick={() => handleCancel()} className={`${classes.submitCancelButton}`}>
                CANCEL
              </button>
            </div>
          </form>
          {isApiError && (
            <div className={`${classes.popUpErrorBox}`}>
              <div className={`${classes.popUpErrorBoxCard}`}>
                <div className={`card ms-2 me-2 mb-2 mt-2 w`}>
                  <div className={`card-header`}>
                    <h6>Error Occurred</h6>
                  </div>
                  <div className={`card-body`}>
                    <div className={`alert alert-danger`} role="alert">
                      {errorMessage}
                    </div>
                  </div>
                </div>
                <button className={`${classes.popUpErrorBoxButton}`} onClick={() => setIsApiError(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AddProjectPage;
