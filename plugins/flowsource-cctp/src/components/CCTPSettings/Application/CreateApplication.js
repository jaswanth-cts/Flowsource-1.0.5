import React, { useState } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './ApplicationPageCss';

import log from 'loglevel';

const CreateApplication = (props) => {
    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    // Used to show API error message.
    const [isApiError, setIsApiError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [navigateBack, setNavigateBack] = useState(false);

    const [nameExists, setNameExists] = useState(false);
    const [isValidationError, setIsValidationError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [nameError, setNameError] = useState(false);

    async function checkIfApplicationNameAlreadyTaken(event) {
        try {
            const applicationName = event.target.value.trim();
            if (applicationName.length < 3) {
                setNameError(true);
                setNameExists(false);
                return;
            } else {
                setNameError(false);
            }

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/applications/search/?name=${applicationName}`);

            if (response.status === 200) {
                setNameExists(true);
            } else if (response.status === 404) {
                setNameExists(false);
            } else {
                log.error("Unexpected response status:", response.status);
                setNameExists(false);
            }
        } catch (error) {
            log.info('Error in checkIfApplicationNameAlreadyTaken function: ', error);
        }
    }

    function handleDescriptionChange(event) {
        const applicationDescription = event.target.value.trim();
        if (applicationDescription.length < 3) {
            setDescriptionError(true);
        } else {
            setDescriptionError(false);
        }
    }

    async function handleCreateApplicationFormSubmit(event) {
        try {
            event.preventDefault();

            const applicationName = event.target.applicationName.value.trim();
            const applicationDescription = event.target.applicationDescription.value.trim();

            if (applicationName === '') {
                setErrorMessage("Validation Error: Application Name is required. Field can't be empty.");
                setIsValidationError(true);
                return;
            }

            if (applicationDescription === '') {
                setErrorMessage("Validation Error: Application Description is required. Field can't be empty.");
                setIsValidationError(true);
                return;
            }

            const createPayload = {
                name: applicationName,
                description: applicationDescription,
            };

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/workbench/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createPayload)
            });

            if (response.ok) {
                props.setActiveTab('applications');
            } else {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
                const formattedError = `HTTP Error: Status: ${response.status}, Message: ${apiErrorText}`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }
        } catch (error) {
            log.info('Error in handleCreateApplicationFormSubmit function: ', error);
            setErrorMessage('Application Error: Error Creating Application.');
            setNavigateBack(true);
            setIsApiError(true);
        }
    }

    function handleCancelButtonClick() {
        props.setActiveTab('applications');
    }

    return (
        <div>
            <div className={`${classes.createApplicationHeading}`}>
                Create Application
            </div>
            <form className={`${classes.formSection}`} onSubmit={handleCreateApplicationFormSubmit}>
                {/* Name */}
                <div className={`${classes.applicationNameSection}`}>
                    <div className={`${classes.applicationFormInputSection}`}>
                        <label htmlFor='name' className={`${classes.applicationNameLabel}`}>
                            Name
                            <span className={`${classes.nameAstrix}`}>*</span>
                        </label>
                        <input id="applicationName" type="text" name="applicationName" className={`${classes.applicationNameInput}`}
                            placeholder=''
                            onChange={checkIfApplicationNameAlreadyTaken} />
                    </div>
                    {nameError && (
                        <span className={`${classes.nameErrorCss}`} title="Name must be at least 3 characters">
                            Name must be at least 3 characters
                        </span>
                    )}
                    {nameExists && (
                        <span className={`${classes.nameErrorCssname}`} title="Name already exists">
                            Name already exists
                        </span>
                    )}
                </div>
                {/* Application description */}
                <div className={`${classes.applicationNameSection}`}>
                    <div className={`${classes.applicationFormInputSection}`}>
                        <label htmlFor='description' className={`${classes.applicationNameLabel}`}>
                            Description
                            <span className={`${classes.nameAstrix}`}>*</span>
                        </label>
                        <input id="applicationDescription" type="text" name="applicationDescription" className={`${classes.applicationNameInput}`}
                            placeholder=''
                            onChange={handleDescriptionChange} />
                    </div>
                    {descriptionError && (
                        <span className={`${classes.nameErrorCssdesc}`} title="Description must be at least 3 characters">
                            Description must be at least 3 characters
                        </span>
                    )}
                </div>

                <div className={`${classes.applicationFormButtonSection}`} >
                    <button type="submit" className={`${nameExists === true || descriptionError === true || nameError === true ? `${classes.disableButton}` : `${classes.createApplicationButton}`}`} disabled={nameExists || descriptionError || nameError}>
                        CREATE
                    </button>
                    <button type="button" className={`${classes.cancelButton}`} onClick={handleCancelButtonClick}>
                        CANCEL
                    </button>
                </div>
            </form>
            {(isApiError || isValidationError) && (
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
                        <button className={`${classes.popUpErrorBoxButton}`}
                            onClick={() => {
                                setIsApiError(false);
                                setIsValidationError(false);
                                if (navigateBack) {
                                    props.setActiveTab('applications');
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

export default CreateApplication;