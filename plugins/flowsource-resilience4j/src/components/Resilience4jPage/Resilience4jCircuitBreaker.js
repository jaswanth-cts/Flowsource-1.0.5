import React, { useState, useEffect  } from 'react';

import cssClasses from './Resilience4jCss.js';
import { Button, Typography, Card, Paper, CardHeader, Divider, CardContent, Alert, } from '@mui/material';
import SendIcon from "@mui/icons-material/Send";
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import avg_duration from './Icons/avg_duration.png';
import Tooltip from '@material-ui/core/Tooltip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateTime } from 'luxon';
import info_icon from './Icons/info_icon.svg';
import date_picker from './Icons/date_picker.svg';
import log from 'loglevel';

const Spacer = () => <div className="mb-4" />;
function renderCustomInput(classes) {
  return React.forwardRef(({ value, onClick }, ref) => (
    <div onClick={onClick} ref={ref}>

      <input
        type="text"
        value={value}
        className={`${classes.cursorStyle}`} />
      <img src={date_picker} alt="Date Picker Icon" className={`${classes.datePicker}`}></img>
    </div>
  ));
}

const Resilience4jCircuitBreaker = () => {
    const config = useApi(configApiRef);
    const entity = useEntity();
    const { fetch } = useApi(fetchApiRef);

    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-resilience4j/';

    const eventName = entity.entity.metadata.annotations['flowsource/resilience4j-datadog-monitor-name'];
    const durationInDays = entity.entity.metadata.annotations['flowsource/resilience4j-durationInDays'];

    const [eventDetail, setEventDetail] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState(DateTime.now().minus({ days: durationInDays }).toJSDate());
    const [toDate, setToDate] = useState(DateTime.now().toJSDate());
 
    const fetchData = async () => {
      try {
        setLoading(true);
        const isoFrom = fromDate.toISOString();
        const isoTo = toDate.toISOString();
        
        // Construct the query string
        let params = new URLSearchParams({
          'eventName': eventName,
          'fromdate': isoFrom,
          'todate': isoTo
        });
        
        // Construct the URL
        const url = backendBaseApiUrl + 'resilience4jCircuitBreaker?' + params.toString();
        const eventDetails = await fetch(url);
        
          if (eventDetails.ok) {
              const result = await eventDetails.json();
              setEventDetail(result);
              setLoading(false);
          } else {
              const errorData = await eventDetails.json();
              log.error('Error fetching data:', eventDetails.status);
              if (eventDetails.status === 503) {
                setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
              }else if (eventDetails.status === 404 &&
                errorData && errorData.error && errorData.error.includes(`Event not found.`)
              ) {
                setError(`Invalid or no data available for the eventName: '${eventName}'. Please check the eventName in the catalog and try again.`);
              }
              else{
                setError(`Error fetching data, with status code ${eventDetails.status}`);
              }
              setLoading(false);
          }
      } catch (error) {
          log.error('Error:', error);
          setError(error.message);
          setLoading(false);
      }
    }

    useEffect(() => {
        fetchData();
    }, []);
    const classes = cssClasses();
    
    const CustomInput = renderCustomInput(classes);

    function renderResiliance4jCB() {
      if (isLoading) {
        return (
          <div className={`App p-3 ${classes.load}`}>
            Loading...
          </div>
        );
      } 
      else if (error) {
        return (
          <div>
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
          </div>
        );
      }
      else if(eventDetail && Object.keys(eventDetail).length !== 0) {
        return (
          <div>
            <div className={`row`}>
              <h6 className={`${classes.cardAlign}`}>
                <span style={{ marginRight: '10px' }}>
                  <label htmlFor="fromDate"><strong>From Date</strong></label>
                  <DatePicker className={`${classes.customDatepicker}`}
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    showTimeSelect
                    dateFormat="dd/MM/yyyy HH:mm:ss"
                    timeFormat="HH:mm:ss"
                    customInput={<CustomInput />}
                  />
                </span>
                <span style={{ marginRight: '10px' }}>
                  <label className={`${classes.customDatepicker1}`} htmlFor="toDate"><strong>To Date</strong></label>
                  <DatePicker className={`${classes.customDatepicker}`}
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    showTimeSelect
                    dateFormat="dd/MM/yyyy HH:mm:ss"
                    timeFormat="HH:mm:ss"
                    customInput={<CustomInput />}
                  />
                </span>
                <span>
                  <Button color="primary" onClick={fetchData}>
                    <SendIcon />
                  </Button>
                </span>
              </h6>
            </div>
            <div>

              <div className={`${classes.cardItems}`}>
                <a href={eventDetail.monitorUrl} target="_blank" rel="noopener noreferrer" className={`${classes.cardsLink}`}>
                  <Card variant="outlined" className={`${classes.cards}`} style={{ backgroundColor: '#FFFFFF', width: '21rem', marginTop: '0.5rem' }}>
                    <div className={`${classes.cardsTitle}`}>
                      <img src={avg_duration} className={`${classes.cardsTitleImg}`}></img>
                      <Typography className={`${classes.cardsTitleText}`}><strong>Total Duration</strong>
                        <Tooltip title="Total duration for which the circuit was open">
                          <img src={info_icon} style={{ marginLeft: '0.5rem', height: '1.2rem' }}></img>
                        </Tooltip>
                      </Typography>
                    </div>
                    <div className={`${classes.cardsValue}`}>
                      <p className={`${classes.cardsValueText}`}>{eventDetail.totalDurationD} mins</p>
                    </div>
                  </Card>
                </a>
                <a href={eventDetail.monitorUrl} target="_blank" rel="noopener noreferrer" className={`${classes.cardsLink}`}>
                  <Card variant="outlined" className={`${classes.cards}`} style={{ backgroundColor: '#FFFFFF', marginLeft: '8%', width: '21rem', marginTop: '0.5rem' }}>
                    <div className={`${classes.cardsTitle}`}>
                      <img src={avg_duration} className={`${classes.cardsTitleImg}`}></img>
                      <Typography className={`${classes.cardsTitleText}`}><strong>Average Duration</strong>
                        <Tooltip title="Average duration for which the circuit was open">
                          <img src={info_icon} style={{ marginLeft: '0.5rem', height: '1.2rem' }}></img>
                        </Tooltip>
                      </Typography>
                    </div>
                    <div className={`${classes.cardsValue}`}>
                      <p className={`${classes.cardsValueText}`}>{eventDetail.averageDuration} mins</p>
                    </div>
                  </Card>
                </a>
              </div>
            </div>
            <Spacer />
          </div>
        );
      } 
      else {
        return (
          <div>
            <h5><strong>No data available.</strong></h5>
          </div>
        );
      }
    };

    return (
      <div>
        { renderResiliance4jCB() }
      </div>
    );   
}

export default Resilience4jCircuitBreaker;