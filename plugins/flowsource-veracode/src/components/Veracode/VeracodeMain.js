import { useState, useEffect, React } from 'react';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from './VeracodeCss';
import { Paper, Card, CardHeader, Typography, Divider, CardContent, Alert } from '@mui/material';

import 'chart.js/auto';
import PieChart from './PieChart';

const Loading = () => <div className="App p-3">Loading...</div>;

const ErrorCard = ({ error }) => (
  <div className="card me-1 mb-1 mt-2">
      <div className="card-header">
        <h6 className="mb-0">Error</h6>
      </div>
      <div className="card-body">
        <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
          {error}
        </div>
      </div>
    </div>
);

const SummaryReport = ({ veracodeResponse, formatDate, classes }) => (
  <div className={`${classes.col5}`}>
    <div className={`card ${classes.card5}`}>
      <div className={`card-text ${classes.card1} ms-2 mt-2`}>
        <div className={`mb-2`}>Application name: <strong>{veracodeResponse.app_name || ""}</strong></div>
        <div className={`mb-2`}>Policy name: <strong>{veracodeResponse.policy_name || ""}</strong></div>
        <div className={`mb-2`}>Policy compliance status: <strong>{veracodeResponse.policy_compliance_status || ""}</strong></div>
        <div className={`mb-2`}>Last updated time: <strong>{veracodeResponse.last_update_time ? formatDate(veracodeResponse.last_update_time) : ""}</strong></div>
        <div className={`mb-2`}>Score: <strong>{veracodeResponse.score || ""}</strong></div>
        <div className={`mb-2`}>Rating: <strong>{veracodeResponse.rating || ""}</strong></div>
        <div className={`mb-2`}>Lines of code scanned: <strong>{veracodeResponse.loc || ""}</strong></div>
      </div>
    </div>
  </div>
);

const TopFlaws = ({ veracodeResponse, classes }) => (
  <div className={`col-5`}>
    <div className={`card ${classes.card5}`}>
      <div className={classes.cardHeading}>Top Flaws</div>
      {veracodeResponse.top_5_categories && veracodeResponse.top_5_categories.length > 0 ? (
        veracodeResponse.top_5_categories.map((item, index) => (
          <ul key={item.id} className={`${classes.customList} mt-1 mb-3`}>
            <li className={`${classes.customListItem}`}>{item.categoryname} - {item.count}</li>
          </ul>
        ))
      ) : (
        <div className={classes.cardStyle}>
          <p className={`${classes.pStyle}`}><strong>No Vulnerabilities Available</strong></p>
        </div>
      )}
    </div>
  </div>
);

import PluginVersion from '../PluginVersion/PluginVersion';

const VeracodeMain = () => {
  const classes = cssClasses();
  const { fetch } = useApi(fetchApiRef);
  const entity = useEntity();
  const config = useApi(configApiRef);
  const appName = entity.entity.metadata.annotations?.["flowsource/veracode-app-name"];
  const [veracodeResponse, setVeracodeResponse] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-veracode-backend/';

  const fetchAllData = async () => {
    try {
      const veracode_summary = await fetch(backendBaseApiUrl + 'getSummaryReportInfo?appName=' + appName);
      if (veracode_summary.ok) {
        const result = await veracode_summary.json();
        setVeracodeResponse(result);
        setLoading(false);
      } else {
        const errorData = await veracode_summary.json();
        if (errorData.error.includes('No application found')){
          setError("No application could be found with name \"" + appName + "\" in Veracode. Please check the application name and try again.");
        }else{
          setError(`Error fetching veracode scan details: ${errorData.error} (Status code: ${veracode_summary.status})`);
        }
        
        setLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const formatDate = (dateString) => {
    let utcDate = dateString.replace(' ', 'T').replace(' UTC', 'Z');
    const date = new Date(utcDate);
    let options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'long'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div style={{ width: '100%' }}>
    {!error ? (
      <div>
        <div className={`${classes.mainBackground}`} style={{ width: '100%' }}>
          <div className={`row ms-1 me-1 mt-1`} style={{ width: '100%' }}>            
              <div className={`${classes.pluginHeading}`}>
                               <div>
                                 <h6>
                                   <div className={`row`}>
                                     <div className={`${classes.heading} col-12`}>Summary Report</div>
                                   </div>
                                 </h6>
                               </div>
                               <div>
                                 <PluginVersion />
                               </div>
                             </div>
              <SummaryReport veracodeResponse={veracodeResponse} formatDate={formatDate} classes={classes} />
              <div className={`${classes.col7}`}>
                <div className={`card ${classes.card5}`}>
                  <div className={classes.cardHeading}>Flaw distribution</div>
                  <PieChart data={veracodeResponse} />
                </div>
              </div>
            </div>
            <div className={`row ms-1 me-1 mb-2 mt-4`}>
              <TopFlaws veracodeResponse={veracodeResponse} classes={classes} />
            </div>
          </div>
        </div>
      ) : (
        <ErrorCard error={error} />
      )}
    </div>
  );
};

export default VeracodeMain;