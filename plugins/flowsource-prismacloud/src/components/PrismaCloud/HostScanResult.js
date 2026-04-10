import React, { useEffect, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import HostScanDetail from './HostScanDetail';
import { sanitizeInputName } from '../../Utils';
import {
  Paper,
  Card,
  CardHeader,
  Typography,
  Divider,
  CardContent,
  Alert,
} from '@mui/material';
const Spacer = () => <div className="mb-4" />;


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
function validateInputAndSanitize(hostList, isValidInput) {
  return (sanitizedList) => {
    if (sanitizedList !== hostList) {
      return "Invalid input files.";
    }
    if (!isValidInput(sanitizedList)) {
      return "Host name is empty. Please update the valid host name and try again.";
    }
    return null;
  };
}

const HostScanResult = () => {
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const [scanData, setScanData] = useState([]);
  const [hostUrl, setHostUrl] = useState();
  const [dataAvailable, setDataAvailable] = useState(false);
  const [errorDetail, setErrorDetail] = useState();
  const [isError, setError] = useState(false);

  const { fetch } = useApi(fetchApiRef);
  const entity = useEntity();
  let hostList = entity.entity.metadata.annotations?.["flowsource/prismacloud-defender-hosts"];

  useEffect(() => {
    fetchHostScanData();
  }, []);

  const isNotEmpty = (input) => input && input.trim().length > 0;
  const isValidInput = (input) => {
    return isNotEmpty(input);
  };

  const fetchHostDetail = async () => {
    const hostDetail = await fetch(backendUrl + '/api/code-security/host-url');
    if (!hostDetail.ok) return "";

    const hostDetailJson = await hostDetail.json();
    return getHostUrl(hostDetailJson);
  };

  const getHostUrl = (hostDetailJson) => hostDetailJson?.hostUrl || "";

  const fetchScanData = async (sanitizedList) => {
    const targetUrl = `${backendUrl}/api/code-security/host-scan-result?hostnames=${sanitizedList}`;
    const scanDataResponse = await fetch(targetUrl);
    
    if (!scanDataResponse.ok) {
      handleError(scanDataResponse, sanitizedList);
      return;
    }

    const res = await scanDataResponse.json();
    handleScanDataResponse(res);
  };


  const handleScanDataResponse = (res) => {
      if (isEmptyResponse(res)) {
      setErrorState("No data found");
      return;
    }

    setScanData(res);
    setDataAvailable(true);
  };

  const isEmptyResponse = (res) => res.length === 0 || Object.keys(res).length === 0;

 const handleError = async (response, sanitizedList) => {
    setError(true);
    setDataAvailable(false);
    const errorData = await response.json();
    let errorMessage = 'Error occurred when fetching host scan data for the hosts ' + sanitizedList;
    if (response.status === 503) {
      errorMessage = "This plugin has not been configured with the required values. Please ask your administrator to configure it.";
    }else if (response.status === 404) {
      if( errorData && errorData.error && errorData.error.includes(`Host '${sanitizedList}' does not exist.`)) {
      errorMessage = `Host '${sanitizedList}' does not exist. Please check the host name and try again.`;
      } 
    }
    setErrorDetail(errorMessage);
  };

  const setErrorState = (message) => {
    setError(true);
    setDataAvailable(false);
    setErrorDetail(message);
  };

  const fetchHostScanData = async () => {
    const sanitizedList = sanitizeInputName(hostList);

    const validationError = validateHostList(sanitizedList);
    if (validationError) {
        setErrorState(validationError);
        return;
    }

    try {
        const hostUrl = await fetchHostDetail();
        setHostUrl(hostUrl);
        await fetchScanData(sanitizedList);
    } catch (err) {
        setErrorState(`Error occurred when fetching host scan data for the hosts ${sanitizedList}`);
    }
};

const validateHostList = validateInputAndSanitize(hostList, isValidInput);



  return (
    dataAvailable ? (
      <>
        {scanData.map(item => (
          <HostScanDetail key={item.id} hostdata={item} hosturl={hostUrl} />
        ))}
      </>
    ) : (
      <>
        {isError && <DisplayError err={errorDetail} />}
      </>
    )
  );
};

export default HostScanResult;
