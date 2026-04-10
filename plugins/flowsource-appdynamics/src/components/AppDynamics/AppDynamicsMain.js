import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './AppDynamicsMainCss.js';
import BarChart from './BarChart.js';
import { Modal } from 'react-bootstrap';
import copyIcon from './Icons/copy.png';
import detailIcon from './Icons/detail.png';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { IconButton } from '@material-ui/core';
import { Paper, Card, CardHeader, Typography, Divider, CardContent, Alert } from '@mui/material';
import PluginVersion from '../PluginVersion/PluginVersion';
import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';

import log from 'loglevel';

const LoadingComponent = () => (
    <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '20vh', marginTop: '15vh' }}>
        Loading...
    </div>
);

const ErrorComponent = ({ error }) => (
    <div className="card ms-1 me-1 mb-1 mt-2">
        <div className="card-header">
            <h6 className="mb-0">Error</h6>
        </div>
        <div className="card-body">
            <div className="alert alert-danger mt-2 mb-2" role="alert">
                {error}
            </div>
        </div>
    </div>
);

const Spacer = () => <div className="mb-4" />;
const AppDynamicsMain = () => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-appdynamics/';
    const [error, setError] = useState(null);
    const entity = useEntity();
    const applicationName = entity.entity.metadata.annotations['flowsource/appdynamics-application-name'];

    let arrKeyCounter = 0;
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (showModal)
            setActiveTab('stacktrace');
    }, [showModal]);

    const [tableData, setTableData] = useState([]);
    const [barchartdata, setBarchartdata] = useState({});
    const [stacktraceText, setStacktraceText] = useState();
    const [isLoading, setLoading] = useState(true);
    const [errorData, setErrorData] = useState(null);

    const [isAnnotationMissing, setAnnotationMissing] = useState(false);
    const [isNoData, setNoData] = useState(false);


    async function getAppDynamics() {
        try {
            const response = await fetch(`${backendBaseApiUrl}appDynamics?applicationName=${applicationName}`);
            const errorstatus = response.status;
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    if (data.errorDetails.length === 0) {
                        setNoData(true); //We will show the No Data Available page if the data is empty.
                    } else {
                        setTableData(data.errorDetails);
                        setBarchartdata(data.errorCountPerDay);
                    }
                } else {
                    setNoData(true); //We will show the No Data Available page if the data is empty.
                }
                setLoading(false);
            } else if (response.status === 503) {
                setErrorData(`This plugin has not been configured with the required values. Please ask your administrator to configure it.`);
                setLoading(false);
            }
            else if(response.status === 404) {
                const errorData = await response.json();

                if(errorData.error.includes('Invalid application id')) {
                    setError("No project could be found with id \"" + applicationName + "\" in AppDynamics. Please check the project key and try again.");
                    setLoading(false);
                    return;
                } else {
                    setError(`Error fetching data from AppDynamics: ${errorData.error} (Status code: ${errorstatus})`);
                    setLoading(false);
                    return;
                }
            }
            else {
                const errorData = await response.json();
                log.info('Error fetching AppDynamics Application Errors:', JSON.stringify(errorData));

                setNoData(true);
                setError(`Error fetching data from AppDynamics: ${errorData.error} (Status code: ${errorstatus})`);
                setLoading(false);
            }
        } catch (error) {
            log.error('Error:', error);
            setNoData(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        if ((applicationName === undefined || applicationName === null || applicationName === '')) {
            setAnnotationMissing(true);
            setLoading(false);
        } else {
            getAppDynamics();
        }
    }, []);

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

    const calculatePaginationRange = () => {
        const halfPagesToShow = Math.floor(pagesToShow / 2);
        const adjustedStartPage = Math.max(1, currentPage - halfPagesToShow);
        const adjustedEndPage = Math.min(totalPages, currentPage + halfPagesToShow);

        return { startPage: adjustedStartPage, endPage: adjustedEndPage };
    };

    const { startPage, endPage } = calculatePaginationRange();

    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;
    const [, setCopyMsg] = useState(false);
    const [activeTab, setActiveTab] = useState('stacktrace');
    const copyText = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => log.info('Text copied successfully'))
            .catch((error) => log.error('Error copying text: ', error));
        setCopyMsg(true);
    };
    const handleIconClick = (rowData) => {
        setStacktraceText(rowData.stackTrace);
        setShowModal(true);
    };

    if (isLoading) {
        return <LoadingComponent />;
    }
    if (error) {
        return <ErrorComponent error={error} />;
    }
    const getClassName = (baseClass, condition, trueClass, falseClass = '') => {
        return `${baseClass} ${condition ? trueClass : falseClass}`.trim();
    };

    function checkHasBarChartData() {
        if (barchartdata && Object.keys(barchartdata).length > 0) {
            return <BarChart values={barchartdata} />;
        } else {
            return '';
        }
    };

    const previousButtonClass = getClassName('page-item', isPreviousDisabled, 'disabled');
    const nextButtonClass = getClassName('page-item', isNextDisabled, 'disabled');
    const stacktraceTabClass = getClassName(classes.tab, activeTab === 'stacktrace', classes.activeTab);

    function renderAppDynamicPage() {
        if (isAnnotationMissing) {
            return <NoAnnotationTag />;
        } else if(isNoData) {
            return <NoDataTag error={error} />
        } else if(errorData) {
            return (
                <div>
                    <Card>
                        <CardHeader title={<Typography variant="h6">Error</Typography>} />
                        <Divider />
                        <CardContent>
                            <Paper role="alert" elevation={0}>
                                <Alert severity="error">{errorData}</Alert>
                            </Paper>
                        </CardContent>
                    </Card>
                    <Spacer />
                </div>
            );
        } else {
            return (
                <div>
                    <div className={`${classes.pluginHeading}`}>
                        <div>
                            <div className={`row mt-2`}>
                                <div className={`col-12`}>
                                    <h2 className={`mt-2 ms-4`} style={{ fontSize: '1.5rem' }}>Application Error Details</h2>
                                </div>
                            </div>
                        </div>
                        <div className={`${classes.pluginVersion}`}>
                            <PluginVersion />
                        </div>
                    </div>
                    <div>
                        <div className="ms-4 me-4 mb-4 table-responsive" style={{ marginTop: '1.5rem' }}>
                            <table className={`table ${classes.tableStriped} ${classes.table}`}>
                                <thead>
                                    <tr className={`${classes.tableHead}`}>
                                        <th scope="col">Date</th>
                                        <th scope="col">Time</th>
                                        <th scope="col">Summary</th>
                                        <th scope="col">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTableData.map((row, index) => (
                                        <tr key={"AppErrorDetials" + arrKeyCounter++}>
                                            <td style={{ fontSize: '105%' }}>{row.serverStartTime}</td>
                                            <td style={{ fontSize: '105%' }}>{row.localStartTime}</td>
                                            <td style={{ textAlign: 'left', fontSize: '105%', paddingLeft: '2rem' }}>{row.summary.length > 100 ? row.summary.substring(0, 100) + '...' : row.summary}</td>                                            <td>
                                                <IconButton onClick={() => handleIconClick(row)} color="inherit" className={`${classes.detailButton}`}>
                                                    <img style={{ width: '81%' }} src={detailIcon} alt="button icon" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {tableData.length === 0 ? '' : (
                                <nav aria-label="Page navigation example">
                                    <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                                        <li className={previousButtonClass}>
                                            <a aria-label="Previous" className="page-link" href="#" tabIndex="-1" onClick={() => handlePageChange(currentPage - 1)}>
                                                <span aria-hidden="true">«</span>
                                            </a>
                                        </li>
                                        {startPage > 1 && (
                                            <li className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        )}
                                        {pagesArray.slice(startPage - 1, endPage).map((index) => (
                                            <li key={index} className={`page-item ${classes.numCss}`}>
                                                <a className={`page-link ${index + 1 === currentPage ? 'Mui-selected' : ''}`} href="#" onClick={() => handlePageChange(index + 1)}>
                                                    {index + 1}
                                                </a>
                                            </li>
                                        ))}
                                        {endPage < totalPages && (
                                            <li className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        )}
                                        <li className={nextButtonClass}>
                                            <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                                                <span aria-hidden="true">»</span>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                    <div className={`row justify-content-center`}>
                        <div className={`card ${classes.cardCss}`}>
                            <div className={`card-text ms-2 mt-2`}>
                                <div className={`ms-1 mb-2`}><b>Application Errors </b></div>
                                {checkHasBarChartData()}
                            </div>
                        </div>
                    </div>
                    <div>
                        <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
                            <div className={`row justify-content-start mt-4 ms-1 pb-2`}>
                                <div className={`col-sm-2`} style={{ width: '10%' }}>
                                    <div className={stacktraceTabClass} onClick={() => setActiveTab('stacktrace')}>
                                        Stacktrace
                                    </div>
                                </div>
                            </div>

                            <Modal.Body style={{ overflowY: 'auto', maxHeight: 'calc(88vh - 210px)' }}>
                                {activeTab === 'stacktrace' && (
                                    <div>
                                        <div className={`row float-end`} style={{ margintop: '-4rem' }}>
                                            <IconButton onClick={() => {
                                                copyText(stacktraceText);
                                                alert('Copied successfully!');
                                            }} color="inherit" className={`${classes.copyButton}`}>
                                                <img style={{ height: '1.7rem' }} src={copyIcon} alt="button icon" />
                                            </IconButton>
                                        </div>
                                        <div className={`row ${classes.rowButton}`}>
                                            <div>
                                                {stacktraceText}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <button onClick={() => setShowModal(false)} className={`${classes.Footer}`}>
                                    Close
                                </button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            );
        }
    }

    return (
        <>
            {renderAppDynamicPage()}
        </>
    );
};

const NoDataTag = ({ error }) => {
    return (
        <div className={`row justify-content-center`}>
            <div className={`card`}>
                <div className={`card-text ms-2 mt-2`}>
                    <div className={`mt-2 ms-2`} style={{ fontSize: '1.5rem' }}>
                        <b>Application Error Details</b>
                    </div>
                    {(!error) ? (
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: '1.2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                            <b> No data available </b>
                        </div>) : (
                        <div style={{ paddingBottom: '1rem', paddingTop: '1rem' }}>
                            <Card sx={{ width: '100%' }}>
                                <CardHeader title={<Typography variant="h6">Error</Typography>} />
                                <Divider />
                                <CardContent>
                                    <Paper role="alert" elevation={0}>
                                        <Alert severity="error">{error}</Alert>
                                    </Paper>
                                </CardContent>
                            </Card>
                        </div>)
                    }
                </div>
            </div>
        </div>
    );
};

const NoAnnotationTag = () => {
    return (
        <div className='mt-2 ms-4 me-4 mb-4'>
            <EntitySwitch>
                <EntitySwitch.Case>
                    <EmptyState
                        title="No AppDynamics page is available for this entity"
                        missing="info"
                        description="Need to add missing annotations to your component if you want to see the AppDynamics page."
                    />
                </EntitySwitch.Case>
            </EntitySwitch>
        </div>
    );
};

export default AppDynamicsMain;

