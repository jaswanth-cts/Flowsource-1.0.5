import React, { useState, useEffect, useCallback } from 'react';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import cssClasses from './ZephyrPageCss.js';
import DefectsTable from './DefectsTable';
import { FormControl, InputGroup } from 'react-bootstrap';
import { BsSearch, BsX } from 'react-icons/bs';
import ErrorDisplay from './ErrorDisplay.js';

const defectsMaxResults = 10;

const Defects = ({ backendBaseApiUrl, projectKey, onlyActiveSprints, durationDaysCatalog }) => {

    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
        
    const [error, setError] = useState();

    const [loadingDefects, setLoadingDefects] = useState(false);
    const [defectsPage, setDefectsPage] = useState({});
    const [defectsCurrentPage, setDefectsCurrentPage] = useState(1);
    const [defectsTotalPages, setDefectsTotalPages] = useState(0);
    const [defectsSearchQuery, setDefectsSearchQuery] = useState('');

    const handleError = async (response) => {
        let errorMessage = 'Error fetching details from Zephyr. ';
        try {
            const errorBody = await response.json();
            if (errorBody.error.includes('No project found'))
                {
                    errorMessage = "No defects could be found with key \"" + projectKey + "\" in Zephyr. Please check the project key and try again.";
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

    const fetchDefects = useCallback(async (searchQuery) => {
        setLoadingDefects(true);
        try {
            const url = `${backendBaseApiUrl}defects?projectKey=${projectKey}&status=${searchQuery}&page=${defectsCurrentPage}&maxResults=${defectsMaxResults}&onlyActiveSprints=${onlyActiveSprints}&durationDaysCatalog=${durationDaysCatalog}`;
			const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setDefectsPage(prevPages => ({
                    ...prevPages,
                    [defectsCurrentPage]: result.issues
                }));
                const totalPages = Math.ceil(result.total / defectsMaxResults);
                setDefectsTotalPages(totalPages);
                setError('');
            } else {
                handleError(response);
                setDefectsPage({});
            }
        } catch (fetchError) {
            handleError(fetchError);
            setDefectsPage({});
        } finally {
            setLoadingDefects(false);
        }
    }, [backendBaseApiUrl, projectKey, defectsCurrentPage, onlyActiveSprints, durationDaysCatalog, fetch]);

    useEffect(() => {
        if (!defectsPage[defectsCurrentPage] && !loadingDefects && (!error || error === '') && defectsSearchQuery === '') {
            fetchDefects('');
        }
    }, [defectsCurrentPage, fetchDefects, defectsPage, loadingDefects, error, defectsSearchQuery]);


    useEffect(() => {
        setDefectsPage({});
        setDefectsCurrentPage(1); // Reset to first page when onlyActiveSprints changes
    }, [onlyActiveSprints]);

    const handleDefectsSearchInputChange = (event) => {
        setDefectsSearchQuery(event.target.value);
    };

    const defectsRenderPagination = () => {
        const pages = [];
        for (let i = 1; i <= defectsTotalPages; i++) {
            const isCurrentPage = i === defectsCurrentPage;
            pages.push(
                <button
                    key={i}
                    onClick={() => setDefectsCurrentPage(i)}
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

    const handleDefectsSearchInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            const searchQuery = event.target.value;
            setDefectsCurrentPage(1);
            setDefectsPage([]); // Clear previous results
            fetchDefects(searchQuery);
        }
    };

    const handleDefectsCancelSearch = () => {
        setDefectsSearchQuery('');
        fetchDefects('');
    };

    return (
        <div className={`${classes.tableContainer}`}>
            <div className={`${classes.tableHeading}`}>
                <h2 className={classes.headingText}>
                    Defects
                </h2>
                <div className={`${classes.searchField}`}>
                    <div>
                        <InputGroup>
                            <InputGroup.Text className={classes.inputGroupText}>
                                <BsSearch className={classes.searchIcon} />
                            </InputGroup.Text>
                            <FormControl
                                placeholder="Search by Status"
                                value={defectsSearchQuery}
                                onChange={handleDefectsSearchInputChange}
                                onKeyDown={handleDefectsSearchInputKeyDown}
                                className={`${classes.searchStyle}`}
                            />
                            {defectsSearchQuery && (
                                <InputGroup.Text
                                    onClick={handleDefectsCancelSearch}
                                    className={classes.inputGroupText}
                                >
                                    <BsX className={classes.cancelSearchIcon} />
                                </InputGroup.Text>
                            )}
                        </InputGroup>
                    </div>
                </div>
            </div>

            {!loadingDefects && error && <ErrorDisplay error={error} />}

            <div className={`${classes.cardItems}`}>
                {loadingDefects && (
                    <p className={`${classes.loadingText}`}>Loading...</p>
                )}
                {!error && !loadingDefects && (!defectsPage[defectsCurrentPage] || defectsPage[defectsCurrentPage].length === 0) && (
                    <p className={`${classes.loadingText}`}>No defects found</p>
                )}
                {!loadingDefects && defectsPage[defectsCurrentPage] && defectsPage[defectsCurrentPage].length > 0 && (
                    <div className={`${classes.tableContainerWithPagination}`}>
                        <DefectsTable defects={defectsPage[defectsCurrentPage]} classes={classes} />
                        {defectsTotalPages > 1 && defectsRenderPagination()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Defects;
