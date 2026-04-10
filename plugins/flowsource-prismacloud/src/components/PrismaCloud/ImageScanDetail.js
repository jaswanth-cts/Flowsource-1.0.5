import React, { useEffect, useState } from 'react';

import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

import { Bar } from 'react-chartjs-2';

import cssClasses from './PrismaCloudCss';

import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { Tooltip } from '@material-ui/core';
import {
    Paper,
    Card,
    CardHeader,
    Typography,
    Divider,
    CardContent,
    Alert,
} from '@mui/material';
import PluginVersion from '../PluginVersion/PluginVersion';

const Spacer = () => <div className="mb-4" />; // Spacer component

const DisplayError = (props) => {

    return (
        <div>
            <Card>
                <CardHeader title={<Typography variant="h6">Error</Typography>} />
                <Divider />
                <CardContent>
                    <Paper role="alert" elevation={0}>
                        <Alert severity="error">{props.err}</Alert>
                    </Paper>
                </CardContent>
            </Card>
            <Spacer />
        </div>
    );
};

const DisplayLoading = () => {
    return <div>Loading...</div>;
};

function handleScanDataResponseCallback(handleDataAvailable, handleServiceUnavailable, handleNoDataFound, imgSource) {
    return (res, status) => {
        if (res.dataState === 'DATA_AVAILABLE') {
            handleDataAvailable(res);
        } else if (status === 503) {
            handleServiceUnavailable();
        } else {
            handleNoDataFound(imgSource);
        }
    };
}
const ImageScanDetail = (props) => {
    const { imgSource, baseUrl } = props;
    const [scanData, setScanData] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [dataAvailable, setDataAvailable] = useState(false);
    const [, setError] = useState(false);
    const [errorDetail, setErrorDetail] = useState();

    const { fetch } = useApi(fetchApiRef);

    useEffect(() => {
        fetchScanData();
    }, [baseUrl, imgSource]);

    const fetchScanData = async () => {
        try {
            const targetUrl = `${baseUrl}/api/code-security/image-scan-result?filter=${imgSource}`;
            const result = await fetch(targetUrl);
            const res = await result.json();
            handleScanDataResponse(res, result.status);
        } catch (err) {
            handleError(err);
        }
    };

   // Function to handle the case when data is available
const handleDataAvailable = (res) => {
    setScanData(res);
    setDataAvailable(true);
    setLoading(false);
};

// Function to handle the case when service is unavailable
const handleServiceUnavailable = () => {
    setErrorState(
        `This plugin has not been configured with the required values. Please ask your administrator to configure it`
    );
};

// Function to handle the default case when no data is found
const handleNoDataFound = (imgSource) => {
    setErrorState(`Container Image: ${imgSource} :- No Data found`);
};

// Main function to handle scan data response
const handleScanDataResponse = handleScanDataResponseCallback(handleDataAvailable, handleServiceUnavailable, handleNoDataFound, imgSource);

    const handleError = (err) => {
        setLoading(false);
        setDataAvailable(false);
        setError(true);
        setErrorDetail(`${err} - ${imgSource}`);
    };

    const setErrorState = (message) => {
        setError(true);
        setLoading(false);
        setDataAvailable(false);
        setErrorDetail(message);
    };

    const renderLayers = false;
    const colorCodes = [
        { key: 'critical', bgcolor: 'rgba(251, 104, 104, 1)' },
        { key: 'moderate', bgcolor: 'rgba(255, 176, 59, 1)' },
        { key: 'high', bgcolor: 'rgba(76, 180, 255, 1)' },
        { key: 'medium', bgcolor: 'rgba(201, 96, 251, 1)' },
        { key: 'low', bgcolor: 'rgba(110, 210, 101, 1)' }
    ];

    const classes = cssClasses();
    let cData = [];
    scanData.severities?.forEach((el) => {
        cData.push({
            label: el.name,
            backgroundColor: colorCodes.find(item => item.key === el.name)?.bgcolor,
            borderColor: "rgba(255,99,132,1)",
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: el.vulnerabilities
        });
    });

    const barData = {
        labels: scanData?.packages?.map(o => o.name),
        datasets: cData
    };

    const options = {
        plugins: {
            datalabels: {
                display: true,
                color: "black",
                formatter: Math.round,
                anchor: "end",
                offset: -20,
                align: "start"
            }
        },
        responsive: true,
        legend: {
            display: false
        },
        type: "bar"
    };

    // Define the function to render the image
const renderImage = (scanData) => {
    if (scanData.raw?.instances) {
        const image = scanData.raw.instances[0].image;
        return (
            <Tooltip title={image} arrow>
                <span>
                    {image.length > 45 ? `${image.substring(0, 45)}...` : image}
                </span>
            </Tooltip>
        );
    }
    return '';
};

// Define the function to render the error status
const renderErrorStatus = (scanData) => {
    return scanData.raw?.err === "" ? 'Passed' : 'Failed';
};
const content = isLoading ? (
    <DisplayLoading />
  ) : (
    <DisplayError err={errorDetail} />
  );

    return (
        dataAvailable ? (
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className={classes.backgroundClass}>
                            <div className={`row`}>
                                                                    <div className={`col-12 text-end`}>
                                                                        <PluginVersion />
                                                                    </div>
                                                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="card-title">
                                                            <span className="me-2">
                                                                <b> Scan Summary</b>
                                                            </span>
                                                        </h6>
                                                    </div>
                                                    <div className={`card-body ${classes.cardImageScanTable}`}>
                                                        <table className={`table ms-2 ${classes.tableStriped1} ${classes.ImageScantableStyle} table-bordered`}>
                                                            <tbody>
                                                                <tr>
                                                                    <td>Image name:</td>
                                                                    <td>{renderImage(scanData)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Scan time:</td>
                                                                    <td>{scanData.raw?.scanTime}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Scan status:</td>
                                                                    <td>{renderErrorStatus(scanData)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className={`card ${classes.cardImageScan}`}>
                                            <div className="card-header">
                                                <h6 className="card-title">
                                                    <span className="me-2">
                                                        <b>Vulnerabilities by layers/packages</b>
                                                    </span>
                                                </h6>
                                            </div>
                                            <div className={`card-body ${classes.cardImageScanStyle}`}>
                                                <Bar data={barData} options={options} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {renderLayers && (
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className={`card-body ${classes.cardStyle}`}>
                                                    <h6 className="card-title mt-0 mb-2">
                                                        <span className="me-2"><b className="ms-4 mt-2">Image layers</b></span>
                                                    </h6>
                                                    <table className={`table ms-4 ${classes.tableStriped1} table-bordered`}>
                                                        <tbody>
                                                            {props.scanData.raw?.history?.map((obj) => (
                                                                <tr key={obj.created}>
                                                                    <td className={`${classes.colStyle} ${classes.fixedLenCol}`}>{obj.instruction}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            content
        )
    );
};

export default ImageScanDetail;
