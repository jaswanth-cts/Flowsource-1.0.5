import React, { useState } from 'react';
import { IconButton, Popover, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';

import cssClasses from './PluginVersionCss';

import frontEndPackageJson from '../../../package.json';

import log from 'loglevel';


const PluginVersion = () => {
    
    const classes = cssClasses();

    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-selenium/';

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

            const value = JSON.parse(sessionStorage.getItem('SeleniumBackendVersion'));

            if (value !== null && value !== 'null' && value !== undefined && value !== '-' && value !== '') {
                setBackendVersion(value);
            } else {
                //Getting and setting backend version.
                const response = await fetch(backendBaseApiUrl + 'plugin-versions');

                if (response.ok) {
                    const backendVersionInfo = await response.json();

                    if (backendVersionInfo.version != null || backendVersionInfo.version != undefined) {
                        setBackendVersion(backendVersionInfo.version);
                        sessionStorage.setItem('SeleniumBackendVersion', JSON.stringify(backendVersionInfo.version));
                    } else {
                        setBackendVersion('-');
                        sessionStorage.setItem('SeleniumBackendVersion', '-');
                    }
                } else {
                    setBackendVersion('-');
                    sessionStorage.setItem('SeleniumBackendVersion', '-');
                }
            }
        } catch (error) {
            log.error('Error: ' + error);
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
            <IconButton sx={{ cursor: 'pointer', '&:hover': { color: 'navy'}, }}
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
                <Paper>
                    <Typography variant="h6" component="div" style={{ padding: '10px' }}>
                        Versions
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Frontend:</TableCell>
                                    <TableCell>{frontendVersion}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Backend:</TableCell>
                                    <TableCell>{backendVersion}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Popover>
        </div>
    );
};

export default PluginVersion;