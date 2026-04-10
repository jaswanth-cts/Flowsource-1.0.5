import React, { useState } from 'react';
import { IconButton, Popover, Typography, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';

import cssClasses from './PluginVersionCss';

import frontEndPackageJson from '../../../package.json';


const PluginVersion = () => {
    
    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-dora-metrics/';

    const [anchorEl, setAnchorEl] = useState(null);
    const [frontendVersion, setFrontendVersion] = useState(null);
    const [backendVersion, setBackendVersion] = useState(null);
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    async function getVersion() {
        try 
        {
            //Getting and setting frontend version.
            if (frontEndPackageJson.version != null || frontEndPackageJson.version != undefined) {
                setFrontendVersion(frontEndPackageJson.version);
            } else {
                setFrontendVersion('-');
            }

            const value = JSON.parse(sessionStorage.getItem('DoraBackendVersion'));

            if (value !== null && value !== 'null' && value !== undefined && value !== '-' && value !== '') {
                setBackendVersion(value);
            } else {
                //Getting and setting backend version.
                const response = await fetch(backendBaseApiUrl + 'plugin-versions');

                if (response.ok) {
                    const backendVersionInfo = await response.json();

                    if (backendVersionInfo.version != null || backendVersionInfo.version != undefined) {
                        setBackendVersion(backendVersionInfo.version);
                        sessionStorage.setItem('DoraBackendVersion', JSON.stringify(backendVersionInfo.version));
                    } else {
                        setBackendVersion('-');
                        sessionStorage.setItem('DoraBackendVersion', '-');
                    }
                } else {
                    setBackendVersion('-');
                    sessionStorage.setItem('DoraBackendVersion', '-');
                }
            }
        } catch (error) {
            console.error('Error: ' + error);
        }
    };

    const handleMouseEnter = (event) => {
        setAnchorEl(event.currentTarget);
        getVersion();
    };
    
    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton sx={{ cursor: 'pointer', '&:hover': { color: '#000048'}, }}
                aria-describedby={id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
            >
                <InfoIcon className={`${classes.InfoIcon}`} />
            </IconButton>
            <Popover
                id={id}
                sx={{ pointerEvents: 'none' }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handleMouseLeave}
                disableRestoreFocus
            >
                <Paper className={`${classes.cardSection}`}>
                    <Typography variant="subtitle1" component="div" className={`${classes.infoHeading}`}>
                        Plugin Version
                    </Typography>
                    <hr className={`${classes.hr}`} />
                    <div>
                        <div className={`${classes.frontEndSect}`} >
                            <div className={`${classes.infoSection}`} >
                                <Typography variant="subtitle2">
                                    Frontend:
                                </Typography>
                                <Typography variant="subtitle2">
                                    {frontendVersion}
                                </Typography>
                            </div>
                        </div>
                        <div>
                            <div className={`${classes.infoSection}`} >
                                <Typography variant="subtitle2">
                                    Backend:
                                </Typography>
                                <Typography variant="subtitle2">
                                    {backendVersion}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </Paper>
            </Popover>
        </div>
    );
};

export default PluginVersion;