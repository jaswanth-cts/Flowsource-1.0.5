import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './GeneralSettingsPageCSS.js';
import { Switch } from '@mui/material';

import log from 'loglevel';

const GeneralSettingsPage = (props) => {

  const classes = cssClasses();
  const [isEnable, setIsEnable] = useState(false);
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOpenDialog, setOpenDialog] = useState(false);

  async function handleChange() {
    await fetch(`${backendBaseApiUrl}cctp-proxy/reports/test/reports/enable/failure-analysis?isEnable=${isEnable}`, {
      method: "POST",
    });
    setOpenDialog(true);
  };

  async function fetchInitialState() {
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/reports/test/reports/enable/failure-analysis`);
      if(!response.ok) {
        // Read the error message from the response 
        const errorText = await response.text(); 
        // Format the error message 
        const formattedError = `HTTP error: status: ${response.status}, message: Error fetching Failure Cause Analysis status`; 
        // Set the error state with the formatted error message 
        setError(formattedError); 
        log.error('Error fetching Failure Cause Analysis status: API returned: ', errorText);
      } else {
        const data = await response.json();
        setIsEnable(data.enable);
      }
    } catch (error) {
       // Log the error to the logger
       log.error('Error fetching Failure Cause Analysis status:', error);
       setError(`Error fetching Failure Cause Analysis status.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialState();
  }, []);

  const handleClose = () => {
    setOpenDialog(false);
  };


  if (error) {
    return (
      <div className="card ms-2 me-2 mb-2 mt-2">
        <div className="card-header">
          <h6>Error Occured</h6>
        </div>
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }
   
  return (
    <div>
      <div className={`w-80 mt-2 ${classes.parentDiv}`} >
        {isLoading ? (
          <div className={`App p-3 ${classes.loading}`}>
            Loading...
          </div>
        ) : (
          <div>
            <div className={`${classes.newFrameworkTitle}`}>
              General Failure Cause Analysis
              <Switch sx={{
              "&.MuiSwitch-root .MuiSwitch-switchBase": {
                color: "#808080"
              }, 
              "&.MuiSwitch-root .Mui-checked": { color: "#13215E"}}}  
                checked={isEnable}
                onChange={(e) => setIsEnable(e.target.checked)}  
              />
            </div>
            <div className={`${classes.generalTabButtonContainer}`}>
              <button type="button" className={`${classes.generalTabUpdateButton}`} onClick={handleChange}>
                Update
              </button>
            </div>
          </div>
        )}
      </div>  
      {isOpenDialog && ( 
        <div className={`${classes.dialogOverlay}`}>
          <div className={`${classes.dialogBox}`}>
            <p>Failure Cause Analysis status updated.</p>
            <button
                className={`${classes.errorDialogBoxButton}`}
                onClick={handleClose}
            >
                Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralSettingsPage;
