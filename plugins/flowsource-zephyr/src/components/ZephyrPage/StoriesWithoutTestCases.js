import React, { useState, useEffect, useCallback } from 'react';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import StoriesWithoutTestCasesTable from './StoriesWithoutTestCasesTable';
import cssClasses from './ZephyrPageCss.js';
import { FormControl, InputGroup } from 'react-bootstrap';
import { BsSearch, BsX } from 'react-icons/bs';
import ErrorDisplay from './ErrorDisplay';

const storiesWithoutTestCasesMaxResults = 10;

const StoriesWithoutTestCases = ({ backendBaseApiUrl, projectKey, onlyActiveSprints, durationDaysCatalog }) => {

    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    
    const [error, setError] = useState('');

    const [loadingStoriesWithoutTestCases, setLoadingStoriesWithoutTestCases] = useState(false);
    const [storiesWithoutTestCasesPage, setStoriesWithoutTestCasesPage] = useState({});
    const [storiesWithoutTestCasesCurrentPage, setStoriesWithoutTestCasesCurrentPage] = useState(1);
    const [storiesWithoutTestCasesTotalPages, setStoriesWithoutTestCasesTotalPages] = useState(0);
    const [storiesWithoutTestCasesSearchQuery, setStoriesWithoutTestCasesSearchQuery] = useState('');

    const handleError = async (response) => {
        let errorMessage = 'Error fetching details from Zephyr. ';
        try {
            const errorBody = await response.json();
            if (errorBody.error.includes('No project found'))
                {
                    errorMessage = "No stories could be found with key \"" + projectKey + "\" in Zephyr. Please check the project key and try again.";
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

    const fetchStoriesWithoutTestCases = useCallback(async (searchQuery) => {
        setLoadingStoriesWithoutTestCases(true);
        try {
            let url = `${backendBaseApiUrl}stories-without-testcases?projectKey=${projectKey}&page=${storiesWithoutTestCasesCurrentPage}&maxResults=${storiesWithoutTestCasesMaxResults}&status=${searchQuery}&durationDaysCatalog=${durationDaysCatalog}`;
			if (onlyActiveSprints) {
				url = `${url}&onlyActiveSprints=true`;
			}
			const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setStoriesWithoutTestCasesPage(prevPages => ({
                    ...prevPages,
                    [storiesWithoutTestCasesCurrentPage]: result.issues
                }));
                const totalPages = Math.ceil(result.total / storiesWithoutTestCasesMaxResults);
                setStoriesWithoutTestCasesTotalPages(totalPages); // Assuming the API returns the total number of pages
                setError('');
            } else {
                handleError(response);
                setStoriesWithoutTestCasesPage({});
            }
        } catch (fetchError) {
            handleError(fetchError);
            setStoriesWithoutTestCasesPage({});
        } finally {
            setLoadingStoriesWithoutTestCases(false);
        }
    }, [backendBaseApiUrl, projectKey, storiesWithoutTestCasesCurrentPage, durationDaysCatalog, onlyActiveSprints, fetch]);

    useEffect(() => {
        if (!storiesWithoutTestCasesPage[storiesWithoutTestCasesCurrentPage] && !loadingStoriesWithoutTestCases && (!error || error === '') && storiesWithoutTestCasesSearchQuery === '') {
            fetchStoriesWithoutTestCases('');
        }
    }, [error, fetchStoriesWithoutTestCases, loadingStoriesWithoutTestCases, storiesWithoutTestCasesCurrentPage, storiesWithoutTestCasesPage, storiesWithoutTestCasesSearchQuery]);

    useEffect(() => {
        setStoriesWithoutTestCasesPage({});
        setStoriesWithoutTestCasesCurrentPage(1); // Reset to the first page when onlyActiveSprints changes
    }, [onlyActiveSprints]);

    const handleStoriesWithoutTestCasesSearchInputChange = (event) => {
        setStoriesWithoutTestCasesSearchQuery(event.target.value);
    };

    const storiesWithoutTestCasesRenderPagination = () => {
        const pages = [];
        for (let i = 1; i <= storiesWithoutTestCasesTotalPages; i++) {
            const isCurrentPage = i === storiesWithoutTestCasesCurrentPage;
            pages.push(
                <button
                    key={i}
                    onClick={() => setStoriesWithoutTestCasesCurrentPage(i)}
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

    const handleStoriesWithoutTestCasesSearchInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            const searchQuery = event.target.value;
            setStoriesWithoutTestCasesCurrentPage(1); // Reset to the first page
            setStoriesWithoutTestCasesPage({}); // Clear previous results
            fetchStoriesWithoutTestCases(searchQuery);
        }
    };

    const handleStoriesWithoutTestCasesCancelSearch = () => {
        setStoriesWithoutTestCasesSearchQuery('');
        fetchStoriesWithoutTestCases('');
    };

    return (
        <div className={`${classes.tableContainer}`}>
            <div className={`${classes.tableHeading}`}>
                <h2 className={classes.headingText}>
                    Stories without Test Cases
                </h2>
                <div className={`${classes.searchField}`}>
                    <div>
                        <InputGroup>
                            <InputGroup.Text className={classes.inputGroupText}>
                                <BsSearch className={classes.searchIcon} />
                            </InputGroup.Text>
                            <FormControl
                                placeholder="Search by Status"
                                value={storiesWithoutTestCasesSearchQuery}
                                onChange={handleStoriesWithoutTestCasesSearchInputChange}
                                onKeyDown={handleStoriesWithoutTestCasesSearchInputKeyDown}
                                className={`${classes.searchStyle}`}
                            />
                            {storiesWithoutTestCasesSearchQuery && (
                                <InputGroup.Text
                                    onClick={handleStoriesWithoutTestCasesCancelSearch}
                                    className={classes.inputGroupText}
                                >
                                    <BsX className={classes.cancelSearchIcon} />
                                </InputGroup.Text>
                            )}
                        </InputGroup>
                    </div>
                </div>
            </div>

            {!loadingStoriesWithoutTestCases && error && <ErrorDisplay error={error} />}

            <div className={`${classes.cardItems}`}>
                {loadingStoriesWithoutTestCases && (
                    <p className={`${classes.loadingText}`}>Loading...</p>
                )}
                {!error && !loadingStoriesWithoutTestCases && (!storiesWithoutTestCasesPage[storiesWithoutTestCasesCurrentPage] || storiesWithoutTestCasesPage[storiesWithoutTestCasesCurrentPage].length === 0) && (
                    <p className={`${classes.loadingText}`}>No stories found</p>
                )}
                {!loadingStoriesWithoutTestCases && storiesWithoutTestCasesPage[storiesWithoutTestCasesCurrentPage] && storiesWithoutTestCasesPage[storiesWithoutTestCasesCurrentPage].length > 0 && (
                    <div className={`${classes.tableContainerWithPagination}`}>
                        <StoriesWithoutTestCasesTable storiesWithoutTestCases={storiesWithoutTestCasesPage[storiesWithoutTestCasesCurrentPage]} classes={classes} />
                        {storiesWithoutTestCasesTotalPages > 1 && storiesWithoutTestCasesRenderPagination()}
                    </div>
                )}
            </div>
        </div>
    )
};

export default StoriesWithoutTestCases;
