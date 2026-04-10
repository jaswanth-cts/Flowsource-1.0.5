import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from '../TestingMainPageCSS.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import xss from 'xss';

import log from 'loglevel';

const ImportProjectModal = ({ importProjectModalOpen,
    setImportProjectModalOpen, setValue, createSuite, 
    setCreateSuite, projectName, setError, setIsSyncing, setImportProjectData,
    setSyncDropdownValue, testPlanUid, credentials, setTableData, selectedCredential,
    setSelectedCredential, gitBranch, setGitBranch, gitRepo, setGitRepo, toolType, setToolType,
    importType, setImportType, setImportTypeOptions, importTypeOptions}) => {
    const classes = cssClasses();
    toast.configure();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const baseUrl = config.getOptionalString('backend.baseUrl');
    const backendBaseApiUrl = baseUrl.endsWith('/')
        ? `${baseUrl}api/flowsource-cctp/`
        : `${baseUrl}/api/flowsource-cctp/`;

    const [showErrors, setShowErrors] = useState(false);
    const [framework, setFramework] = useState("Cucumber Feature");
    const [isImporting, setIsImporting] = useState(false);

    // Handle credential selection
    const handleCredentialChange = (e) => {
        const selectedId = e.target.value;
        const selectedObj = credentials.find(cred => cred.id === selectedId);
        setSelectedCredential(selectedObj);
    };

    const onImportProjectClick = async () => {
        const apiUrl = (`${backendBaseApiUrl}cctp-proxy/execution/test/import`);
        const body = {
            "show": true,
            "credential": selectedCredential?.name,
            "branch": gitBranch,
            "toolType": toolType,
            "importType": importType,
            "createSuite": createSuite,
            "createMultiplePlan": false,
            "url": gitRepo,
            "projectName": projectName
        };
        const sanitizedPayload = xss(JSON.stringify(body));
        const method = 'POST';
        setIsImporting(true);
        const data = await fetchApiData(apiUrl, method, JSON.parse(sanitizedPayload));
        if (data === null) {
            setIsImporting(false);
            toast.error("Error importing project. Check the branch name or framework type");
            return;
        }
        const jsonData = await data.json();
        setIsImporting(false);
        if (data.status === 200) {
            if (Array.isArray(jsonData) && jsonData.length === 0) {
                toast.error("Data not available for selected framework type");
                return;
            }

            setImportProjectData(jsonData);
            const prePopulatedTableData = jsonData.map(task => ({
                name: task.displayName || "",
                "id/tag": task.name || "",
                robots: task.robots || "",
                config: task.properties || "-",
            }));
            setTableData(prePopulatedTableData);
            setImportProjectModalOpen(false);
        }
    };

    const handleFrameworkChange = (e) => {
        const selectedFramework = e.target.value;
        setFramework(selectedFramework);

        let options = [];
        let toolTypeKey = "";
        if (selectedFramework === "Cucumber Feature") {
            toolTypeKey = "cucumber_feature";
            options = [
                { id: "features", label: "Features" },
                { id: "cucumber_feature_tag", label: "Tags" },
                { id: "cucumber_feature_scenario_name", label: "Scenario Name" },
                { id: "cucumber_feature_scenario", label: "Scenarios" },
                { id: "cucumber_feature_example_row", label: "Example Rows" },
                { id: "runner", label: "Runner" }
            ];
        } else if (selectedFramework === "TestNg Gradle") {
            toolTypeKey = "testng_java_gradle";
            options = [{ id: "testng_java_method", label: "Test Method" }];
        } else if (selectedFramework === "TestNg Maven") {
            toolTypeKey = "testng_java_maven";
            options = [{ id: "testng_java_method", label: "Test Method" }];
        } else if (selectedFramework === "CRAFT") {
            toolTypeKey = "craft_xlsm";
            options = [{ id: "craft_xlsm_run_manager", label: "Run Manager" }];
        }
        setToolType(toolTypeKey);
        setImportTypeOptions(options);
        setImportType(options[0]?.id || "");
    };

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
                const formattedError = `There is an error while importing project. Please check the inputs`;
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

    if (!importProjectModalOpen) return null;
    return (
        <div className={`${classes.modalOverlay}`}>
            <div className={`${classes.modalContainer}`}>
                <button className={`${classes.closeButtonTestPlan}`} onClick={() => {
                    setImportProjectModalOpen(false);
                    setValue("");
                    setSelectedCredential(null);
                }
                }>&times;</button>
                <div className={`${classes.modalHeader}`}>
                    <div className={`${classes.projectModalHeader}`}>Import Project</div>
                </div>
                <div className="modal-body">
                    <div className="mb-3 row">
                        <label htmlFor="gitRepo" className="col-sm-2 col-form-label fw-bold">
                            Git Repo <span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-10">
                            <input type="text" className="form-control" id="gitRepo" value={gitRepo}
                                onChange={(e) => setGitRepo(e.target.value)} />
                            {showErrors && gitRepo.trim() === "" && <small className="text-danger">Git Repo is required</small>}
                        </div>
                    </div>
                    <div className="mb-3 row">
                        <label htmlFor="credentials" className="col-sm-2 col-form-label fw-bold d-flex align-items-center">
                            Credentials
                        </label>
                        <div className="col-sm-4">
                            <select className="form-select" id="credentials" value={selectedCredential?.id || ""} onChange={handleCredentialChange}>
                                <option value="">Select Credential</option>
                                {credentials.map((cred) => (
                                    <option key={cred.id} value={cred.id}>
                                        {cred.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label htmlFor="branch" className="col-sm-2 col-form-label fw-bold">
                            Branch
                        </label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" id="branch" value={gitBranch}
                                onChange={(e) => setGitBranch(e.target.value)} />
                        </div>
                    </div>
                    <div className="mb-3 row">
                        <label htmlFor="frameworkType" className="col-sm-2 col-form-label fw-bold">
                            Framework Type
                        </label>
                        <div className="col-sm-10">
                            <select className="form-select" id="frameworkType" value={framework} onChange={handleFrameworkChange}>
                                <option key="cucumber_feature">Cucumber Feature</option>
                                <option key="testng_java_gradle">TestNg Gradle</option>
                                <option key="testng_java_maven">TestNg Maven</option>
                                <option key="craft_xlsm">CRAFT</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-3 row">
                        <label htmlFor="importType" className="col-sm-2 col-form-label fw-bold">
                            Import Type
                        </label>
                        <div className="col-sm-10">
                            <select className="form-select" id="importType" value={importType} onChange={(e) => setImportType(e.target.value)}>
                                {importTypeOptions.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={`${classes.formCheckboxGroup}`}>
                        <label>
                            <input type="checkbox" className='px-2' checked={createSuite}
                                onChange={(e) => setCreateSuite(e.target.checked)} /> Create Test Suite
                        </label>
                    </div>
                </div>
                <div className={`${classes.modalFooter} d-flex justify-content-end align-items-center w-100`}>
                    <div className="d-flex align-items-center">
                        {isImporting && (
                            <Box display="flex" alignItems="center" flexDirection="row" mr={1}>
                                <CircularProgress size={16} />
                                <Typography marginLeft={1}>Importing...</Typography>
                            </Box>
                        )}
                        <button className={`${classes.importButton} ${isImporting ? classes.disabledButton : ''}`} onClick={() => {
                            if (!gitRepo.trim()) {
                                setShowErrors(true);
                                return;
                            }
                            onImportProjectClick();
                        }}
                            disabled={isImporting}>IMPORT</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ImportProjectModal;