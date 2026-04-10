import React, { useState, useEffect, useCallback } from 'react';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import cssClasses from './ZephyrPageCss.js';
import TestCycleAccordions from './TestCycleAccordions.js';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import ErrorDisplay from './ErrorDisplay.js';

const testCycleMaxResults = 5;

const TestCycle = ({ backendBaseApiUrl, projectKey }) => {

	const classes = cssClasses();
	const { fetch } = useApi(fetchApiRef);
			
	const [error, setError] = useState();

	const [loadingTestCycle, setLoadingTestCycles] = useState(false);
	const [testCyclePage, setTestCyclePage] = useState({});
	const [testCycleCurrentPage, setTestCycleCurrentPage] = useState(1);
	const [testCycleTotalPages, setTestCycleTotalPages] = useState(0);
	const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);

    const handleError = async (response) => {
        let errorMessage = 'Error fetching details from Zephyr. ';
        try {
            const errorBody = await response.json();
            if (errorBody.error.includes('No project found'))
				{
					errorMessage = "No test cycle could be found with key \"" + projectKey + "\" in Zephyr. Please check the project key and try again.";
				}else {
					if(errorBody.error) {
						errorMessage += errorBody.error;
					}
			}
        } catch (e) {
          // Ignore JSON parsing errors and use the default error message
        }
        setError(errorMessage);
    };

	const fetchTestCycles = useCallback(async () => {
		setLoadingTestCycles(true);
		try {
			const response = await fetch(`${backendBaseApiUrl}testcycles?projectKey=${projectKey}&page=${testCycleCurrentPage}&maxResults=${testCycleMaxResults}`);
			if (response.ok) {
                const result = await response.json();
                setTestCyclePage(prevPages => ({
                    ...prevPages,
                    [testCycleCurrentPage]: result.values,
                }));
                const totalPages = Math.ceil(result.total / testCycleMaxResults);
                setTestCycleTotalPages(totalPages);
			} else{
				handleError(response);
				setTestCyclePage({});
			}
		} catch (fetchError) {
			handleError(fetchError);
			setTestCyclePage({});
		} finally {
			setLoadingTestCycles(false);
		}
	}, [backendBaseApiUrl, fetch, projectKey, testCycleCurrentPage]);

	useEffect(() => {
		if (isAccordionExpanded && !testCyclePage[testCycleCurrentPage] && !loadingTestCycle && (!error || error === '')) {
		  fetchTestCycles(testCycleCurrentPage);
		}
	  }, [fetchTestCycles, testCycleCurrentPage, isAccordionExpanded, testCyclePage, loadingTestCycle, error]);
	
	const handleAccordionChange = (event, isExpanded) => {
		setIsAccordionExpanded(isExpanded);
	};

    const testCycleRenderPagination = () => {
        const pages = [];
        for (let i = 1; i <= testCycleTotalPages; i++) {
            const isCurrentPage = i === testCycleCurrentPage;
            pages.push(
                <button
                    key={i}
                    onClick={() => setTestCycleCurrentPage(i)}
                    disabled={isCurrentPage}
                    className={`${classes.paginationButton} ${isCurrentPage ? classes.paginationCurrPageButton : ''}`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className={`${classes.paginationScroll}`}>
                <div className={`${classes.pagination}`}>
                    {pages}
                </div>
            </div>
        );
    };

	return (
		<Accordion expanded={isAccordionExpanded} onChange={handleAccordionChange} style={{ margin: '1rem' }}>
		  <AccordionSummary className="bg-info"
			expandIcon={<ExpandMoreIcon />}
			aria-controls="panel1a-content" id="panel1a-header" 
		  >
			<Typography>
			  <b>Test Cycle</b>
			</Typography>
		  </AccordionSummary>
		  <AccordionDetails className={`${loadingTestCycle ? classes.accordianDisplayNoBoxShadow : classes.accordianDisplay}`}>
            	{!loadingTestCycle && error && <ErrorDisplay error={error} />}

				{loadingTestCycle && (
					<p className={`${classes.loadingText}`}>Loading...</p>
				)}
				{!error && !loadingTestCycle && (!testCyclePage[testCycleCurrentPage] || testCyclePage[testCycleCurrentPage].length === 0) && (
                    <p className={`${classes.loadingText}`}>No test cycle found</p>
                )}
                {!loadingTestCycle && testCyclePage[testCycleCurrentPage] && testCyclePage[testCycleCurrentPage].length > 0 && (
                    <div className={`${classes.tableContainerWithPagination}`}>
                        <TestCycleAccordions backendBaseApiUrl={backendBaseApiUrl} projectKey={projectKey} testCycles={testCyclePage[testCycleCurrentPage]} classes={classes} />
                        {testCycleTotalPages > 1 && testCycleRenderPagination()}
                    </div>
                )}
		  </AccordionDetails>
		</Accordion>
	);
};

export default TestCycle;
