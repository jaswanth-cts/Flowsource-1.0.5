import React, { useState, useEffect } from 'react';

import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import { Dialog, Typography } from '@material-ui/core';
import cssClasses from '../../CCTPSettings/Robots/RobotsMainPageCss';

import CLOSE_ICON from '../../Icons/popup_close_icon.png';

const ReportClientConfigurationCard = ({ projectName, setIsDisplayReportConfig }) => {
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    const [open, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [noDataAvailable, setNoDataAvailable] = useState(false);

    const [reportConfigData, setReportConfigData] = useState({});

    const handleClose = () => {
        setOpen(false);
        setIsDisplayReportConfig(false);
    };

    async function getReportConfigDataFromBackend() {
        try {
            setOpen(true);

            const targetUrlResp = await fetch(`${backendBaseApiUrl}cctp-config`);
            const reportUrlJson = await targetUrlResp.json();
            const reportUrl = reportUrlJson.url;
    
            if (!reportUrl) {
                console.log('Error: Report URL is null or undefined.');
                return;
            }
    
            // Getting the token from the API
            const tokenResp = await fetch(`${backendBaseApiUrl}cctp-proxy/reports/dashboard/projects/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
            });
    
            if (!tokenResp.ok) {
                throw new Error(`Token fetch failed with status: ${tokenResp.status}`);
            }
    
            const tokenJson = await tokenResp.json();
            const token = tokenJson.id;
    
            const reportConfig = {
                'leap.report.enabled': 'true',
                'leap.report.host': `${reportUrl}/reports`,
                'leap.report.project': projectName,
                'leap.report.execution': '<execution-name>',
                'leap.report.token': token, 
            };

            setReportConfigData(reportConfig);
        } catch (error) {
            console.log('Error in getReportConfigDataFromBackend function: ', error);
            setNoDataAvailable(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getReportConfigDataFromBackend();
    }, []);

    if (isLoading) {
        return (
            <Dialog
                open={open}
                onClose={null} // Disable default onClose behavior
                fullWidth={true}
                maxWidth={"sm"}
            >
                <div className={`${classes.cardHeading}`}>
                    <Typography variant="h6" component="div" className={`${classes.cardHeadingText}`}>
                        Report Client Configuration
                    </Typography>
                    <a href="#">
                        <img
                            src={CLOSE_ICON}
                            alt="Close Popup"
                            className={`${classes.cardCloseButton}`}
                            onClick={handleClose}
                        />
                    </a>
                </div>
                <div className={`App p-3 ${classes.isLoadingStyle}`}>
                    Loading...
                </div>
            </Dialog>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={null} // Disable default onClose behavior
            fullWidth={true}
            maxWidth={"sm"}
        >
            <div className={`${classes.cardHeading}`}>
                <Typography variant="h6" component="div" className={`${classes.cardHeadingText}`}>
                    Report Client Configuration
                </Typography>
                <a href="#">
                    <img
                        src={CLOSE_ICON}
                        alt="Close Popup"
                        className={`${classes.cardCloseButton}`}
                        onClick={handleClose}
                    />
                </a>
            </div>
            <div className={`${classes.cardBody}`}>
                <div className={`${classes.cardContent}`}>
                    {noDataAvailable === true ? (
                        <p className={`${classes.dataUnavailableForPopUp}`}>
                            <b>No Data Available</b>
                        </p>
                    ) : (
                        <div>
                            <div>
                                leap.report.enabled = {reportConfigData['leap.report.enabled']}
                            </div>
                            <div>
                                leap.report.host = {reportConfigData['leap.report.host']}
                            </div>
                            <div>
                                leap.report.project = {reportConfigData['leap.report.project']}
                            </div>
                            <div>
                                leap.report.execution = {reportConfigData['leap.report.execution']}
                            </div>
                            <div>
                                leap.report.token = {reportConfigData['leap.report.token']}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default ReportClientConfigurationCard;