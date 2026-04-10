import React, { useCallback, useMemo , useEffect, useState } from 'react';

import cssClasses from './PrismaCloudCss';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi, identityApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { EntitySwitch, } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PieChart from './PieChart';
import excelIcon from './icons/excel-file.png';
import CircularProgress from '@material-ui/core/CircularProgress';
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


function RenderPrismaData(classes, filteredKeys, summayRows, summary, pieChartData) {
  return useMemo(() => React.memo(() => {
    return (
      <div className={`${classes.mainBackgroundRender}`}>
        <div className={`${classes.backgroundClass}`}>
          <div className={`row`}>
            <div className={`col-6`}>
              <div className={`card ms-4`}>
                <div className={`card-body ${classes.cardStyle}`}>
                  <h6 className={`card-title mt-0 mb-2`}>

                    <span className={`${classes.pnTitle} me-2`}><b className={`ms-4 mt-2`}>Summary</b>
                    </span>

                  </h6>
                  <table className={`table ms-4 ${classes.tableStriped1} table-bordered`}>
                    <tbody>
                      {filteredKeys.map((key) => (
                        <tr key={key}>
                          <td className={`${classes.colStyle}`}>{summayRows[key] ? summayRows[key] : 0}</td>
                          <td className={`${classes.colStyle}`}>{summary[key] ? summary[key] : 0}</td>

                        </tr>
                      ))}


                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            <div className={`col-6`}>
              <div className={`card ${classes.card2}`}>
                <h6 className={`card-title mt-3 mb-2`}>

                  <span className={`${classes.pnTitle} me-2`}><b className={`ms-4`}>Severity Distribution</b>
                  </span>

                </h6>
                <PieChart value={pieChartData} />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }), [summary, pieChartData]);
}

function generateCircularProgress() {
  return React.memo(() => {
    return <CircularProgress size={20} style={{ marginRight: '-1rem' }} />;
  });
}

function renderNoDataFound(isError, DisplayError, DisplayNoData) {
  return () => {
    return (
      <>
        {isError ? <DisplayError /> : <DisplayNoData />}
      </>
    );
  };
}

function renderNoData(classes) {
  return () => {
    return (
      <div className={`${classes.displayError}`}> No Data Found ! </div>
    );
  };
}

function displayErrorMessage(errorDetail) {
  return () => {

    return (
      <div>
        <div className="card me-1 mb-1 mt-2">
        <div className="card-header">
          <h6 className="mb-0">Error</h6>
        </div>
        <div className="card-body">
          <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
            {errorDetail}
          </div>
        </div>
      </div>
      </div>

    );
  };
}
const Spacer = () => <div className="mb-4" />; // Spacer component

const PrismaCloudMain = (props) => {
  const {scantype, scanData, onDataLoaded} =props
  const classes = cssClasses();

  const entity = useEntity();
  const [summary, setSummary] = useState({});

  const [isLoading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [isError, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState();
  const [, setDownLoadFail] = useState(false);
  const [, setDownloadError] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [, setAuthToken] = useState(null);

  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const backendUrl = config.getString('backend.baseUrl');

  const { fetch } = useApi(fetchApiRef);

  let prismaCloudScanRepo = entity.entity.metadata.annotations?.["flowsource/prismacloud-scan-repo"];
  let prismaCloudScanBranch = entity.entity.metadata.annotations?.["flowsource/prismacloud-scan-branch"];

  let codeScanType=["Vulnerabilities"];
  let pageTitle="SCA Scan Report";

  if(scantype != null && scantype != undefined && scantype==="IaC"){
    codeScanType="IacMisconfiguration"
    pageTitle="Prisma Cloud - Infra as Code Scan Report";
    prismaCloudScanRepo = entity.entity.metadata.annotations?.["flowsource/prismacloud-iac-scan-repo"];
    prismaCloudScanBranch = entity.entity.metadata.annotations?.["flowsource/prismacloud-iac-scan-branch"];
    
  }


  const isDefined = (value) => value !== null && value !== undefined;

  const handleSuccess = (res, onDataLoaded) => {
    setLoading(true);
    setDataAvailable(true);
    setSummary(res.summaryData);
    setPieChartData(res.runsData);
    setIsDownloadLoading(false);
    setLoading(false);
    if (isDefined(onDataLoaded)) {
      onDataLoaded(res);
    }
  };

  const handleError = (errorDetail, onDataLoaded) => {
    setLoading(false);
    setError(true);
    setErrorDetail(errorDetail.toString()); // Convert error object to string
    if (isDefined(onDataLoaded)) {
      onDataLoaded(null);
    }
  };

  const missingAnnotationWarning = () => {
    return (
      <div className='mt-3 ms-3 me-3 mb-4'>
        <EntitySwitch>
          <EntitySwitch.Case>
            <EmptyState
              title="No SCA page is available for this entity"
              missing="info"
              description="You need to add an annotation to your component if you want to see SCA page for it."
            />
          </EntitySwitch.Case>
        </EntitySwitch>
      </div>
    );
  };
 useEffect(() => {
  const fetchData = async () => {
    if (isDefined(scanData)) {
      handleScanData(scanData);
      return;
    }

    const aToken = await identityApi.getCredentials();
    setAuthToken(aToken.token);

    if (!isValidRepoAndBranch()) {
      handleError("Invalid repo or branch", onDataLoaded);
      return;
    }

    try {
      const res = await fetchScanData();
      
      if (!res) {
        handleError(`No data found for the repository - ${prismaCloudScanRepo}`, onDataLoaded);
        return;
      }
      handleSuccess(res, onDataLoaded);
    } catch (err) {
      handleError(err.message, onDataLoaded);
    }
  };

  fetchData();
}, []);


const handleScanData = (scanData) => {
  setLoading(true);
  setDataAvailable(true);
  setSummary(scanData.summaryData);
  setPieChartData(scanData.runsData);
  setIsDownloadLoading(false);
  setLoading(false);
};


const isValidRepoAndBranch = () => {
  return isDefined(prismaCloudScanRepo) &&
         isDefined(prismaCloudScanBranch) &&
         prismaCloudScanRepo.length > 0 &&
         prismaCloudScanBranch.length > 0;
};


const fetchScanData = async () => {
  const targetUrl = `${backendUrl}/api/code-security/scan-summary-by-code-category?reponame=${prismaCloudScanRepo}&branchname=${prismaCloudScanBranch}&codecategry=${codeScanType}`;
  const result = await fetch(targetUrl);
  const res = await result.json();
  if (!result.ok) {
    let errorMessage = '';
    switch(result.status){
      case 503:
        errorMessage = `This plugin has not been configured with the required values. Please ask your administrator to configure it.`
        break;
      case 404:
        errorMessage = res.error
        break;
        default:
          errorMessage = `No data found for the repository - ${prismaCloudScanRepo}`
          break;

    }
    throw new Error(errorMessage);
  }

  return isDefined(res) && isDefined(res.runsData) && isDefined(res.summaryData) ? res : null;
};


  const JSONToCSVConvertor = (JSONData, ReportTitle, ShowLabel) => {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    let arrData =
      typeof JSONData !== "object" ? JSON.parse(JSONData) : JSONData;
    let CSV = "";
    //This condition will generate the Label/Header
    if (ShowLabel) {
      let row = "";
      //This loop will extract the label from 1st index of on array
      for (let index in arrData[0]) {
        //Now convert each value to string and comma-seprated
        row += index + ",";
      }
      row = row.slice(0, -1);
      //append Label row with line break
      CSV += row + "\r\n";
    }

    //1st loop is to extract each row
    for (let rowData of arrData) {
      let row = "";
      // 2nd loop will extract each column and convert it in string comma-separated
      for (let index in rowData) {
        row += '"' + rowData[index] + '",';
      }
      // add a line break after each row
      CSV += row + "\r\n";
    }

    if (CSV === "") {
      alert("Invalid data");
      return;
    }
    //Generate a file name
    let fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g, "_");
    //Initialize file format you want csv or xls
    let uri = "data:text/csv;charset=utf-8," + encodeURIComponent(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension
    //this trick will generate a temp <a /> tag
    let link = document.createElement("a");
    link.href = uri;
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = useCallback( async () => {
    setIsDownloadLoading(true);
    try 
      {
        const targetUrl = backendUrl + '/api/code-security/code-scan-summary?reponame=' + prismaCloudScanRepo + '&branchname=' + prismaCloudScanBranch + '&codecategry' + codeScanType;
        const result = await fetch(targetUrl);

        const res = await result.json();

        JSONToCSVConvertor(res.CodeReviewScan, "Code Security", true);
        setIsDownloadLoading(false);
    } catch (err) {
      setLoading(false);
      setIsDownloadLoading(false);
      setDataAvailable(false);
      setDownLoadFail(true);
      setDownloadError(err);
    }
  });

  const summayRows = {
    count: "Total Issues", fixableCount: "Fixable Count", softFailCount: "Soft Fail Count",
    hardFailCount: "Hard Fail Count", source: "Source"
  };

  const DisplayError = displayErrorMessage(errorDetail)
  const DisplayNoData = renderNoData(classes)
  const filteredKeys = Object.keys(summayRows);
  const NoDataFound = renderNoDataFound(isError, DisplayError, DisplayNoData);
  const MemoizedCircularProgress = generateCircularProgress();
  const RenderData = RenderPrismaData(classes, filteredKeys, summayRows, summary, pieChartData);


  if (isLoading) {
    return <div className={`App p-3`}>Loading...</div>;
  }


  return (
      <div className={`${classes.mainBackground}`} style={{ width: '100%' }}>
        {!isError && prismaCloudScanRepo !== undefined && prismaCloudScanBranch !== undefined && prismaCloudScanRepo.length > 0 && prismaCloudScanBranch.length> 0 &&(
          /* code for displaying Excel icon and handling download */
          <div className={`${classes.pluginHeading}`}>
            <div style={{ width: '100%'}}>
              <h6>
                <div className={`${classes.rowStyle} row`}>
                  <div className={`${classes.heading} col-9`}>{pageTitle}</div>
                  <div className={`${classes.iconStyle} col-3`}>
                    <button onClick={handleDownload} className={`${classes.bStyle} float-end`}>
                      <img src={excelIcon} className={`${classes.imageStyle} float-end`} />
                      {isDownloadLoading && <MemoizedCircularProgress />}
                    </button>
                  </div>
                </div>
              </h6>
            </div>
            <div className={`${classes.pluginVersion}`}>
              <PluginVersion />
            </div>
          </div>
        )}
        {/* code for rendering data or displaying error/no data found message */}
        {isValidRepoAndBranch() ? (
        <>
        {isError && <DisplayError />}
        {isLoading && <div>Loading...</div>}
        {!isLoading && !isError && dataAvailable && <RenderData />}
        {!isLoading && !isError && !dataAvailable && <NoDataFound />}
        </>
      ) : (
        missingAnnotationWarning()
      )}
      </div>
    
  );
  
}


export default PrismaCloudMain;
