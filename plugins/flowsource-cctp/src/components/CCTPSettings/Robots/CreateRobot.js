import React, { useState } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './RobotsMainPageCss';

import log from 'loglevel';

const CreateRobot = (props) => {

    const classes = cssClasses();
    
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

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

    async function createRobotPropertiesFromApi(robotId) {
        try
        {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/${robotId}/token`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({})
            });

            if (response.ok) 
            {
                const data = await response.json();

                if(data !== null && data !== undefined) 
                {
                    if(data.id !== null && data.id !== undefined && data.id.length > 0) 
                    {
                        //If the Robot properties are created successfully, then navigate to the Robots Main page.             
                        props.setActiveTab('robots');
                    }
                    else
                    {
                        log.info('Error: Robot Token is null or undefined.');   
                        
                        const formattedError = `HTTP Error: Status: ${response.status}, Message: Robot Token is NULL.`;
                        setErrorMessage(formattedError);
                        setNavigateBack(true);
                        setIsApiError(true);
                    }
                }
                else 
                {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);   
                    
                    const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Creating Robot Properties.`;
                    setErrorMessage(formattedError);
                    setNavigateBack(true);
                    setIsApiError(true);
                }
            }
            else
            {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
        
                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Creating Robot Properties.`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }

        } catch(error) {
            log.info('Error in createRobotPropertiesFromApi function: ', error);
            
            setErrorMessage('Application Error: Error Creating Robot Properties.');
            setNavigateBack(true);
            setIsApiError(true);
        }
    }

    async function handleCreateRobotFormSubmit(event) {
        try
        {
            event.preventDefault();

            const robotName = event.target.robotName.value;
            
            if(robotName === '') {
                setErrorMessage("Validation Error: Robot Name is required. Field can't be empty.");
                setIsApiError(true); 
                return;
            }

            const createPayload = {
                name: robotName,
                status: 'offline',
                rating: 0,
                config: '', 
                properties: {}
            };

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(createPayload)
            });

            if (response.ok) 
            {
                //Need to create ROBOT PROPERTIES for the newly created robot.
                const data = await response.json();

                if(data !== null && data !== undefined) 
                {
                    const robotId = data.id;

                    if(robotId !== null && robotId !== undefined && robotId.length > 0) 
                    {
                        //If the Robot properties are created successfully, then navigate to the Robots Main page.
                        createRobotPropertiesFromApi(robotId);
                    }
                    else
                    {
                        log.info('Error: Robot ID is null or undefined.');   
                        
                        const formattedError = `HTTP Error: Status: ${response.status}, Message: Robot ID is NULL.`;
                        setErrorMessage(formattedError);
                        setNavigateBack(true);
                        setIsApiError(true);
                    }
                }
                else
                {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);   
                    
                    const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Creating Robot.`;
                    setErrorMessage(formattedError);
                    setNavigateBack(true);
                    setIsApiError(true);
                }
            }
            else
            {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
        
                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Creating Robot.`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }
        } catch (error) {
            log.info('Error in handleCreateRobotFormSubmit function: ', error);
            
            setErrorMessage('Application Error: Error Creating Robot.');
            setNavigateBack(true);
            setIsApiError(true);
        }
    }

    function handleCancelButtonClick() {
        props.setActiveTab('robots');
    }

    function getCreateButtonClass() {
        if(nameExists === true) {
            return `${classes.disableButton}`;
        }
        else {
            return `${classes.createRobotButton}`;
        }
    }

    return(
        <div>
            <div className={`${classes.createRobotHeading}`}>
                Create Robot
            </div>
            <form className={`${classes.formSection}`} onSubmit={handleCreateRobotFormSubmit}>
                <div className={`${classes.robotNameSection}`}>
                    <div className={`${classes.robotFormInputSection}`}>
                        <label htmlFor='name' className={`${classes.robotNameLabel}`}>
                            Name
                            <span className={`${classes.nameAstrix}`}>*</span>
                        </label>
                        <input id="robotName" type="text" name="robotName" className={`${classes.robotNameInput}`}
                            placeholder='Robot Name'
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
                        placeholder='Offline' />
                </div>
                <div className={`${classes.robotFormButtonSection}`}>
                    <button type="submit" 
                        className={getCreateButtonClass()}
                        disabled={nameExists}
                    >
                        CREATE
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

export default CreateRobot;