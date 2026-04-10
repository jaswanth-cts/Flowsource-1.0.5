import { useState, useEffect, React } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { FormControl, InputGroup } from 'react-bootstrap';
import { useEntity } from '@backstage/plugin-catalog-react';
import { BsSearch, BsX } from 'react-icons/bs';
import {  EmptyState } from '@backstage/core-components';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';
import { Paper, Card, CardHeader, Divider, CardContent, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import cssClasses from '../TestingMainPageCSS.js';
import TestPlanPage from './TestPlanPage.js';
import {
    EntitySwitch,
} from '@backstage/plugin-catalog';

import createIcon from '../../Icons/create_icon.png';

import log from 'loglevel';

const TestingComponentMain = (props) => {
    const [tableData, setTableData] = useState([]);
    const [isDeleted, setIsDeleted] = useState(false);
    const [tool, setTool] = useState("");
    const [toolOptions, setToolOptions] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const { entity } = useEntity();
    const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];
    const baseUrl = config.getOptionalString('backend.baseUrl');
    const backendBaseApiUrl = baseUrl.endsWith('/')
        ? `${baseUrl}api/flowsource-cctp/`
        : `${baseUrl}/api/flowsource-cctp/`;
    const [error, setError] = useState(null);

    async function getTestPlanData() {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/testPlan?projectName=${projectName}`);
            if (response.ok) {
                const data = await response.json();
                let testPlanArray = new Array();
                if (data !== null && data !== undefined) {
                    data.forEach(function (item, index) {
                        const entry = { testPlanName: item.name, type: item.type, testSuites: item.testSuites, testPlanId: item._id };
                        testPlanArray.push(entry);
                    });
                } else {
                    log.info('No data to load');
                }
                //Set the table data for test plan
                setTableData(testPlanArray);
            } else {
                setError(`Application error occured with Status code: ${response.status})`);
            }
        } catch (error) {
            log.error("Error in fetching data ", error.message);
            setError(error.message);
        }
    }

    const fetchToolData = async () => {
        try {
            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/tool-config/`);
            if (!response.ok) {
                // Read the error message from the response
                const errorText = await response.text();
                // Format the error message
                const formattedError = `HTTP error! status: ${response.status}, message: ${errorText}`;
                // Set the error state with the formatted error message
                setError(formattedError);
            } else {
                const data = await response.json();
                processToolOptions(data);
            }
        } catch (error) {
            log.error("Error while fetching tool data:", error);
            if (!error.message.includes('HTTP error!')) {
                setError(`Error fetching data: ${error.message}`);
            }
        } finally {
            // Set loading to false after the fetch operation is complete
            setLoading(false);
        }
    }

    const processToolOptions = (data) => {
        const options = data.map(tool => ({
            value: tool.id,
            label: tool.name
        }));
        setToolOptions([...options]);
    }

    useEffect(() => {
        getTestPlanData();
        fetchToolData();
    }, [isDeleted]);

    const handleDeleteTestPlan = () => {
        setIsDeleted(!isDeleted);
    }

    const handleCreateClick = () => {
        props.setActiveTab('createTestPlan');
        props.setTestPlanId(null);
    }

    const handleToolChange = (event) => {
        log.info("Tool selected: ", event.target);
        setTool(event.target.value);
    }

    const handleTestPlanData = (testPlanId, activeTab) => {
        // Handle the data as needed
        props.setActiveTab(activeTab);
        props.setTestPlanId(testPlanId);
    };

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleCancelSearch = () => {
        setSearchText("");
    };

    const annotations = entity.metadata.annotations;
    // Check if the specific annotation for CCTP exists
    const shouldRenderCCTPPage = !!annotations && 'flowsource/CCTP-project-name' in annotations
        && annotations['flowsource/CCTP-project-name'].trim().length > 0;

    const filteredData = tableData.filter(element => {
        log.info(`Filtering: tool=${tool}, element.type=${element.type}`);
        const matchesTool = tool === "" || element.type.toLowerCase() === tool.toLowerCase();
        const matchesSearch = searchText === "" || element.testPlanName.toLowerCase().includes(searchText.toLowerCase()) || element.testSuites.some(suite => suite.testSuiteName.toLowerCase().includes(searchText.toLowerCase()));
        return matchesTool && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className={`App p-3 ${classes.loadingText}`}>
                Loading...
            </div>
        );
    }

    return (
        <div>
            {shouldRenderCCTPPage ? (
                <>
                    {!error ? (
                        <div>
                            <div className={`w-100 card border-0 rounded-0`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', paddingBottom: '1rem' }}>
                                        <label htmlFor="type" style={{ marginRight: '10px' }}>Tool</label>
                                        <select id="type" name="type" style={{ padding: '5px' }} value={tool}
                                            onChange={handleToolChange}>
                                            <option value="">All</option> {/* Add an "All" option */}
                                            {toolOptions.map((option) => (
                                                <option key={option.value} value={option.label}>{option.label}</option>
                                            ))}
                                        </select>
                                        <div>
                                            <InputGroup>
                                                <InputGroup.Text
                                                    style={{
                                                        border: 'none',
                                                        borderBottom: '1px solid white',
                                                        backgroundColor: 'white',
                                                        borderRadius: '0',
                                                    }}
                                                >
                                                    <BsSearch style={{ color: 'rgb(186 186 190)' }} />
                                                </InputGroup.Text>
                                                <FormControl
                                                    placeholder="Search"
                                                    value={searchText}
                                                    onChange={handleSearchChange}
                                                    className={`${classes.searchStyle}`}
                                                />
                                                {searchText && (
                                                    <InputGroup.Text
                                                        onClick={handleCancelSearch}
                                                        style={{
                                                            border: 'none',
                                                            borderBottom: '1px solid white',
                                                            backgroundColor: 'white',
                                                            borderRadius: '0',
                                                        }}
                                                    >
                                                        <BsX
                                                            style={{
                                                                color: 'rgb(186 186 190)',
                                                                fontSize: '23px',
                                                                marginTop: '-7px',
                                                            }}
                                                        />
                                                    </InputGroup.Text>
                                                )}
                                            </InputGroup>
                                        </div>
                                    </div>
                                    <div className={`${classes.buttonOptionsSection}`} style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', margin: '0rem 1rem 0.5rem 0rem' }}>
                                        <div>
                                            <a href="#" onClick={handleCreateClick} className="d-inline-flex align-items-center">
                                                <img
                                                    src={createIcon}
                                                    alt="Create Test Plan"
                                                    title='Click to create Test Plan'
                                                />
                                                <span className="ms-2">CREATE TEST PLAN</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {filteredData.length > 0 ? (
                                filteredData.map((element) => (
                                    <Accordion key={element.testPlanId}>
                                        <AccordionSummary className={`${classes.accordianSummary}`}
                                            expandIcon={<ExpandMoreIcon />} onClick={() => props.setTestPlanId(element.testPlanId)} aria-controls="panel1a-content" id="panel1a-header" >
                                            <Typography style={{ fontSize: '0.90rem', color: '#13215E', fontWeight: '550' }}>{element.testPlanName}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails className={`${classes.accordianDisplay}`}>
                                            <Typography>
                                                <Grid container>
                                                    <Grid item sm={12}>
                                                        <TestPlanPage testPlanData={element} onTestPlanDataChange={handleTestPlanData} isDeleted={handleDeleteTestPlan} />
                                                    </Grid>
                                                </Grid>
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: '1.2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                                    <b>No Match Found</b>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ErrorCard error={error} />
                    )}
                </>
            ) : (
                <div className='mt-3 ms-3 me-3 mb-4'>
                    <EntitySwitch>
                        <EntitySwitch.Case>
                            <EmptyState
                                title="No TestPlan page is available for this entity."
                                missing="info"
                                description="You need to add an annotation to your component if you want to see CCTP TestPlan page for it."
                            />
                        </EntitySwitch.Case>
                    </EntitySwitch>
                </div>
            )}
        </div>
    );
};

const ErrorCard = ({ error }) => (
    <Card sx={{ width: '100%' }}>
        <CardHeader title={<Typography variant="h6">Error</Typography>} />
        <Divider />
        <CardContent>
            <Paper role="alert" elevation={0}>
                <Alert severity="error">{error}</Alert>
            </Paper>
        </CardContent>
    </Card>
);

export default TestingComponentMain;
