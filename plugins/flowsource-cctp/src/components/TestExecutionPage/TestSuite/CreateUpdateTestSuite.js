import React, { useState, useEffect, useRef } from 'react';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './TestSuiteProjectCSS';
import create_icon from '../../Icons/create_icon.png';
import popup_close_icon from '../../Icons/popup_close_icon.png';
import edit_icon from '../../Icons/edit.png';
import add_icon from '../../Icons/add_icon.png';
import minus_icon from '../../Icons/minus_icon.png';
import delete_icon_grey from '../../Icons/delete_icon_grey.png';
import { Modal } from 'react-bootstrap';
import TestSuiteTable from './TestSuiteTable';

import log from 'loglevel';

const TestSuiteCreateUpdate = (props) => {
    const classes = cssClasses();
    const [allocationType, setAllocationType] = useState('auto');
    const [priority, setPriority] = useState(0);
    const [reruncount, setRerunCount] = useState(0);
    const [removeFiles, setRemoveFiles] = useState(false);
    const [configValues, setConfigValues] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalInputFields, setModalInputFields] = useState([{ id: 1, value: '' }]);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [tool, setTool] = useState([]);
    const [toolValue, setToolValue] = useState('');
    const [robotType, setRobotType] = useState('NATIVE');
    const [nativeRobotData, setNativeRobotData] = useState([]);
    const [service, setService] = useState("");
    const [availableServices, setAvailableServices] = useState([]);
    const [count, setCount] = useState(1);
    const [testPlans, setTestPlans] = useState();
    const [testPlansForEdit, setTestPlansForEdit] = useState(null);
    const [tasksForTestPlan, setTasksForTestPlan] = useState(null);
    const [selectedTestPlan, setSelectedTestPlan] = useState('');
    const [projectId, setProjectId] = useState("");
    const [projectIdFetched, setProjectIdFetched] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [configObject, setConfigObject] = useState([]);
    const [dynamicRobotCount, setDynamicRobotCount] = useState(0);
    const [validationMessage, setValidationMessage] = useState(''); // State for validation message
    const [isCreateDisabled, setIsCreateDisabled] = useState(false); // State to disable the create button
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const { entity } = useEntity();
    const baseUrl = config.getOptionalString('backend.baseUrl');
    const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];
    const backendBaseApiUrl = baseUrl.endsWith('/')
        ? `${baseUrl}api/flowsource-cctp/`
        : `${baseUrl}/api/flowsource-cctp/`;

    // Config function
    const openModal = () => {
        if (configObject.length > 0) {
            setModalInputFields(configObject);
          } else {
            // If configObject is empty, initialize with a default empty field
            setModalInputFields([{ id: 1, label: '', value: '' }]);
          }
          setShowModal(true);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        if (name === 'CONFIG') {
            
            const fields = value.split(', ').map((item, index) => {
                const separatorIndex = item.indexOf(':');
                const label = item.substring(0, separatorIndex);
                const value = item.substring(separatorIndex + 1); // Skip the colon
                return { id: index + 1, label, value };
              });
              setModalInputFields(fields);
              setConfigObject(fields);
        }
    };

    const handleModalInputChange = (id, field, value) => {
        setModalInputFields(modalInputFields.map(
            item => item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleAddModalInputField = () => {
        setModalInputFields([...modalInputFields, { id: modalInputFields.length + 1, label: '', value: '' }]);
    };

    const handleRemoveModalInputField = (id) => {
        setModalInputFields(modalInputFields.filter(field => field.id !== id));
    };

    const handleModalDone = () => {
        const values = modalInputFields.map(field => `${field.label}:${field.value}`).join('; ');
        setConfigValues(values);
        setConfigObject(modalInputFields);
        setShowModal(false);
    };

    // Robots dropdown
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedValues, setSelectedValues] = useState([]);
    const dropdownRef = useRef(null);

    // Extract unique statuses dynamically from nativeRobotData
    const uniqueStatuses = [...new Set(nativeRobotData.map(robot => robot.status))];

    const handleInputClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedValues(prevValues => {
            const newValues = { ...prevValues, [name]: checked };
            if (uniqueStatuses.includes(name)) {
                nativeRobotData.forEach((robot) => {
                    if (robot.status === name) {
                        newValues[robot.name] = checked;
                    }
                });
            }
            return newValues;
        });
    };

    const handleDeleteTag = (tag) => {
        setSelectedValues(prevValues => {
            const newValues = { ...prevValues, [tag]: false };
            if (uniqueStatuses.includes(tag)) {
                nativeRobotData.forEach((robot) => {
                    if (robot.status === tag) {
                        newValues[robot.name] = false;
                    }
                });
            }
            return newValues;
        });
    };

    const clearAllTags = () => {
        const resetValues = {};
        // Uncheck all robots from nativeRobotData
        uniqueStatuses.forEach((status) => {
            resetValues[status] = false;
        });
        nativeRobotData.forEach((robot) => {
            resetValues[robot.name] = false;
        });
        setSelectedValues(resetValues);
    };


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

    // Name field
    const [name, setName] = useState('');
    const [isNameEmpty, setIsNameEmpty] = useState(true);
    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        setIsNameEmpty(value.trim() === '');
    };

    const onClickCreateTestSuite = () => {
        if (!validateFields()) {
            setShowValidationModal(true); // Show the validation error modal
            return;
        }
        createTestSuite();
    }

    const onClickCancel = () => {
        props.setActiveTab('testsuiteproject');
    }

    const fetchApiData = async (apiUrl, method = "GET", body = null) => {
        try {
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            };
    
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(apiUrl, options);
            if (!response.ok) {
                const errorText = await response.text();
                const formattedError = `HTTP error! Status: ${response.status}, Message: ${errorText}`;
                setError(formattedError);
                return null; // Return null if the response is not okay
            }
            return await response.json(); // Return the JSON data
        } catch (error) {
            log.error("Error while fetching API data:", error);
            setError(`Error fetching data: ${error.message}`);
            return null; // Return null in case of an error
        }
    };

    // Tool dropdown fetch
    const populateToolsDropdown = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/tool-config/`);
        setLoading(true); // Start loading
        const data = await fetchApiData(apiUrl);
        setLoading(false); // Stop loading
        if (data) {
            const options = data.map(item => {
                const properties = item.properties || {};
                const configArray = Object.entries(properties).map(([key, value], index) => ({
                    id: index + 1,
                    label: key,
                    value: value
                }));
                const configString = configArray.map(item => `${item.label}:${item.value}`).join('; ');
                return {
                    tool: item.name,
                    config: configString,
                    configArray: configArray,
                };

            });
            setTool(options);
            if (options.length > 0) {
                if (props.testSuiteId === null) {
                    setToolValue(options[0].tool || '');
                }
                setConfigValues(options[0].config || '');
                setConfigObject(options[0].configArray || '');
            }
        }
    };

    // Fetch native robots data
    const fetchNativeRobotsData = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/robots/`);
        setLoading(true); // Start loading
        const data = await fetchApiData(apiUrl);
        setLoading(false); // Stop loading
        if (data) {
            const filteredArray = data.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status
            }));
            setNativeRobotData(filteredArray);
        }
    };

    //Fetch managed robots data
    const fetchManagedRobotsData = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/executions/managed-services/`);
        setLoading(true);
        const data = await fetchApiData(apiUrl);
        setLoading(false);
        if (data) {
            setAvailableServices(data);
        }
    };

    // Fetch project Id from name
    const fetchProjectId = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/workbench/projects?projectName=${projectName}`);
        setLoading(true);
        const data = await fetchApiData(apiUrl);
        setLoading(false);
        if (data && data.length > 0) {
            setProjectId(data[0].id)
        }
    };

    // Fetch testplan data
    const fetchTestPlanData = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/execution/projects/${projectId}/test-plans/`);
        setLoading(true);
        const data = await fetchApiData(apiUrl);
        setLoading(false);
        if (data) {
            setTestPlans(data);
        }
    }

    const properties = configObject.reduce((acc, config) => {
        acc[config.label] = config.value;
        return acc;
      }, {});

    // Create test suite
    const createTestSuite = async () => {
        setLoading(true);
        const apiUrl = `${backendBaseApiUrl}cctp-proxy/execution/suites/`;
        const method = props.testSuiteId ? 'PUT' : 'POST';
        const body = props.testSuiteId ? getUpdatedPayload() : getPayload();
        const data = await fetchApiData(apiUrl, method, body);
        setLoading(false);
        if (data) {
            props.setActiveTab('testsuiteproject');
        }
    };
     
    const getPayload = () => {
        return {
            name,
            projectName: projectName || "",
            allocationType: allocationType || "",
            priority: priority || "",
            reRunCount: reruncount || 0,
            deleteJobCache: removeFiles,
            robotsType: robotType || "",
            managedRobotService: service || "",
            managedRobotsCount: count || 0,
            robots: getSelectedRobots(),
            infras: [],
            config: configValues || '',
            capsConfig: "",
            args: [],
            toolType: toolValue || "",
            properties,
            testPlanName: selectedTestPlan?.name || "",
            task: getTask() || { tasks: [] },
            isReRun: reruncount > 0,
        };
    };
     
    const getUpdatedPayload = () => {
        return {
            id: props.testSuiteId,
            name,
            projectName: projectName || "",
            testPlanName: selectedTestPlan?.name || "",
            ...(robotType === 'NATIVE' && { robots: getSelectedRobots() }),
            infras: [],
            task: getTask() || { tasks: [] },
            testPlanId: null,
            autoSync: false,
            priority: priority || "",
            allocationType: allocationType || "",
            properties,
            isReRun: reruncount > 0,
            reRunCount: reruncount || 0,
            reportId: null,
            reportProjectId: null,
            robotsType: robotType || "",
            ...(robotType === "MANAGED" && {
                managedRobotService: service || "",
                managedRobotsCount: count || 0,
            }),
            toolType: toolValue || "",
            deleteJobCache: removeFiles,
            config: configValues || '',
        };
    };
     
    const getSelectedRobots = () => {
        return Object.keys(selectedValues).filter(key => selectedValues[key]);
    };
     
    const getTask = () => {
        return {
            ...selectedTestPlan?.task,
            type: toolValue
        };
    };

    const handleSelectionChange = (selectedCases, selectedPlanData) => {
        // Filter the test plan's task data to include only the selected test cases
        const filteredPlanData = selectedPlanData
            ? {
                ...selectedPlanData,
                task: {
                    ...selectedPlanData.task,
                    tasks: selectedPlanData.task.tasks.filter((task) => {
                        return selectedCases.some((caseItem) => caseItem.IDTag === task.name);
                    }),
                },
            }
            : null;
            
        setSelectedTestPlan(filteredPlanData);
    };

    //---------------------------- Edit Test Suite ------------------------------------

    const editTestSuite = async (testSuiteId) => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/suites/${testSuiteId}`);
        setLoading(true);
        const data = await fetchApiData(apiUrl);

        setLoading(false);
        if (data) {
            setName(data.name);
            setAllocationType(data.allocationType);
            setPriority(data.priority);
            setRerunCount(data.reRunCount);
            tool.forEach(item => {
                if(item.tool?.toLowerCase() === data.task?.type?.toLowerCase()){
                    setToolValue(item.tool)
                }
            });
            const configArray = Object.entries(data.properties).map(([key, value], index) => ({
                id: index + 1,
                label: key,
                value: value
              }));
            const configString = configArray.map(item => `${item.label}:${item.value}`).join('; ');
            setConfigValues(configString);
            setConfigObject(configArray);
            setRobotType(data.robotsType);
            if (data.robotsType === 'MANAGED') {
            setService(data.managedRobotService);
            setCount(data.managedRobotsCount);
            }
            if (data.robotsType === 'NATIVE') {
                setSelectedValues(
                    data.robots.reduce((acc, robot) => ({ ...acc, [robot]: true }), {})
                );
            }
           
            setTestPlansForEdit(data.testPlanName);
            setTasksForTestPlan(data.task.tasks);
            setRemoveFiles(true);
        }
    }
    async function getRobotCount() {
        try {
          const response = await fetch(`${backendBaseApiUrl}cctp-config`);
          if (response.ok) {
            const data = await response.json();
            setDynamicRobotCount(data.dynamicMaxRobotCount);
          } else {
            log.error('Failed to fetch robot counts:', response.status, response.statusText);
            setError('Failed to fetch robot counts');
          }
        } catch (error) {
          log.error('Error fetching robot counts:', error);
          setError('Error fetching robot counts');
        }
      }


    useEffect(() => {
        fetchProjectId()
            .then(() => {
                setProjectIdFetched(true);
            })
            .catch((error) => {
                log.error("Error fetching project ID:", error);
            });
            getRobotCount();
    }, []);

    useEffect(() => {
        if (projectIdFetched) {
            populateToolsDropdown();
            fetchNativeRobotsData();
            fetchManagedRobotsData();
            fetchTestPlanData();
        }
    }, [projectIdFetched]);

    useEffect(() => {
        if (props.testSuiteId) {
            editTestSuite(props.testSuiteId);
        }
    }, [props.testSuiteId, tool]);

    const validateFields = () => {
        const errors = [];

        if (!name.trim()) errors.push('Name is required');
        if(robotType === 'MANAGED'){
            if (!service.trim()) errors.push('Service field is required');
            if (count > dynamicRobotCount) {
                errors.push('Dynamic robot limit exceeded');
                setValidationMessage('Dynamic robot limit exceeded'); // Set validation message
                setIsCreateDisabled(true); // Disable the create button
            } else {
                setValidationMessage(''); // Clear validation message if within limit
                setIsCreateDisabled(false); // Enable the create button
            }
        } else {
            setValidationMessage(''); // Clear validation message for non-MANAGED types
            setIsCreateDisabled(false); // Enable the create button
        }

        setValidationErrors(errors);
        return errors.length === 0; // Return true if no errors
    };

    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loadingContainer}`}>
                Loading...
            </div>
        );
    }

    if (error) {
        let displayError = error;
        try {
            const errorMessage = error.split('Message: ')[1];
            try {
                const errorObj = JSON.parse(errorMessage);
                const statusCode = errorObj.response.statusCode;
                displayError = `HTTP error! status: ${statusCode}, message: Application error occured.`;
            } catch (e) {
                displayError = errorMessage;
            }
        } catch (e) {
            log.error('Error parsing error message:', e);
        }
        return (
            <div className="card ms-2 me-2 mb-2 mt-2">
                <div className="card-header">
                    <h6>Error</h6>
                </div>
                <div className="card-body">
                    <div className="alert alert-danger" role="alert">
                        {displayError}
                    </div>
                </div>
            </div>
        );
    }

    let toolDropDownCounter = 0;
    let serviceContr = 0;
    let validationErrorContr = 0;

    return (
        <div >
            <div className={`mb-2 me-4`} style={{ textAlign: 'end' }}>
                <a href='#' onClick={onClickCreateTestSuite}>
                    <img
                        src={create_icon}
                        alt="Create Icon"
                        className={`${classes.accessibilityIconImg}`}
                    />
                    <span className={`${classes.accessibilityIconText}`}>
                        {props.testSuiteId ? 'UPDATE TEST SUITE' : 'CREATE TEST SUITE'}
                    </span>
                </a>
                <a href='#' onClick={onClickCancel}>
                    <img
                        src={popup_close_icon}
                        alt="PopUp Close Icon"
                        className={`${classes.accessibilityIconImg}`}
                    />
                    <span className={`${classes.accessibilityIconText}`}>CANCEL</span>
                </a>
            </div>

            <div className="container-fluid mt-3">
                <div className="card">
                    <div className="card-body mt-3">
                        <div className="row">
                            <div>
                                <div className="col-auto mb-3 d-flex">
                                    <label className={`${classes.fontlabel}`} htmlFor="textbox">
                                        Name {isNameEmpty && <span style={{ color: 'red' }}>*</span>}
                                    </label>
                                </div>
                                <div className="col-auto mb-1 d-flex">
                                    <input
                                        type="text"
                                        id="textbox"
                                        className={`${classes.NameInput}`}
                                        value={name}
                                        onChange={handleNameChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2 gx-3 gy-2">
                            <div className="col-12 col-md-6">
                                <label className={`${classes.labelType}`} htmlFor="allocationType">Type</label>
                                <select
                                    className={`select-input ${classes.selectType}`}
                                    name="allocationType"
                                    required
                                    id="allocationType"
                                    value={allocationType}
                                    onChange={(e) => {
                                        setAllocationType(e.target.value);
                                    }}
                                >
                                    <option value="auto">Auto</option>
                                    <option value="manual">Manual</option>
                                    <option value="dynamic">Dynamic</option>
                                    <option value="auto_args">Auto_args</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className={`${classes.labelPriority}`} htmlFor="priority">Priority</label>
                                <input
                                    type="number"
                                    value={priority}
                                    id="priority"
                                    name="priority"
                                    onChange={(e) => setPriority(e.target.value)}
                                    className={`${classes.selectPriority}`}
                                />
                            </div>
                        </div>
                        <div className="row mt-2 gx-3 gy-2">
                            <div className="col-12 col-md-6">
                                <label className={`${classes.labelReruncount}`} htmlFor="reruncount">Rerun Count</label>
                                <input
                                    type="number"
                                    value={reruncount}
                                    min="0"
                                    max="5"
                                    id="reruncount"
                                    name="reruncount"
                                    onChange={(e) => setRerunCount(e.target.value)}
                                    className={`${classes.selectReruncount}`}
                                />
                            </div>

                            <div className="col-12 col-md-6 d-flex align-items-center">
                                <input type="checkbox" id="removeFiles" name="removeFiles" checked={removeFiles}
                                    onChange={(e) =>{ 
                                        setRemoveFiles(e.target.checked)}}
                                />
                                <label className={` ms-2 ${classes.fontlabel}`} htmlFor="removeFiles">Remove files</label>
                            </div>
                        </div>

                        <div className="row mt-2 gx-3 gy-2">
                            <div className="col-12 col-md-6">
                                <label className={`${classes.labelTool}`} htmlFor="tool" >Tool</label>
                                <select
                                    className={`select-input ${classes.selectTool}`}
                                    name="tool"
                                    required
                                    id="tool"
                                    value={toolValue}
                                    onChange={(e) => {
                                        const selectedTool = e.target.value;
                                        setToolValue(selectedTool);
                                        const selectedToolObj = tool.find((item) => item.tool === selectedTool);
                                        if (selectedToolObj && selectedToolObj['config']) {
                                            setConfigValues(selectedToolObj['config']);
                                            setConfigObject(selectedToolObj['configArray']);
                                        } else {
                                            setConfigValues(''); // Clear the textbox if repo_URL is empty or null
                                            setConfigObject([]); // Clear the configObject
                                        }
                                    }}
                                >
                                    {tool.map((option, index) => (
                                        <option 
                                            key={"ToolDropDown" + toolDropDownCounter++} 
                                            value={option.tool}
                                        >
                                            {option.tool}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-6 d-flex align-items-center">
                                <label className={`${classes.labelConfig}`} htmlFor="CONFIG">Config</label>
                                <input type="text" id="CONFIG" name="CONFIG" className={`${classes.input_config}`}
                                    value={configValues} onChange={handleFieldChange} readOnly />
                                <img src={edit_icon} alt="Edit" className={`${classes.editIcon}`} onClick={openModal} />

                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col-12">
                                <label className={`${classes.labelRobotstype}`} htmlFor="ROBOTSTYPE">Robot Types</label>
                                <select
                                    className={`select-input ${classes.selectRobotstype}`}
                                    name="ROBOTSTYPE"
                                    required
                                    id="ROBOTSTYPE"
                                    value={robotType}
                                    onChange={(e) => {
                                        setRobotType(e.target.value);
                                    }}
                                >
                                    <option value="NATIVE">NATIVE</option>
                                    <option value="MANAGED">MANAGED</option>
                                    <option value="INFRA">INFRA</option>
                                </select>
                            </div>
                        </div>
                        {robotType !== 'INFRA' && robotType !== 'MANAGED' && (
                            <div className="row mt-2">
                                <div className="col-12" style={{ position: 'relative' }}>
                                    <label className={`${classes.labelRobots}`} htmlFor="ROBOTS">Robots</label>
                                    <div className={`${classes.Robots} ${classes.robotsOverflow}`} onClick={handleInputClick}>
                                        {Object.keys(selectedValues).map(key => (
                                            selectedValues[key] && !["offline", "assigned", "online"].includes(key) && (
                                                <span key={key} className={`${classes.spanRobots}`}>
                                                    {key}
                                                    <img src={delete_icon_grey} alt="delete" className={`${classes.deleteicon}`} onClick={(e) => { e.stopPropagation(); handleDeleteTag(key); }} />
                                                </span>
                                            )
                                        ))}
                                        <img
                                            src={delete_icon_grey}
                                            alt="clear all"
                                            className={`${classes.clearAllIcon}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAllTags();
                                            }}
                                        />
                                    </div>
                                    {showDropdown && (
                                        <div ref={dropdownRef} className={`dropdown ${classes.dropdown}`}>
                                            {uniqueStatuses.map((status) => (
                                                <>
                                                    <label style={{ display: 'block', padding: '5px' }}>
                                                        <input
                                                            type="checkbox"
                                                            name={status}
                                                            style={{ marginRight: '4px' }}
                                                            checked={selectedValues[status] || false}
                                                            onChange={handleCheckboxChange} />
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </label>
                                                    <div className="dropdown-values" style={{ paddingLeft: '20px' }}>
                                                        {nativeRobotData
                                                            .filter((robot) => robot.status === status)
                                                            .map((robot) => (
                                                                <label key={robot.id} className={`${classes.labeldropdown}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        name={robot.name}
                                                                        style={{ marginRight: '4px' }}
                                                                        checked={selectedValues[robot.name] || false}
                                                                        onChange={handleCheckboxChange} />
                                                                    {robot.name}
                                                                </label>
                                                            ))}
                                                    </div>
                                                </>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {robotType === 'MANAGED' && (
                            <div className="row mt-2 align-items-center">
                                <div className="col-5">
                                    <label className={`${classes.labelService}`} htmlFor="SERVICE">Service</label>
                                    <select
                                        className={`select-input ${classes.selectType}`}
                                        name="allocationType"
                                        required
                                        id="SERVICE"
                                        value={service || ""}
                                        onChange={(e) => setService(e.target.value)}
                                    >
                                        <option value="" disabled hidden>Select a Service</option>
                                        {availableServices.map((option, index) => (
                                            <option key={"Service" + serviceContr++} value={`${option.name} [${option.type}]`}>
                                                {`${option.name} [${option.type}]`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className={`${classes.labelPriority}`} htmlFor="COUNT">Count</label>
                                    <input
                                        type="number"
                                        value={count}
                                        id="COUNT"
                                        min="0"
                                        name="count"
                                        onChange={(e) => setCount(e.target.value)}
                                        className={`${classes.selectPriority}`}
                                    />
                                     {validationMessage && (
                                        <p style={{ color: 'red', marginTop: '5px',marginLeft: '4rem' }}>{validationMessage}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div>
                <TestSuiteTable testPlans={testPlans} loading={isLoading}
                    initialSelectedCases={selectedTestPlan}
                    onSelectionChange={handleSelectionChange}
                    testPlansForEdit={testPlansForEdit}
                    tasksForTestPlan={tasksForTestPlan}
                    setTestPlansForEdit={setTestPlansForEdit}/>     
            </div>


            {/* Config Modal */}
            <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title className={`${classes.modalTitle}`}>Suite Config</Modal.Title>
                    <img src={popup_close_icon} alt="Close" className={`${classes.closeIcon}`} onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body className={`${classes.modalBody}`}>
                    {modalInputFields.map((field, index) => (
                        <div key={field.id} className="formGroup" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                id={`label-${index + 1}`}
                                name={`label-${index + 1}`}
                                className={`${classes.modalInputLeft}`}
                                value={field.label}
                                onChange={(e) => handleModalInputChange(field.id, 'label', e.target.value)}
                                placeholder={`Config-${index + 1}`}
                            />
                            <input
                                type="text"
                                id={`value-${index + 1}`}
                                name={`value-${index + 1}`}
                                className={`${classes.modalInputRight}`}
                                value={field.value}
                                onChange={(e) => handleModalInputChange(field.id, 'value', e.target.value)}
                            />
                            <button type="button" onClick={handleAddModalInputField} className={`${classes.addRemoveButton}`}>
                                <img src={add_icon} alt="Add" />
                            </button>
                            {modalInputFields.length > 1 && (
                                <button type="button" onClick={() => handleRemoveModalInputField(field.id)} className={`${classes.addRemoveButton}`}>
                                    <img src={minus_icon} alt="Remove" />
                                </button>
                            )}
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <div className={`${classes.modalButtonContainer}`}>
                        <button type="button" className={`${classes.modalDoneButton}`} onClick={handleModalDone}> DONE </button>
                        <button type="button" onClick={() => setShowModal(false)} className={`${classes.modalCancelButton}`}> CANCEL </button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Validation Modal */}
            <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Validation Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-danger" role="alert">
                        <ul>
                            {validationErrors.map((error, index) => (
                                <li key={"ValidationError" + validationErrorContr++}>
                                    {error}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={() => setShowValidationModal(false)}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>

    );
};
export default TestSuiteCreateUpdate;