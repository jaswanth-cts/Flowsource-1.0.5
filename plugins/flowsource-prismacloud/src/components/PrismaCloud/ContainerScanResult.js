import React, { useEffect, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import ContainerScanDetail from './ContainerScanDetail';
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

const ContainerScanResult = (prop) => {
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const [scanData, setScanData] = useState([]);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [errorDetail, setErrorDetail] = useState();
  const [isError, setError] = useState(false);

  const { fetch } = useApi(fetchApiRef);
  const entity = useEntity();

  let namespaces = entity.entity.metadata.annotations?.["flowsource/prismacloud-defender-container-namespaces"];
  let clusterNames = entity.entity.metadata.annotations?.["flowsource/prismacloud-defender-cluster-name"];
  let imageNames = entity.entity.metadata.annotations?.["flowsource/prismacloud-defender-container-deployment-images"];

  useEffect(() => {
    fetchScanData();
  }, []);

  const isValidInput = (input) => {
    return input != null && input !== undefined && input.trim().length > 0;
  };

  const fetchScanData = async () => {
    try {
      const namespaceList = sanitizeInputName(namespaces);
      const imgNames = sanitizeInputName(imageNames, "/:");
      const clusterList = sanitizeInputName(clusterNames);

      if (isValidInput(namespaceList) && isValidInput(imgNames)) {
        const targetUrl = `${backendUrl}/api/code-security/container-scan-result?clusters=${clusterList}&namespaces=${namespaceList}&images=${imgNames}`;
        const scanDataResponse = await fetch(targetUrl);

        if (scanDataResponse.ok) {
          const res = await scanDataResponse.json();
          handleScanDataResponse(res);
        } else {
          handleError(scanDataResponse);
        }
      } else {
        setErrorState("Invalid input: missing namespace or image names.");
      }
    } catch (err) {
      setErrorState("Invalid configuration!");
    }
  };

  const handleScanDataResponse = (res) => {
    if (Object.keys(res).length > 0) {
      const temp = Object.keys(res).map(key => {
        const obj = res[key][0];
        obj.ReplicaSet = res[key].length;
        return obj;
      });
      setScanData(temp);
      setDataAvailable(true);
    } else {
      setErrorState("No data found");
    }
  };

  const handleError = (response) => {
    setError(true);
    setDataAvailable(false);

    if (response.status === 503) {
      setErrorDetail("This plugin has not been configured with the required values. Please ask your administrator to configure it.");
    } else {
      setErrorDetail(`${response.status} Error occurred!`);
    }
  };

  const setErrorState = (message) => {
    setError(true);
    setDataAvailable(false);
    setErrorDetail(message);
  };

  return (
    <>
      {dataAvailable ? (
        scanData.map(item => (
          <ContainerScanDetail key={item.id} hostdata={item} hosturl={""} />
        ))
      ) : (
        isError && <DisplayError err={errorDetail} />
      )}
    </>
  );
};

export default ContainerScanResult;
