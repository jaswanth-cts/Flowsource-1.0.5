import React, { useState, useEffect } from 'react';
import { Grid  } from '@material-ui/core';
import cssClasses from './InfraProvisionCss';
import { configApiRef, useApi, identityApiRef, fetchApiRef } from '@backstage/core-plugin-api';

import {useLocation , Link, useNavigate } from 'react-router-dom';
import InfraProvision from './InfraProvision';

import {
  Page,
  Header,
  Content,
} from '@backstage/core-components';
import { COMPONENT_PAGE_HEADER_CONFIG } from '../../constants';
import log from 'loglevel';

const ConfigurePage = (props) => {
  const location = useLocation();
  const { catId } = location?.state;
  const apiConfig = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const backendUrl = apiConfig.getString('backend.baseUrl');
  const navigate = useNavigate();
  
  const classes = cssClasses();
  const [config, setConfig] = useState('');
  const [, setShowSuccessDialog] = useState(false);
  const [disbaleSubmit] = useState(false);
  const [inputOptions, setInputOptions] = useState(null);
  const [, SetApiError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    async function initialize() {
      try {
        const authTok = await identityApi.getCredentials();
        setAuthToken(authTok.token);
      } catch (err) {
        SetApiError(err.message);
      }
    }
    initialize();
  }, []);

  useEffect(async () => {
    try{
      const resp = await fetch(backendUrl + '/api/flowsource-morpheus/can-submit-order');
      const canSubmitOrderResp = await resp.json();

      disbaleSubmit(canSubmitOrderResp.canSubmitOrder===false);
    }
    catch(err){
    }
    try {

      if( catId != null && catId !== undefined){

        const resp = await fetch(backendUrl + '/api/flowsource-morpheus/input-options?catalogId=' + catId);
        const reponse = await resp.json();

        setInputOptions(reponse.config)
        setConfig(JSON.stringify(reponse.config.inputOption, null, " "));

      }
    } catch (err) {
      SetApiError(err.message);
    }

  },[authToken])

  
  const componentRouthPath = 'flowsource-infra-provision';


  const  handleProvisioning = async () => {
    try {
      setIsLoading(true);
      let userConfigObj = JSON.parse(config);
  
      let orderItemConfig = {
        order: {
          iteminputOptionConfig: {
            config: userConfigObj
          },
          catalogId: catId,
          catalogName: inputOptions.name
        }
      };
      
      const response = await fetch(backendUrl + '/api/flowsource-morpheus/order-item', {
        method: 'post',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(orderItemConfig)
      });
  
      if(response.ok) {
        // Show success message
        setShowSuccessDialog(true);
        navigate('/flowsource-infra-provision');

    
      } else {
        setShowSuccessDialog(false);
        alert('Provisioning failed. Please try again.');
      }
    } catch(err) {
      alert(`Error: ${err.message}`);
    }finally {
      setIsLoading(false); 
    }
  };


  return (
    <Page>
      <Header title='Infra Provision' />
      <Content>

      <Grid container spacing={1}>
        <Grid item xs={10}>
            <h2 className={`${classes.title}`} >{COMPONENT_PAGE_HEADER_CONFIG}</h2>
        </Grid>
      </Grid>
    <div>
      



      <div className={classes.layout}>
        <div className={classes.heading}>Configuration Details {(inputOptions!= undefined)? " for " + inputOptions.name:""}</div>
        <textarea className={classes.textarea}
          value={config}
          onChange={(e) => setConfig(e.target.value)}
        />

        <div className={`row ${classes.buttonsection}`}>  {/* Add 'row' class for Bootstrap */}
          <div className="col-md-12">  {/* Add columns for button placement */}
            <Link to={`../cards`}>
              <button type="button" className={`btn btn-secondary ${classes.cancel}`} >
                Cancel
              </button>
            </Link>
            <button type="button" disabled={disbaleSubmit} className={`btn btn-primary ${classes.startbutton}`} onClick={handleProvisioning}>
            {isLoading ? 'Provisioning...' : 'Start Provisioning'}
            </button>
          </div>
        </div>
    
      </div>
    </div>
    </Content>
    </Page>
  );
};
export default ConfigurePage;