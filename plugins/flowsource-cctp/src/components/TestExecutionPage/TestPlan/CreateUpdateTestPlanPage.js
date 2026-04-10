import React, { useState, useEffect } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from '../TestingMainPageCSS.js';
import { Modal, Box, Typography, Button, Select, MenuItem, Tooltip, CircularProgress } from "@mui/material";
import Papa from 'papaparse';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import xss from 'xss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImportProjectModal from './ImportProjectModal.js';

import log from 'loglevel';

const CreateUpdateTestPlanPage = (props) => {
    const classes = cssClasses();
    const [name, setName] = useState("");
    const [testPlanProjectName, setTestPlanProjectName] = useState("");
    const [tool, setTool] = useState("");
    const [toolOptions, setToolOptions] = useState([]);
    const [value, setValue] = useState('');
    const [file, setFile] = useState(null);
    const [errorText, setErrorText] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [importProjectModalOpen, setImportProjectModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [populatedTasks, setPopulatedTasks] = useState([]);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [isFileProcessing, setFileProcessing] = useState(false);
    const [error, setError] = useState(null);

    const [selectedCredential, setSelectedCredential] = useState(null);
    const [credentials, setCredentials] = useState([]);
    const [gitBranch, setGitBranch] = useState("main");
    const [gitRepo, setGitRepo] = useState("");
    const [toolType, setToolType] = useState("");
    const [autoSync, setAutoSync] = useState(false);
    const [createSuite, setCreateSuite] = useState(false);
    const [importProjectData, setImportProjectData] = useState([]);
    const [syncDropdownValue, setSyncDropdownValue] = useState('');
    const [testPlanUid, setTestPlanUid] = useState();
    const [showSyncOptions, setShowSyncOptions] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [importTypeOptions, setImportTypeOptions] = useState([
        { id: "features", label: "Features" },
        { id: "cucumber_feature_tag", label: "Tags" },
        { id: "cucumber_feature_scenario_name", label: "Scenario Name" },
        { id: "cucumber_feature_scenario", label: "Scenarios" },
        { id: "cucumber_feature_example_row", label: "Example Rows" },
        { id: "runner", label: "Runner" }
    ]);
    const [importType, setImportType] = useState(importTypeOptions[0]?.id || "");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTableData = tableData.slice(startIndex, endIndex);
    const pagesToShow = 3;
    const pagesArray = [...Array(totalPages).keys()];

    let startPage = 1;
    let endPage = Math.min(pagesToShow, totalPages);

    function setStartPage() {
        if(currentPage > pagesToShow - 2) {
            return currentPage - Math.floor(pagesToShow / 2);
        } else {
            return startPage;
        }
    };

    function setEndPage() {
        if(currentPage > pagesToShow - 2) {
            return Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages);
        } else {
            return endPage;
        }
    };

    startPage = setStartPage();
    endPage = setEndPage();
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;


    toast.configure();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const { entity } = useEntity();
    const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];
    const baseUrl = config.getOptionalString('backend.baseUrl');
    const backendBaseApiUrl = setBaseUrlVal();
    function setBaseUrlVal() {
        if(baseUrl.endsWith('/')) {
          return `${baseUrl}api/flowsource-cctp/`;
        } else {
          return `${baseUrl}/api/flowsource-cctp/`
        }
    };

    // Close dropdown if clicked outside
    const options = [
        { label: 'CSV', value: 'csv' },
        { label: 'Project', value: 'project' },
    ];

    // API call generic method
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
                const formattedError = `HTTP error! Status: ${response.status}, There is a error while creating or editing test plan.`;
                setError(formattedError);
                return null; // Return null if the response is not okay
            }
            return await response; // Return the JSON data
        } catch (error) {
            log.error("Error while fetching API data:", error);
            setError(`Error fetching data: ${error.message}`);
            return null; // Return null in case of an error
        }
    };

    const handleChange = (e) => {
        const selectedValue = e.target.value;
        setValue(selectedValue);
        setErrorText(""); // Reset error when changing selection

        if (selectedValue === "csv") {
            // Show file input when CSV is selected
            setOpenModal(true);
        } else if (selectedValue === "project") {
            fetchCredentialProperties();
            setImportProjectModalOpen(true);
        } else {
            setErrorText("Selected option Is not available currently");
        }
    }

    // Fetch credential properties
    const fetchCredentialProperties = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/properties`);
        setLoading(true);
        const response = await fetchApiData(apiUrl);
        const data = await response.json();
        if (data && Array.isArray(data)) {
            const filteredCredentials = data.filter(cred => cred.type === "CREDENTIAL");
            setCredentials(filteredCredentials);
        }
        setLoading(false);
    }

    const handleCheckboxChange = (e, rowName, rowIndex) => {
        let newSelectedRows;
        const rowIdentifier = { name: rowName, page: currentPage, rowIndex };
        if (e.target.checked) {
            newSelectedRows = [...selectedRows, rowIdentifier];
        } else {
            newSelectedRows = selectedRows.filter(selected => !(selected.name === rowName && selected.page === currentPage && selected.rowIndex === rowIndex));
        }
        setSelectedRows(newSelectedRows);
        setSelectAll(currentTableData.every((row, index) => newSelectedRows.some(selected => selected.name === row.name && selected.page === currentPage && selected.rowIndex === index)));
    };


    useEffect(() => {
        setSelectAll(currentTableData.length > 0 && currentTableData.every((row, index) => selectedRows.some(selected => selected.name === row.name && selected.page === currentPage && selected.rowIndex === index)));
    }, [selectedRows, currentPage, tableData]);

    const handleSelectAllChange = () => {
        let newSelectedRows = [...selectedRows];
        if (!selectAll) {
            newSelectedRows = [...new Set([...newSelectedRows, ...currentTableData.map((row, index) => ({ name: row.name, page: currentPage, rowIndex: index }))])];
        } else {
            newSelectedRows = newSelectedRows.filter(selected => !currentTableData.some((row, index) => row.name === selected.name && selected.page === currentPage && selected.rowIndex === index));
        }
        setSelectedRows(newSelectedRows);
        setSelectAll(!selectAll);
    };

    const handleDeleteSelected = () => {
        setTableData((prevData) => {
            const updatedTableData = prevData.filter((row, index) => !selectedRows.some(selected => selected.name === row.name && selected.page === currentPage && selected.rowIndex === index));
            setCsvData((prevCsvData) => prevCsvData.filter((row, index) => !selectedRows.some(selected => selected.name === row.name && selected.page === currentPage && selected.rowIndex === index )));
            setImportProjectData((prevImportData) => prevImportData.filter((row, index) => !selectedRows.some(selected => selected.name === row.displayName && selected.page === currentPage && selected.rowIndex === index)));

            // Update populatedTasks based on remaining tableData
            const updatedPopulatedTasks = updatedTableData.map((row, index) => {
                const originalTask = populatedTasks[index];
                if (!originalTask) return null;

                // Sync task properties with the remaining table rows
                return {
                    ...originalTask,
                    displayName: row.name,
                    name: row["id/tag"],
                    robots: row.robots === "" ? [] : row.robots,
                    properties: row.config === "-" ? {} : row.config,
                };
            }).filter(Boolean); // Remove any null values in case of mismatches

            setPopulatedTasks(updatedPopulatedTasks); // Update the original tasks

            const tableDataWithoutType = updatedTableData.map(({ type, description, tags, properties, ...rest }) => ({
                name: rest.name,
                "id/tag": rest["id/tag"],
                robots: rest.robots.length === 0 ? '' : rest.robots,
                config: rest.config === "-" ? '-' : rest.config,
            }));

            return tableDataWithoutType;
        });
        setSelectedRows([]);
    };

    // Handle file upload (when CSV is selected)
    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile && uploadedFile.type === "text/csv") {
            setFile(uploadedFile); // Set the uploaded CSV file
            setFileProcessing(true);
            setIsFileUploaded(true);

            // Parse the CSV file
            Papa.parse(uploadedFile, {
                complete: (result) => {
                    // Store the data for create api call
                    setCsvData(result.data);
                    // Process valid data
                    const validData = result.data
                        .filter(row => {
                            // Filter out rows where all values are empty
                            return row && Object.values(row).some(cell => cell?.trim() !== '');
                        })
                        .map(row => {
                            return {
                                name: row.name || "",               // Keep the 'name' value from the CSV
                                "id/tag": row.name || "",           // Set 'id/tag' same as 'name'
                                type: row.type || "",
                                robots: row.robots || [],           // Keep the 'robots' value from the CSV
                                config: "-",                       // Always a hyphen
                                description: row.description || null,
                                tags: row.tags || null,
                            };
                        });

                    if (validData.length === 0) {
                        setErrorText("No valid data found in the CSV file.");
                        setFileProcessing(false);
                    } else {
                        setTimeout(() => {
                            setFileProcessing(false);
                            setFile(null);
                            handleCloseModal();
                            const tableDataWithoutType = validData.map(({ type, description, tags, properties, ...rest }) => ({
                                // ...rest,
                                name: rest.name,
                                "id/tag": rest["id/tag"],
                                robots: rest.robots.length === 0 ? '' : rest.robots,
                                config: rest.config === "-" ? '-' : rest.config,
                            }));
                            let newTableData = [];
                            if(tableData.length > 0 ){
                                newTableData = [...tableData, ...tableDataWithoutType];
                            } else {
                                newTableData = tableDataWithoutType;
                            }
                            setTableData(newTableData);
                            const newPopulatedTasks = validData.map(row => ({
                                displayName: row.name,
                                name: row["id/tag"],
                                type: row.type,
                                robots: row.robots,
                                properties: row.config === "-" ? {} : row.config,
                                description: row.description || null,
                                tags: row.tags || null,
                            }));
                            const updatedPopulatedTasks = [...populatedTasks, ...newPopulatedTasks];
                            setPopulatedTasks(updatedPopulatedTasks);
                        }, 1500);
                    }
                },
                header: true,          // Treat the first row as a header
                skipEmptyLines: true,  // Skip empty lines in the CSV
                dynamicTyping: true,   // Automatically cast values to their types
            });

            setErrorText(""); // Reset error text
        } else {
            setErrorText("Please upload a valid CSV file.");
            setFileProcessing(false);
        }
    };


    const handleToolChange = (event) => {
        setTool(event.target.value);
    }

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleCreateClick = async () => {
        // Call the API to create the test plan
        // Use the tool and tableData state variables to send the data
        if (!name || !tool) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Transform tableData into tasks array
        let updatedTask = [];
        let tasks = [];
        const newTasks = csvData.map(row => ({
            name: row.name || "",
            type: row.type || "",
            robots: row.robots ? row.robots : [], // Convert robots to an array
            properties: {},
            description: null,
            tags: null
        }));
        tasks = tasks.concat(newTasks);
        if (csvData.length > 0 ){
            updatedTask = [...csvData, ...tasks];
        } else {
            updatedTask = tasks;
        }

        const payload = {
            "name": name,
            "projectName": `${projectName}`,
            "toolType": tool,
            "task": {
                "type": tool,
                tasks: importProjectData.length > 0 ? importProjectData : updatedTask
            },
            "autoSync": false,
            "createSuite": createSuite,
            "createMultiplePlan": false
        };
        const updatedPayload = {
            "id": `${props.testPlanId}`,
            "name": name,
            "task": {
                "type": tool,
                'tasks': importProjectData.length > 0
                    ? importProjectData.map(task => ({
                        ...task,
                        type: task.type || ""
                    }))
                    : populatedTasks.map(task => ({
                        ...task,
                        type: task.type || ""
                    })),
                "properties": null,
            },
            "autoSync": false,
            "projectName": testPlanProjectName,
            "createSuite": createSuite,
            "toolType": tool,
            "properties": null,
            "createMultiplePlan": false,
            "parentId": null
        };
        const sanitizedPayload = xss(JSON.stringify(props.testPlanId ? updatedPayload : payload));
        // Replace with your actual API endpoint
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/test-plans`);
        const method = props.testPlanId ? 'PUT' : 'POST';
        const body = JSON.parse(sanitizedPayload);
        setCreating(true);
        setLoading(true);
        const response = await fetchApiData(apiUrl, method, body);
        const data = await response.json();
        if (value === 'project' && data?.id) {
            const testPlanId = data.id;
            await triggerSyncApi(testPlanId);
        }
        cleanupState();
        setLoading(false);
        setCreating(false);
        props.setActiveTab('testplan');
    }


    const handleCancelClick = () => {
        cleanupState();
        props.setActiveTab('testplan');
    }

    const cleanupState = () => {
        setFile(null); // Clear the uploaded file
        setTableData([]); // Clear table data
        setValue(""); // Reset dropdown value
        setSelectedRows([]);
    };


    const handleCloseModal = () => {
        setOpenModal(false);
        setValue("");
    };

    const fetchToolData = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/tool-config/`);
        setLoading(true); // Start loading
        const response = await fetchApiData(apiUrl);
        const data = await response.json();
        processToolOptions(data);
        setLoading(false); // Stop loading
    }

    const processToolOptions = (apiResponse) => {
        const options = apiResponse.map(item => ({
            label: item.name,
            value: item.name.toLowerCase(), // Lowercase for consistency
        }));
        setToolOptions(options); // Update dropdown options
        setTool(prevTool => prevTool || options[0]?.value || ""); // Set the first name as default if tool is not set
    };

    //------------------------------Edit TestPlan--------------------------------

    const editTestPlan = async (testPlanId) => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/test-plans/${testPlanId}`);
        setLoading(true);
        const response = await fetchApiData(apiUrl);
        const data = await response.json();
        setName(data.name);

        const taskTool = data.task.type.toLowerCase();
        setTool(taskTool);

        setTestPlanProjectName(data.projectName);

        setPopulatedTasks(data.task.tasks);
        const prePopulatedTableData = data.task.tasks.map(task => ({
            name: task.displayName || "",
            "id/tag": task.name || "",
            robots: task.robots === null || task.robots === undefined || task.robots.length === 0 ? "" : task.robots,
            config: task.properties === null || task.properties ===undefined || Object.keys(task.properties).length === 0 ? "-" : task.properties,
        }));
        setTableData(prePopulatedTableData);
        setAutoSync(data?.autoSync);
        // Call test import search Api
        await importSearchResults(data.name);
        setLoading(false);
    }

    const importSearchResults = async (testPlanName) => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/test/import/search?testPlanName=${testPlanName}&projectName=${projectName}&parentId=`);
        const response = await fetch(apiUrl);
        if (response.status === 200) {
            const data = await response.json();
            if (data) {
                setTestPlanUid(data?.id);
                setShowSyncOptions(true);
            }
        } else {
            return;
        }
    }

    const handleSyncDropdownChange = async (e) => {
        const selectedValue = e.target.value;
        setSyncDropdownValue(selectedValue);

        if (selectedValue === "sync") {
            setIsSyncing(true);
            const apiUrl = `${backendBaseApiUrl}cctp-proxy/execution/hook/test/import/${testPlanUid}/sync`;
            const method = 'POST';
            const response = await fetchApiData(apiUrl, method);
            const jsonData = await response.json();
            if (response.status === 200) {
                setImportProjectData(jsonData.task.tasks);
                const prePopulatedTableData = jsonData.task.tasks.map(task => ({
                    name: task.displayName || "",
                    "id/tag": task.name || "",
                    robots: task.robots || "",
                    config: task.properties || "-",
                }));
                setTableData(prePopulatedTableData);
                setIsSyncing(false);
                toast.success("Sync operation successful!");
                setSyncDropdownValue('');
            } else {
                toast.error("Sync operation failed.");
            }
        } else if (selectedValue === 'syncValue') {
            const newAutoSync = !autoSync;
            const apiUrl = `${backendBaseApiUrl}cctp-proxy/execution/test/import/${testPlanUid}/status?autoSync=${newAutoSync}`;
            const method = 'PUT';
            const response = await fetchApiData(apiUrl, method);
            if (response.status === 200) {
                if (newAutoSync) {
                    toast.success("AutoSync enabled!");
                } else {
                    toast.success("AutoSync disabled!");
                }
                setAutoSync(newAutoSync);
                setSyncDropdownValue('');
            } else {
                toast.error("AutoSync operation failed.");
            }
        } else if (selectedValue === 'copyhook') {
            const targetUrlResp = await fetch(`${backendBaseApiUrl}cctp-config`);
            const hookUrlJson = await targetUrlResp.json();
            const hookUrl = `${hookUrlJson.url}/execution/hook/test/import/${testPlanUid}`;
            navigator.clipboard.writeText(hookUrl);
            toast.success("Hook URL copied to clipboard!");
            setSyncDropdownValue('');
        }
    };

    // Function to trigger the Sync API call
    const triggerSyncApi = async (testPlanId) => {
        const syncApiUrl = `${backendBaseApiUrl}cctp-proxy/execution/test/import/autosync`;
        const syncPayload = {
            "show": true,
            "credential": selectedCredential?.name,
            "branch": gitBranch,
            "toolType": toolType,
            "importType": importType,
            "autoSync": false,
            "createSuite": createSuite,
            "createMultiplePlan": false,
            "url": gitRepo,
            "testPlanName": name,
            "testPlanId": testPlanId,
            "projectName": projectName
        };
        const sanitizedPayload = xss(JSON.stringify(syncPayload));
        const method = 'POST';
        await fetchApiData(syncApiUrl, method, JSON.parse(sanitizedPayload));
    }

    useEffect(() => {
        if (props.testPlanId) {
            editTestPlan(props.testPlanId);
        }
    }, [props.testPlanId]);

    useEffect(() => {
        fetchToolData();
    }, [setToolOptions]);

    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loadingContainer}`}>
                Loading...
            </div>
        );
    }

    if(creating) {

        function setTestPlanMessage() {
            if(props.testPlanId) {
                return 'Updating test plan...';
            } else {
                return 'Creating test plan...'
            }
        }

        return (
            <div className={`App p-3 ${classes.loadingContainer}`}>
                { setTestPlanMessage() }
            </div>
        );
    }

    if (error) {
        let displayError = error + `.`;
        try {
            const errorObj = JSON.parse(error.split('message: ')[1]);
            const statusCode = errorObj.response.statusCode;
            const message = errorObj.error.message;
            displayError = `HTTP error! status: ${statusCode}, message: ${message}`;
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



    const FullScreenLoader = () => (
        <div className={`${classes.fullScreenLoader}`}>
            <CircularProgress size="4rem" />
        </div>
    );

    return (
        <div>
            {isSyncing && <FullScreenLoader />}
            <div className="d-flex justify-content-between align-items-center pt-2">
                <div className={`ps-3 mt-2 ${classes.active}`}>{props.testPlanId ? 'Update Test Plan' : 'Create Test Plan'}</div>
                <div className="d-flex mx-3 pt-1 align-items-center">
                    {selectedRows.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            className={`btn ${classes.deleteSelectedButton}`}
                            onClick={handleDeleteSelected}
                            sx={{ marginRight: '16px' }}
                        >
                            Delete Selected ({selectedRows.length})
                        </Button>
                    )}
                    {props.testPlanId && showSyncOptions && (
                        <select className={`form-select ms-2 me-2 ${classes.smallDropdown}`}
                            value={syncDropdownValue} onChange={handleSyncDropdownChange}>
                            <option value="">Sync Options</option>
                            <option value="sync">Sync</option>
                        </select>
                    )}
                    <Select
                        value={value}
                        onChange={handleChange}
                        displayEmpty
                        style={{
                            minWidth: 70, fontSize: "0.8rem",
                            height: "30px",
                            color: "#13215E",
                        }}
                        variant="outlined"
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    "& .MuiMenuItem-root": {
                                        fontSize: "0.8rem",
                                        color: "#13215E",
                                        fontWeight: "500",
                                    },
                                },
                            },
                        }}
                        sx={{
                            "& .MuiSelect-outlined": {
                                borderColor: "#13215E", // Set border color
                            },
                            "& .MuiSelect-icon": {
                                color: "#13215E", // Color of the dropdown icon
                            },
                        }}
                        renderValue={(selected) => {
                            if (selected === '') {
                              return <Typography color="textSecondary">Import Test</Typography>;
                            }
                            else if (selected === 'csv') {
                              return <Typography color="textSecondary">CSV</Typography>;
                            }
                            else if (selected === 'project') {
                              return <Typography color="textSecondary">Project</Typography>;
                            }
                        }}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </div>

                {/* Display error popup for other options */}
                {errorText && (
                    <Typography color="error" className='mt-2'>
                        {errorText}
                    </Typography>
                )}
            </div>
            <div style={{
                cursor: 'not-allowed',
            }} >
                <hr className={'mt-1'} />
                <div className="container mt-3">
                    {/* Form */}
                    <form>
                        <div className="mb-3 row">
                            <label htmlFor="name" className="col-sm-2 col-form-label fw-bold">
                                Name
                            </label>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" id="name" value={name} onChange={handleNameChange} placeholder=""
                                   style={{
                                        backgroundColor: 'inherit',
                                        cursor: 'default'
                                    }} />
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label htmlFor="tool" className="col-sm-2 col-form-label fw-bold">
                                Tool                        </label>
                            <div className="col-sm-4">
                                <select
                                    className={`form-select ${classes.selectStyle}`}
                                    value={tool}
                                    onChange={handleToolChange}
                                    style={{
                                        backgroundColor: 'inherit',
                                        cursor: 'default'
                                    }}
                                >
                                    {toolOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>

                    {/* Table */}
                    <div className="table-responsive" >
                        <table className={`table table-bordered ${classes.tableBorders} `}>
                            <thead>
                                <tr className={`${classes.tableHead}`}>
                                    <th className={`${classes.colStyle}`} scope="col-5"
                                    > <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                            style={{
                                                backgroundColor: 'inherit',
                                                cursor: 'default'
                                            }}
                                        /></th>
                                    <th className={`${classes.colStyle}`} scope="col-5"
                                    >NAME</th>
                                    <th className={`${classes.colStyle}`} scope="col-5"
                                    >ID/TAG</th>
                                    <th className={`${classes.colStyle}`} scope="col-5"
                                    >ROBOTS</th>
                                    <th className={`${classes.colStyle}`} scope="col-5"
                                    >CONFIG</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {tableData.length > 0 ? (
                                    currentTableData.map((row, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    
                                                    checked={selectedRows.some(selected => selected.name === row.name && selected.page === currentPage && selected.rowIndex === index)}
                                                    onChange={(e) => { handleCheckboxChange(e, row.name, index) }}
                                                    style={{
                                                        backgroundColor: 'inherit',
                                                        cursor: 'default'
                                                    }}
                                                />
                                            </td>
                                            {Object.keys(row).map((key, i) => {
                                                return (
                                                <td key={i}>{typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key] || ""}</td>
                                            );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5}>No Data Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className='d-flex align-items-center mt-3 justify-content-end'>
                            <nav aria-label="Page navigation example justify-content-end">
                                <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                                    <li className={`page-item ${isPreviousDisabled}`}>
                                        <a aria-label="Previous" className="page-link"
                                            href="#"
                                            tabIndex="-1"
                                            onClick={() =>  handlePageChange(currentPage - 1)}
                                            style={{ cursor: 'pointer', backgroundColor: 'inherit' }}>
                                            <span aria-hidden="true">«</span>
                                        </a>
                                    </li>
                                    {startPage > 1 && (
                                        <li className="page-item disabled">
                                            <span className="page-link">...</span>
                                        </li>
                                    )}
                                    {pagesArray.slice(startPage - 1, endPage).map((index) => (
                                        <li
                                            key={index}
                                            className={`page-item ${classes.numCss}`}>
                                            <a className={`page-link  ${index + 1 === currentPage ? 'Mui-selected' : ''}`} href="#"
                                                onClick={() => handlePageChange(index + 1)}
                                                style={{ cursor: 'pointer', backgroundColor: 'inherit' }}>
                                                {index + 1}
                                            </a>
                                        </li>
                                    ))}
                                    {endPage < totalPages && (
                                        <li className="page-item disabled">
                                            <span className="page-link">...</span>
                                        </li>
                                    )}
                                    <li className={`page-item ${isNextDisabled}`}>
                                        <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next"
                                            style={{ cursor: 'pointer', backgroundColor: 'inherit' }}>
                                            <span aria-hidden="true">»</span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex justify-content-end mt-3 mb-4">
                        <Tooltip
                            title={value !== "project" && !props.testPlanId && !isFileUploaded ? "Please upload a valid CSV file" : (name && tool ? "" : "Please fill in the name and tool fields")}
                            placement="top"
                            disableInteractive
                            arrow >
                            <span>
                                <button type="button" onClick={handleCreateClick} disabled={value !== "project" && !props.testPlanId && (!isFileUploaded || !name || !tool)}
                                    className={`btn me-2 ${classes.createTestPlanButton}`}>
                                    {props.testPlanId ? 'UPDATE' : 'CREATE'}
                                </button>
                            </span>
                        </Tooltip>
                        <button type="button" onClick={handleCancelClick} className={`btn btn-primary ${classes.cancelButton}`}>
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
            {/* MUI Modal */}
            <Modal open={openModal} onClose={(event, reason) => {
                // Prevent closing on backdrop click or escape key press
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                handleCloseModal(); // Call handleCloseModal when closing is allowed
            }} disableEscapeKeyDown>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="h6" component="h2" marginBottom={2}>
                        Upload CSV File
                    </Typography>
                    {isFileProcessing ? (
                        // Show a spinner or loading indicator during processing
                        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                            <CircularProgress />
                            <Typography marginTop={2}>Processing file...</Typography>
                        </Box>
                    ) : (
                        <>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className='d-block mb-4'
                                multiple={false}
                            />
                            {file && <Typography>File Selected: {file.name}</Typography>}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCloseModal}
                                className='mt-2'
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
            <>
                {importProjectModalOpen && (
                    <ImportProjectModal importProjectModalOpen={importProjectModalOpen} setImportProjectModalOpen={setImportProjectModalOpen} setValue={setValue}
                        createSuite={createSuite} setCreateSuite={setCreateSuite}
                        projectName={projectName} setError={setError} setIsSyncing={setIsSyncing} setImportProjectData={setImportProjectData}
                        setSyncDropdownValue={setSyncDropdownValue} testPlanUid={testPlanUid} credentials={credentials} setTableData={setTableData}
                        selectedCredential={selectedCredential} setSelectedCredential={setSelectedCredential} gitBranch={gitBranch} setGitBranch={setGitBranch}
                        gitRepo={gitRepo} setGitRepo={setGitRepo} toolType={toolType} setToolType={setToolType} importType={importType}
                        setImportType={setImportType} setImportTypeOptions={setImportTypeOptions} importTypeOptions={importTypeOptions} />
                )}
            </>
        </div>
    );
};

export default CreateUpdateTestPlanPage;
