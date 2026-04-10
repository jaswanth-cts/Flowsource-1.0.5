import React, { useState, useEffect, useRef } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './EnvironmentsPageCss.js';

import delete_icon_grey from '../../Icons/delete_icon_grey.png';
import xss from 'xss';

import log from 'loglevel';

const UpdateEnvironmentDetails = (props) => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
    const [isLoading, setLoading] = useState(true);
    const [environmentDetails, setEnvironmentDetails] = useState({});
    const [isApiError, setIsApiError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [navigateBack, setNavigateBack] = useState(false);
    const [selectedValues, setSelectedValues] = useState({});
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [robotData, setRobotData] = useState([]);
    const robotsRef = useRef(null);
    const dropdownRef = useRef(null);
    const [initialRobots, setInitialRobots] = useState([]);
    const [nameExists, setNameExists] = useState(false);
    const [isValidationError, setIsValidationError] = useState(false);
    useEffect(() => {
        getEnvironmentDetailsFromBackend();
        getAllRobotData();
    }, []);

    useEffect(() => {
        if (environmentDetails.robots) {
            const initialSelectedValues = {};
            environmentDetails.robots.forEach(robot => {
                initialSelectedValues[robot] = true;
            });
            setSelectedValues(initialSelectedValues);
            setInitialRobots(environmentDetails.robots);
        }
    }, [environmentDetails.robots]);

    async function checkIfEnvironmentNameAlreadyTaken(event) {
        try {
            const environmentName = event.target.value.trim();
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/infra/search/?name=${environmentName}`);

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
            log.info('Error in checkIfEnvironmentNameAlreadyTaken function: ', error);
        }
    }


    async function handleUpdateEnvironmentFormSubmit(event) {
        try {
            event.preventDefault();
            const updatedEnvironmentName = event.target.environmentName.value;
            const environmentDescription = event.target.environmentDescription.value;

            if (updatedEnvironmentName === '') {
                setErrorMessage("Validation Error: Environment Name is required. Field can't be empty.");
                setIsValidationError(true);
                return;
            }
            if (selectedType === '' && environmentDetails.type === '') {
                setErrorMessage("Validation Error: Environment Type is required. Field can't be empty.");
                setIsValidationError(true);
                return;
            }


            const selectedRobots = Object.keys(selectedValues).filter(key => selectedValues[key] && !statuses.includes(key));
            if (selectedRobots.length === 0) {
                setErrorMessage("Validation Error: At least one robot must be selected.");
                setIsValidationError(true);
                return;
            }

            const environmentId = props.environmentId;
            const addedRobots = selectedRobots.filter(robot => !initialRobots.includes(robot));
            const deletedRobots = initialRobots.filter(robot => !selectedRobots.includes(robot));

            const createPayload = {
                id: environmentId,
                name: updatedEnvironmentName,
                description: environmentDescription,
                type: selectedType,
                robots: addedRobots.length > 0 || deletedRobots.length > 0 ? selectedRobots : initialRobots
            };
            const sanitizedCreatePayload = xss(JSON.stringify(createPayload));

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/infra/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: sanitizedCreatePayload
            });

            if (response.ok) {
                props.setActiveTab('environments');
            } else {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Updating Environment Data.`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }
        } catch (error) {
            log.error('Error in handleCreateEnvironmentFormSubmit function: ', error);
            setErrorMessage('Application Error: Error Updating Environment Data.');
            setNavigateBack(true);
            setIsApiError(true);
        }
    }

    function handleCancelButtonClick() {
        props.setActiveTab('environments');
    }

    async function getEnvironmentDetailsFromBackend() {
        try {
            setLoading(true);
            const environmentId = props.environmentId;
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/infra/${environmentId}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setEnvironmentDetails({
                        name: data.name,
                        description: data.description,
                        type: data.type,
                        robots: data.robots,
                    });
                    setSelectedType(data.type);
                } else {
                    const apiErrorText = await response.text();
                    log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
                    const formattedError = `Error: Status: ${response.status}, Message: Environment Data Unavailable.`;
                    setErrorMessage(formattedError);
                    setNavigateBack(true);
                    setIsApiError(true);
                }
            } else {
                const apiErrorText = await response.text();
                log.info('Error: API returned: ' + response.status + ' - ' + apiErrorText);
                const formattedError = `HTTP Error: Status: ${response.status}, Message: Error Loading Environment Data.`;
                setErrorMessage(formattedError);
                setNavigateBack(true);
                setIsApiError(true);
            }
        } catch (error) {
            log.error('Error in getEnvironmentDetailsFromBackend function: ', error);
            setErrorMessage('Application Error: Error Loading Environment Data.');
            setNavigateBack(true);
            setIsApiError(true);
        } finally {
            setLoading(false);
        }
    }

    async function getAllRobotData() {
        try {
            setLoading(true);
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/infra/available-robots`);

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setRobotData(data);
                } else {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);
                }
            } else {
                setRobotData(data);
                log.info('Error: API returned: ' + response.status + ' - ' + response.statusText);
                const formattedError = await response.text();
                setHttpError(formattedError);
            }
        } catch (error) {
            log.error('Exception occurred in getAllRobotData function: ', error);
        } finally {
            setLoading(false);
        }
    }

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedValues((prev) => {
            const newValues = { ...prev, [name]: checked };

            // Handle parent checkbox selection
            if (robotData.some(robot => robot.status === name)) {
                robotData.filter(robot => robot.status === name).forEach(robot => {
                    newValues[robot.name] = checked;
                });
            }

            // Handle child checkbox selection
            const parentStatus = robotData.find(robot => robot.name === name)?.status;
            if (parentStatus) {
                if (!checked) {
                    newValues[parentStatus] = false;
                } else {
                    const allChildrenChecked = robotData
                        .filter(robot => robot.status === parentStatus)
                        .every(robot => newValues[robot.name]);
                    newValues[parentStatus] = allChildrenChecked;
                }
            }

            return newValues;
        });
    };

    const handleInputClick = () => {
        setShowDropdown((prev) => !prev);
    };

    const handleDeleteTag = (tag) => {
        setSelectedValues(prevValues => {
            const newValues = { ...prevValues, [tag]: false };

            // Find the status of the tag to clear related checkboxes
            const robot = robotData.find(robot => robot.name === tag);
            if (robot) {
                const status = robot.status;

                // Check if all child checkboxes are unchecked, then uncheck the parent checkbox
                const allChildrenUnchecked = robotData
                    .filter(robot => robot.status === status && robot.name !== tag)
                    .every(robot => !newValues[robot.name]);
                newValues[status] = !allChildrenUnchecked;
            }
            
            return newValues;
        });
    };

    const statuses = [...new Set(robotData.map(robot => robot.status))];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        if (robotsRef.current) {
            const numberOfItems = robotsRef.current.children.length;
            const baseHeight = 1.9; // Initial height
            const itemHeight = 0.2; // Smaller height increment per item
            const maxHeight = 10; // Maximum height
            const newHeight = numberOfItems > 0 ? Math.min(baseHeight + (numberOfItems * itemHeight), maxHeight) : baseHeight;
            robotsRef.current.style.height = `${newHeight}rem`;
        }
    }, [selectedValues]);

    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.isLoadingStyle}`}>
                Loading...
            </div>
        );
    }

    function getUpdateButtonStyleCss() {
        if(nameExists === true) {
          return `${classes.disableButton}`;
        } else {
          return `${classes.updateEnvironmentButton}`;
        }
    }

    function renderRobotDetails() {

        if(selectedValues && Object.keys(selectedValues).length === 0) 
        {
            if((environmentDetails?.robots || []).length === 0) 
            {
                return ( <div className={`${classes.noItemsFoundUpdate}`}>No data found</div> );
            } 
            else
            {
                return (
                    environmentDetails.robots.map((robot) => (
                        <span key={robot} className={`${classes.spanEnvironments}`}>
                            {robot}
                            <img src={delete_icon_grey} alt="delete" className={`${classes.deleteicon}`} onClick={(e) => { e.stopPropagation(); handleDeleteTag(robot); }} />
                        </span>
                    ))
                );
            }
        } 
        else
        {
            return (
                selectedValues && Object.keys(selectedValues).map(key => (
                    selectedValues[key] && !statuses.includes(key) && (
                        <span key={key} className={`${classes.spanEnvironments}`}>
                            {key}
                            <img src={delete_icon_grey} alt="delete" className={`${classes.deleteicon}`} onClick={(e) => { e.stopPropagation(); handleDeleteTag(key); }} />
                        </span>
                    )
                ))
            );
        }
    }

    return (
        <div className={`w-100`}>
            <div className={`${classes.createEnvironmentHeading}`}>
                Update Environment
            </div>
            <form className={`${classes.formSection}`} onSubmit={handleUpdateEnvironmentFormSubmit}>
                {/* Name */}
                <div className={`${classes.environmentNameSection}`}>
                    <div className={`${classes.environmentFormInputSection}`}>
                        <label htmlFor='name' className={`${classes.environmentNameLabel}`}>
                            Name
                            <span className={`${classes.nameAstrix}`}>*</span>
                        </label>
                        <input id="environmentName" type="text" name="environmentName" className={`${classes.environmentNameInput}`}
                            defaultValue={environmentDetails.name}
                            onChange={checkIfEnvironmentNameAlreadyTaken} />
                    </div>
                    {nameExists && (

                        <span className={`${classes.nameCss}`} title="Name already exists" >
                            Name already exists
                        </span>
                    )}
                </div>
                {/* Environment description */}
                <div className={`${classes.environmentNameSection}`}>
                    <div className={`${classes.environmentFormInputSection}`}>
                        <label htmlFor='description' className={`${classes.environmentNameLabel}`}>
                            Description
                        </label>
                        <input id="environmentDescription" type="text" name="environmentDescription" className={`${classes.environmentNameInput}`}
                            defaultValue={environmentDetails.description} />
                    </div>
                </div>
                {/* Infra Type */}
                <div className={`${classes.environmentNameSection}`}>
                    <div className={`${classes.environmentFormInputSection}`}>
                        <label htmlFor="type" className={`${classes.environmentNameLabel}`}>Type<span className={`${classes.nameAstrix}`}>*</span></label>
                        <select id="type" name="type" className={`${classes.environmentNameInput1}`} value={selectedType || environmentDetails.type} onChange={handleTypeChange}>
                            <option value="Native">Native</option>
                            <option value="AWS-Fargate">AWS-Fargate</option>
                            <option value="Azure-Containers">Azure-Containers</option>
                        </select>
                    </div>
                </div>
                {/* Robots */}
                <div className={`${classes.environmentNameSection}`}>
                    <div className={`${classes.environmentFormInputSection}`}>
                        <label htmlFor='ROBOTS' className={`${classes.environmentNameLabel}`}>
                            Robots<span className={`${classes.nameAstrix}`}>*</span>
                        </label>
                        <div ref={robotsRef} className={`${classes.Robots}`} onClick={handleInputClick} style={{ cursor: 'pointer' }}>
                            { renderRobotDetails() }
                        </div>
                    </div>
                    {showDropdown && (
                        <div ref={dropdownRef} className={`dropdown ${classes.dropdown}`} style={{ maxHeight: '10rem', overflowY: 'auto', marginTop: '-0.5rem', marginLeft: '7.2rem' }}>
                            {statuses.length === 0 ? (
                                <div className={`${classes.noItemsFound}`}>No items found</div>
                            ) : (
                                statuses.map(status => (
                                    <div key={status}>
                                        <label className={`${classes.labeldropdown}`}>
                                            <input
                                                type="checkbox"
                                                name={status}
                                                style={{ marginRight: '4px' }}
                                                checked={selectedValues[status] || false}
                                                onChange={handleCheckboxChange}
                                            />
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </label>
                                        <div className="dropdown-values" style={{ paddingLeft: '20px' }}>
                                            {robotData.filter(robot => robot.status === status).map(robot => (
                                                <label key={robot.id} className={`${classes.labeldropdown}`}>
                                                    <input
                                                        type="checkbox"
                                                        name={robot.name}
                                                        style={{ marginRight: '4px' }}
                                                        checked={selectedValues[robot.name] || false}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    {robot.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <div className={`${classes.environmentFormButtonSection}`} >
                    <button type="submit"
                        className={ getUpdateButtonStyleCss() }
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
                        <button className={`${classes.popUpErrorBoxButton}`} onClick={() => {
                            setIsApiError(false);
                            setIsValidationError(false);
                            if (navigateBack) {
                                props.setActiveTab('environments');
                            }
                        }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateEnvironmentDetails;
