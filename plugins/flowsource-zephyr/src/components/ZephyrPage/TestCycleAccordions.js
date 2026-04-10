import React, { useState, useEffect, useCallback } from 'react';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { Table, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import ErrorDisplay from './ErrorDisplay';

const TestCycleAccordions = ({  backendBaseApiUrl, projectKey, testCycles, classes }) => {

    const { fetch } = useApi(fetchApiRef);
    
    const [error, setError] = useState(testCycles.map(() => ''));

    const [selectedStatus, setSelectedStatus] = useState(testCycles.map(() => ''));
    const [isAccordionExpanded, setIsAccordionExpanded] = useState(testCycles.map(() => false));
	const [loadingTestCycleExecution, setLoadingTestCycleExecution] = useState(testCycles.map(() => false));
	const [testCycleExecution, setTestCycleExecution] = useState(testCycles.map(() => {}));
    const [executionCounts, setExecutionCounts] = useState(testCycles.map(() => ({
        passed: 0,
        failed: 0,
        notExecuted: 0,
      })));

    useEffect(() => {
        // Clear states when testCycles variable is updated (i.e. when the user selects a different page of test cycles in the parent component)
        setTestCycleExecution(testCycles.map(() => {}));
        setIsAccordionExpanded(testCycles.map(() => false));
        setSelectedStatus(testCycles.map(() => ''));
        setExecutionCounts(testCycles.map(() => ({
            passed: 0,
            failed: 0,
            notExecuted: 0,
        })));
        setError(testCycles.map(() => ''));
        setLoadingTestCycleExecution(testCycles.map(() => false));
    }, [testCycles]);
    
    const handleError = async (testCycleIndex, response) => {
        let errorMessage = 'Error fetching details from Zephyr. ';
        try {
            const errorBody = await response.json();
            if (errorBody.error) {
                errorMessage += errorBody.error;
            }
        } catch (e) {
            // Ignore JSON parsing errors and use the default error message
        }
        setError(prevError => {
            const newError = [...prevError];
            newError[testCycleIndex] = errorMessage;
            return newError;
        });
    };

	const fetchTestCycleExecutions = useCallback(async (testCycleIndex) => {

        setLoadingTestCycleExecution(prevExecutions => {
            const newExecutions = [...prevExecutions];
            newExecutions[testCycleIndex] = true;
            return newExecutions;
        });

        try {
            const testCycleKey = testCycles[testCycleIndex].key;
            const url = `${backendBaseApiUrl}/testcycle/executions?projectKey=${projectKey}&testCycleKey=${testCycleKey}`;
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                const passedCount = result.filter(execution => execution.lastExecution.testExecutionStatus === 'Pass').length;
                const failedCount = result.filter(execution => execution.lastExecution.testExecutionStatus === 'Fail').length;
                const notExecutedCount = result.filter(execution => execution.lastExecution.testExecutionStatus === 'Not Executed').length;
        
                setTestCycleExecution(prevExecutions => {
                    const newExecutions = [...prevExecutions];
                    newExecutions[testCycleIndex] = result;
                    return newExecutions;
                  });

                setExecutionCounts(prevCounts => {
                    const newCounts = [...prevCounts];
                    newCounts[testCycleIndex] = {
                      passed: passedCount,
                      failed: failedCount,
                      notExecuted: notExecutedCount,
                    };
                    return newCounts;
                });

                setError('');

            } else {
                handleError(testCycleIndex, response);
                setTestCycleExecution(prevExecutions => {
                    const newExecutions = [...prevExecutions];
                    newExecutions[testCycleIndex] = [];
                    return newExecutions;
                });
            }
        } catch (fetchError) {
            handleError(testCycleIndex, fetchError);
            setTestCycleExecution(prevExecutions => {
                const newExecutions = [...prevExecutions];
                newExecutions[testCycleIndex] = [];
                return newExecutions;
            });
        } finally {
            setLoadingTestCycleExecution(prevExecutions => {
              const newExecutions = [...prevExecutions];
              newExecutions[testCycleIndex] = false;
              return newExecutions;
            });
        }
    }, [backendBaseApiUrl, fetch, projectKey, testCycles]);

    const handleStatusChange = (testCycleIndex, event) => {
      const newSelectedStatus = [...selectedStatus];
      newSelectedStatus[testCycleIndex] = event.target.value;
      setSelectedStatus(newSelectedStatus);
    };

	const handleAccordionChange = (testCycleIndex) => (event, isExpanded) => {
        const newIsAccordionExpanded = [...isAccordionExpanded];
        newIsAccordionExpanded[testCycleIndex] = isExpanded;
        setIsAccordionExpanded(newIsAccordionExpanded);

        if (isExpanded && !testCycleExecution[testCycleIndex]) {
            fetchTestCycleExecutions(testCycleIndex);
        }
    };


    const renderTableContent = (testCases, testCycleIndex) => {

        const filteredTestCases = testCases.filter(testCase => selectedStatus[testCycleIndex] === '' || testCase.lastExecution?.testExecutionStatus === selectedStatus[testCycleIndex]);
    
        if (filteredTestCases.length === 0) {
          return (
            <tr>
              <td colSpan="4" className={`${classes.tableBodyCell}`}>
                No test cases match the selected status.
              </td>
            </tr>
          );
        }

        let filteredTestCasesCount = 0;

        return filteredTestCases
            .map((story, index) => (
                <tr key={"TestCase" + filteredTestCasesCount++}>
                    <td className={`${classes.tableBodyCell}`} />
                    <td className={`${classes.tableBodyCell}`}>
                        {story.link ? (
                            <a href={story.link} target="_blank" className={`${classes.linkStyleHoverUnderline}`}>
                                {story.name}
                            </a>
                        ) : (
                            story.name
                        )}
                    </td>
                    <td className={`${classes.tableBodyCell}`}>{story.lastExecution?.testExecutionStatus}</td>
                    <td className={`${classes.tableBodyCell}`}>{story.folder}</td>
                </tr>
            ));
    };
    
    let testCycleCount = 0;

    return (
        testCycles.map((testCycle, testCycleIndex) => (
            <div key={"TestCycle" + testCycleCount++}>
                <Accordion expanded={isAccordionExpanded[testCycleIndex]} onChange={handleAccordionChange(testCycleIndex)} style={{ margin: '1rem' }}>
                    <AccordionSummary className="bg-info"
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content" id="panel1a-header" 
                    >
                        <Typography>
                        <b>{testCycle.name}</b>
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={`${loadingTestCycleExecution ? classes.accordianDisplayNoBoxShadow : classes.accordianDisplay}`}>

			            {!loadingTestCycleExecution[testCycleIndex] && error[testCycleIndex] && <ErrorDisplay error={error[testCycleIndex]} />}

                        {loadingTestCycleExecution[testCycleIndex] && (
                            <p className={`${classes.loadingText}`}>Loading...</p>
                        )}

                        {!error[testCycleIndex] && !loadingTestCycleExecution[testCycleIndex] && (!testCycleExecution[testCycleIndex] || testCycleExecution[testCycleIndex].length === 0) && (
                            <div className={`${classes.testCycleContainer}`}>
                                <div className={`${classes.testCycleHeading}`}>
                                    <p className={classes.cycleName}>
                                        Cycle Name: 
                                        {testCycle.link ? (
                                            <a href={testCycle.link} target="_blank" className={`${classes.linkStyleHoverUnderline}`}>
                                                {testCycle.name}
                                            </a>
                                        ) : (
                                            testCycle.name
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <div className={`table ${classes.tableBorders}`}>
                                        <p className={classes.noTestCasesText}>
                                            No test cases in this cycle
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!loadingTestCycleExecution[testCycleIndex] && testCycleExecution[testCycleIndex] && testCycleExecution[testCycleIndex].length > 0 && (
                            <div className={`${classes.testCycleContainer}`}>
                                {testCycleHeading(testCycle, testCycleIndex)}

                                {testCycleStatusFilter(testCycleIndex)}

                                {testCycleDetails(testCycleIndex)}
                            </div>
                        )}
                    </AccordionDetails>
                </Accordion>
            </div>
        ))
    );

    function testCycleDetails(testCycleIndex) {
        return (
            <div>
                <div className={`table ${classes.testCycleTableContainer}`}>
                    <Table className={`table ${classes.tableBorders}`}>
                        <thead className={`${classes.testCycleTableHead}`}>
                            <tr className={`${classes.tableHead}`}>
                                <th className={classes.tableHeadCell} />
                                <th className={`${classes.tableHeadCell}`}>
                                    Test Case Name
                                </th>
                                <th className={`${classes.tableHeadCell}`}>
                                    Status
                                </th>
                                <th className={`${classes.tableHeadCell}`}>
                                    Folder
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableContent(testCycleExecution[testCycleIndex], testCycleIndex)}
                        </tbody>
                    </Table>
                </div>
            </div>
        );
    }

    function testCycleHeading(testCycle, testCycleIndex) {
        return (
            <div className={`${classes.testCycleHeading}`}>
                <p className={classes.cycleName}>
                    Cycle Name: 
					{testCycle.link ? (
						<a href={testCycle.link} target="_blank" className={`${classes.linkStyleHoverUnderline}`}>
							{testCycle.name}
						</a>
					) : (
						testCycle.name
					)}
                </p>
                <p className={classes.executionStatus}>
                    Execution Status: {testCycle.status}
                </p>
                <p className={classes.testCases}>
                    # Test cases Passed: {executionCounts[testCycleIndex]?.passed}
                </p>
                <p className={classes.testCases}>
                    # Test cases Failed: {executionCounts[testCycleIndex]?.failed}
                </p>
                <p className={classes.testCases}>
                    # Test cases to be Executed: {executionCounts[testCycleIndex]?.notExecuted}
                </p>
            </div>
        );
    }

    function testCycleStatusFilter(testCycleIndex) {
        return (
            <div className={`${classes.testCyclesContainer}`}>
                <div className={`${classes.statusFilter}`}>
                    <FormControl variant="outlined" className={`${classes.formControl} w-100`}>
                        <InputLabel id={`statusFilter-label-${testCycleIndex}`}
                            style={{ marginTop: selectedStatus[testCycleIndex] === '' ? '-1rem' : '0rem' }}
                            className={`${classes.searchDropdownStyleLabel}`}>
                            Filter by Status
                        </InputLabel>
                        <Select
                            labelId={`statusFilter-label-${testCycleIndex}`}
                            id={`statusFilter-${testCycleIndex}`}
                            value={selectedStatus[testCycleIndex]}
                            onChange={(event) => handleStatusChange(testCycleIndex, event)}
                            label="Filter Testcases by Execution Status"
                            className={`${classes.searchDropdownStyle}`}
                        >
                            <MenuItem value=""><em>All</em></MenuItem>
                            <MenuItem value="Not Executed">Not Executed</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Pass">Pass</MenuItem>
                            <MenuItem value="Fail">Fail</MenuItem>
                            <MenuItem value="Blocked">Blocked</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>
        );
    }

}

export default TestCycleAccordions;
