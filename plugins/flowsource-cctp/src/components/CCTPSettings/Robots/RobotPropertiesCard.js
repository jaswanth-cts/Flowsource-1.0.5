import React, { useState, useEffect } from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import { Dialog, Typography } from '@material-ui/core';
import cssClasses from './RobotsMainPageCss';

import CLOSE_ICON from '../../Icons/popup_close_icon.png';

import log from 'loglevel';

const RobotPropertiesCard = ({ robotId, setIsDisplayRobotProperties }) => {
    
    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
    
    const [open, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [noDataAvailable, setNoDataAvailable] = useState(false);
    
    const [robotPropData, setRobotPropData] = useState([]);

    const handleClose = () => {
      setOpen(false);
      setIsDisplayRobotProperties(false);
    };

    async function getRobotPropDataFromBackend() {
        try 
        {
            setOpen(true);

            const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/${robotId}/token`);

            if (response.ok) 
            {
                const data = await response.json();

                if(data !== null && data !== undefined) 
                {
                    const targetUrlResp = await fetch(`${backendBaseApiUrl}cctp-config`);
                    const robotUrlJson = await targetUrlResp.json();

                    const robotUrl = robotUrlJson.url;

                    if(robotUrl === null || robotUrl === undefined || robotUrl.length === 0) {
                        log.info('Error: Robot URL is null or undefined.');
                        setNoDataAvailable(true);
                    }

                    const robotProperties = {
                        'leap.robot.host': robotUrl + '/execution',
                        'leap.robot.name': data.name,
                        'leap.robot.working_dir': '.',
                    };

                    setRobotPropData(robotProperties);
                } else {
                    log.info('Error: Data returned is null or undefined. API returned: ' + response.status);
                    setNoDataAvailable(true);
                }
            } else {
                log.info('Error: API returned: ' + response.status + ' - ' + response.statusText);
                setNoDataAvailable(true);
            }

        } catch (error) {
            log.info('Error in getRobotPropDataFromBackend function: ', error);
            setNoDataAvailable(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(async () => {
        getRobotPropDataFromBackend();
    }, []);

    if (isLoading) {
        return (
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"sm"} >
                <div className={`${classes.cardHeading}`}>
                    <Typography variant="h6" component="div" className={`${classes.cardHeadingText}`}>
                        Robot.Properties
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
            </Dialog >
        );
    }
  
    return (
        <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"sm"} >
            <div className={`${classes.cardHeading}`}>
                <Typography variant="h6" component="div" className={`${classes.cardHeadingText}`}>
                    Robot.Properties
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
                    {noDataAvailable === true ?
                        (<p className={`${classes.dataUnavailableForPopUp}`}>
                            <b>No Data Available</b>
                        </p>) :
                        <div>
                            <div>
                                leap.robot.host = {robotPropData['leap.robot.host']}
                            </div>
                            <div>
                                leap.robot.name = {robotPropData['leap.robot.name']}
                            </div>
                            <div>
                                leap.robot.working_dir = {robotPropData['leap.robot.working_dir']}
                            </div>
                            
                        </div>
                    }
                </div>
            </div>
        </Dialog>
    );
};

export default RobotPropertiesCard;