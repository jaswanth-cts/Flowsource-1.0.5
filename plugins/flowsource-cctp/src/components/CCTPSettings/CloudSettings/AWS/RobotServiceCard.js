import React, { useState, useEffect } from 'react';
//import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import icons from react-icons
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'; // Import arrow icons
import { Typography } from '@mui/material';
import cssClasses from '.././CloudSettingsCssPage';

import CLOSE_ICON from '../../../Icons/popup_close_icon.png';
import UPDATE_ICON from '../../../Icons/service_icon.png';

const RobotServiceCard = ({ robot, staticTasksCount, staticRobotCount }) => {
  
    const classes = cssClasses();
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
    const [count, setCount] = React.useState("0"); // State to store the input value
    const [robotServiceUpdateOpen, setRobotServiceUpdateOpen] = useState(false);
    const [validationMessage, setValidationMessage] = useState(""); // State for validation message
  
    const handleClose = () => {
      setRobotServiceUpdateOpen(false);
    };
  
    const openUpdatePopup = (rowId) => {
      setRobotServiceUpdateOpen(true);
    };
  
    async function handleUpdate() {
      const task = { "tasks": Number(count) }; // Convert count to a number
      await fetch(`${backendBaseApiUrl}cctp-proxy/execution/cloud/aws/robots/${robot.id}/update/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      setRobotServiceUpdateOpen(false);
    }
  
    // Validation logic
    useEffect(() => {
      if (staticTasksCount > staticRobotCount) {
        setValidationMessage("Static Robot limit exceeded");
      } else {
        setValidationMessage(""); // Clear validation message if within limit
      }
    }, [staticTasksCount, staticRobotCount]);
  
    return (
      <div>
        <a href="#">
          <img
            src={UPDATE_ICON}
            alt="Update service"
            className={`${classes.updateServiceIcon}`}
            onClick={() => openUpdatePopup(robot.id)}
          />
        </a>
        {robotServiceUpdateOpen && (
          <div className={`${classes.modalOverlay}`}>
            <div className={`${classes.modalContainer}`}>
              <button
                className={`${classes.closeButton}`}
                onClick={() => {
                  setRobotServiceUpdateOpen(false);
                }}
              >
                &times;
              </button>
              <div className={`${classes.cardHeading}`}>
                <Typography variant="h6" component="div" className={`${classes.cardHeadingText}`}>
                  Update Service {robot.name}
                </Typography>
              </div>
              <div className="modal-body">
                <div className={`${classes.cardBody}`}>
                  <div className={`${classes.cardContent}`}>
                    <input
                      type="number"
                      value={count}
                      id="COUNT"
                      min="0"
                      max={staticRobotCount}
                      name="count"
                      onChange={(e) => {
                        const val = e.target.value;
                        
                        if (val === "" || Number(val) <= staticRobotCount) {
                          setCount(val);
                        }
                      }}
                      className={`${classes.selectPriority}`}
                    />
                    {validationMessage && (
                      <p className={`${classes.validationMessage}`} style={{ color: "red" }}>
                        {validationMessage}
                      </p>
                    )}
                    <div className={`${classes.modalButtonContainer}`}>
                      <button
                        type="button"
                        onClick={handleUpdate}
                        className={`${classes.submitCancelButton}`}
                        disabled={staticTasksCount > staticRobotCount} // Disable button if limit exceeded
                        style={{
                            backgroundColor: validationMessage ? "lightblue" : "", // Apply lightblue background if validation message exists
                          }}
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


export default RobotServiceCard;