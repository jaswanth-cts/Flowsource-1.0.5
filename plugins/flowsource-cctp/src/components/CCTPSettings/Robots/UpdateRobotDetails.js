import React, { useState, useEffect } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './UpdateRobotDetailsCss.js';

import dateUtils from '../../TestExecutionPage/DateUtil.js';
import xss from 'xss';

import log from 'loglevel';



const UpdateRobotDetails = (props) => {
    const classes = cssClasses();
    
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [isLoading, setLoading] = useState(true);

    const [robotDetails, setRobotDetails] = useState({});

    //Used to show API error message.
    const [isApiError, setIsApiError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [navigateBack, setNavigateBack] = useState(false);

    const [disabled] = useState(true);
    const [nameExists, setNameExists] = useState(false);
 
    async function checkIfRobotNameAlreadyTaken(event) {
        try 
        {
            const robotName = event.target.value.trim();
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/search/?name=${robotName}`);

            if (response.status === 200) {
                setNameExists(true);
            }
            else if (response.status === 404) {
                setNameExists(false);
            }
            else {
                log.error("Unexpected response status:", response.status);
                setNameExists(false);
            }
        } catch (error) {
            log.info('Error in checkIfRobotNameAlreadyTaken function: ', error);
        }
    }
 
    async function handleUpdateRobotFormSubmit(event) {
        try 
        {
            event.preventDefault();

            const updatedRobotName = event.target.robotName.value;
            
            if(updatedRobotName === '') {
                setErrorMessage("Validation Error: Robot Name is required. Field can't be empty.");
                setIsApiError(true); 
                return;
            }
            
            const createPayload = {
                name: updatedRobotName,
                id: robotDetails.id,
                status: robotDetails.status,
                rating: robotDetails.rating,
                jobId: robotDetails.jobId,
                jobName: robotDetails.jobName,
                properties: robotDetails.properties,
                createNew: robotDetails.createNew,
                createdOn: robotDetails.createdOn,
                modifiedOn: robotDetails.modifiedOn,
                lastAssignedOn: robotDetails.lastAssignedOn,
            };
            const sanitizedCreatePayload = xss(JSON.stringify(createPayload));

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                 body: sanitizedCreatePayload

            });

            if (response.ok) {
                props.setActiveTab('robots');
            }
            else 
            {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);

                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Updating Robot Data.`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }
        } catch (error) {
            log.info('Error in handleCreateRobotFormSubmit function: ', error);

            setErrorMessage('Application Error: Error Updating Robot Data.');
            setNavigateBack(true);
            setIsApiError(true);
        }
    }
 
    function handleCancelButtonClick() {
        props.setActiveTab('robots');
    }

    async function getRobotDetailsFromBackend() {
        try
        {
            const robotId = props.robotId;
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/${robotId}`);

            if (response.ok) 
            {
                const data = await response.json();

                if(data !== null && data !== undefined && Object.keys(data).length !== 0)
                {
                    setRobotDetails({
                        id: data.id,
                        name: data.name,
                        status: data.status,
                        rating: data.rating,
                        jobId: data.jobId,
                        jobName: data.jobName,
                        properties: data.properties,
                        createNew: data.createNew,
                        createdOn: data.createdOn,
                        modifiedOn: data.modifiedOn,
                        lastAssignedOn: data.lastAssignedOn,
                    });
                }
                else
                {
                    const apiErrorText = await response.text();
                    log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);

                    const formattedError = `Error: Status: ${response.status}, Message: Robot Data Unavailable.`;
                    setErrorMessage(formattedError);
                    setNavigateBack(true);
                    setIsApiError(true);
                }
            }
            else
            {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);

                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Loading Robot Data.`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }
        } catch (error) {
            log.info('Error in getRobotDetailsFromBackend function: ', error);

            setErrorMessage('Application Error: Error Loading Robot Data.');
            setNavigateBack(true);
            setIsApiError(true);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(async () => {
        await getRobotDetailsFromBackend();
    }, []);

    if (isLoading) {
        return(
          <div className={`App p-3 ${classes.isLoadingStyle}`}>
            Loading...
          </div>
        );
    }

    function getUpdateButtonStyle() {
        if(nameExists === true) {
            return `${classes.disableButton}`;
        }
        else {
            return `${classes.updateRobotButton}`;
        }
    }

    return (
        <div className={`w-100`}>
            <div className={`${classes.createRobotHeading}`}>
                Edit Robot
            </div>
            <form className={`${classes.formSection}`} onSubmit={handleUpdateRobotFormSubmit}>
                <div className={`${classes.formInputSections}`}>
                    <div className={`${classes.formRowOne}`}>
                        <div className={`${classes.robotNameSection}`}>
                            <div className={`${classes.robotFormInputSection}`}>
                                <label htmlFor='name' className={`${classes.robotNameLabel}`}>
                                    Name
                                    <span className={`${classes.nameAstrix}`}>*</span>
                                </label>
                                <input id="robotName" type="text" name="robotName" className={`${classes.robotNameInput}`}
                                    placeholder={robotDetails.name}
                                    onChange={checkIfRobotNameAlreadyTaken} />
                            </div>
                            {nameExists && (
                                <div className={`${classes.nameAlreadyTakenIcon}`} title="Name already exists">
                                    <p>Name already exists</p>
                                </div>
                            )}
                        </div>
                        <div className={`${classes.robotFormInputSection}`}>
                            <label htmlFor='name' className={`${classes.robotStatusLable}`}>
                                Status
                            </label>
                            <input disabled={disabled} id="robotStatus" type="text" name="robotStatus"
                                className={`${classes.robotStatusInput}`}
                                placeholder={robotDetails.status} />
                        </div>
                    </div>
                    <div className={`${classes.formRowTwo}`}>
                        <div className={`${classes.robotFormInputSectionTwo}`}>
                            <label htmlFor='name' className={`${classes.robotFormTwoLable}`}>
                                Created On
                            </label>
                            <input disabled={disabled} id="createdOn" type="text" name="createdOn"
                                className={`${classes.robotFormTwoInput}`}
                                placeholder={
                                    (robotDetails.createdOn === undefined || null ) ? '' : dateUtils.formatDate(robotDetails.createdOn)} />
                        </div>
                        <div className={`${classes.robotFormInputSectionTwo}`}>
                            <label htmlFor='name' className={`${classes.robotFormTwoLable}`}>
                                Job
                            </label>
                            <input disabled={disabled} id="jobName" type="text" name="jobName"
                                className={`${classes.robotFormTwoInput}`}
                                placeholder={robotDetails.jobName} />
                        </div>
                        <div className={`${classes.robotFormInputSectionTwo}`}>
                            <label htmlFor='name' className={`${classes.robotFormTwoLable}`}>
                                Last Assigned
                            </label>
                            <input disabled={disabled} id="lastAssignedOn" type="text" name="lastAssignedOn"
                                className={`${classes.robotFormTwoInput}`}
                                placeholder={
                                    (robotDetails.lastAssignedOn === undefined || null ) ? '' : dateUtils.formatDate(robotDetails.lastAssignedOn)} />
                        </div>
                    </div>
                </div>
                <div className={`${classes.robotFormButtonSection}`}>
                    <button type="submit" 
                        className={getUpdateButtonStyle()}
                        disabled={nameExists}
                    >
                        UPDATE
                    </button>
                    <button type="button" className={`${classes.cancelButton}`}
                        onClick={handleCancelButtonClick}
                    >
                        CANCEL
                    </button>
                </div>
            </form>
            { isApiError && (
                <div className={`${classes.popUpErrorBox}`}>
                    <div className={`${classes.popUpErrorBoxCard}`}>
                        <div className={`card ms-2 me-2 mb-2 mt-2 w`}>
                            <div className={`card-header`}>
                                <h6>Error Occured</h6>
                            </div>
                            <div className={`card-body`}>
                                <div className={`alert alert-danger`} role="alert">
                                    {errorMessage}
                                </div>
                            </div>
                        </div>
                        <button className={`${classes.popUpErrorBoxButton}`} 
                        onClick={() => { 
                                setIsApiError(false); 
                                if (navigateBack) { 
                                    props.setActiveTab('robots'); 
                                } 
                            }} > 
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateRobotDetails;