import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from '../TestingMainPageCSS.js';
import attachment_icon from '../../Icons/attachment_icon.png';
import { Modal } from 'react-bootstrap';

import log from 'loglevel';

const FailedTestCaseStepsPage = (props) => {
  const classes = cssClasses();
  const [showModal, setShowModal] = useState(false);
  const [popUpImage, setPopUpImage] = useState('');
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [isFailedDownload, setFailedDownload] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAttachmentDownload = async (attachmentName) => {
    setShowModal(true);
    getAttachmentForFailedTestCaseSteps(attachmentName);
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTableData = tableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
  const pagesArray = [...Array(totalPages).keys()];
  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);
  startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
  endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  const getAttachmentForFailedTestCaseSteps = async (attachmentName) => {
    setLoading(true);
    await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/attachments?name=${attachmentName.trim()}`)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((resp) => {
        if ((resp.data !== null && resp.data !== undefined && resp.data !== '')) {
          setLoading(false);
          setPopUpImage('data:image/png;base64,' + resp.data);
        } else {
          setLoading(false);
          setFailedDownload(true);
        }
      })
      .catch((error) => {
        log.info('error: ' + error);
        setLoading(false);
        setFailedDownload(true);
      });
  }

  async function getFailedTestCaseSteps() {
    const data = props.failedTestCaseLogs;
    
    let failedTestCaseStepsArray = new Array();
    if (data !== null && data !== undefined) {
      data.forEach(function (item, index) {
        let attachmentName = '';
        if (item.attachments.length > 0) {
          attachmentName = item.attachments[0]?.name;
        };

        // Construct the systemInfo string dynamically
        let systemInfoString = '';
        for (const [key, value] of Object.entries(item.systemInfo)) {
        systemInfoString += `${key}: ${value} `;
        }

        const entry = { 
            Info: `${item.level} DETAILS\n${systemInfoString.trim()}`, 
            Time: formatDate(item.timestamp), 
            AttachmentName: attachmentName,
            Log: item.message
        };
        failedTestCaseStepsArray.push(entry);
      })
    };
    
    //Set the table data for test steps
    setTableData(failedTestCaseStepsArray);
    setLoading(false);
  }

  function formatDate(dateValue) {
    // Convert LastExecutedDate to a Date object
    const date = new Date(dateValue);
    // Format the date part
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const datePart = `${day}/${month}/${year}`;
    // Format the time part
    const timePart = date.toUTCString().split(' ')[4]; // Extr  s the time part
    // Combine date and time with GMT
    const gmtDateTime = `${datePart} ${timePart}`;
    return gmtDateTime;
  }

  function renderFailedStepAttachment() {
    if(isLoading) {
      return (
        <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '10vh', paddingTop: '30%' }}>
          Loading...
        </div>
      );
    } 
    else if(isFailedDownload) {
      return (
        <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '10vh', paddingTop: '30%' }}>
          Error occured while downloading the file
        </div>
      );
    } 
    else {
      return (
        <div >
          <img src={popUpImage} alt="attachment" style={{ width: '100%', height: '100%' }} />
        </div>
      );
    }
  }

  useEffect(async () => {
    getFailedTestCaseSteps();
  }, []);

  return (
    <div>
      <div className={`w-100 mt-0`} style={{ border: 'none' }}>
        <div className={`row justify-content-start mt-0 pb-2`}>
          <div>
            {isLoading ? (
              <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '10vh', paddingTop: '30%' }}>
                Loading...
              </div>
            ) : (
              <div className="table-responsive">
                <table className={`table ${classes.tableBorders} `}>
                  <thead>
                    <tr className={`${classes.tableHeadFailed}`}>
                      <th className={`${classes.colStyleFailed}`} scope="col"
                        style={{
                          color: 'white',
                          backgroundColor: '#000048',
                          width: '25%',
                        }}>INFO</th>
                      {<th className={`${classes.colStyleFailed}`} scope="col"
                        style={{
                          color: 'white',
                          backgroundColor: '#000048',
                        }}>ATTACHMENT</th>}
                      <th className={`${classes.colStyleFailed}`} scope="col"
                        style={{
                          color: 'white',
                          backgroundColor: '#000048',
                        }}>TIME</th>
                      <th className={`${classes.colStyleFailed}`} scope="col"
                        style={{
                          color: 'white',
                          backgroundColor: '#000048',
                          width: '35%'
                        }}>LOG</th>
                    </tr>
                  </thead>
                  <tbody >
                    {currentTableData.map((row) => {
                        const [infoFirstLine, infoSecondLine] = row.Info.split('\n');
                      return (
                        <tr key={row.TestPlanName}>
                          <td className={`${classes.colStyle1Failed}`}>
                          {infoFirstLine}<br />{infoSecondLine}
                          </td>
                          {(row.AttachmentName !== '') ? (
                            <td className={`${classes.colStyle1Failed1}`} >
                              <a href='#'><img src={attachment_icon} alt="Attachment Icon" 
                              onClick={() => handleAttachmentDownload(row.AttachmentName)} 
                              /></a>
                            </td>
                          ) : <td></td>
                          }
                          <td className={`${classes.colStyle1Failed}`}>{row.Time}</td>
                          <td className={`${classes.colStyle1Failed}`}>{row.Log}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {tableData.length === 0 ? (
                  ''
                 ) : (
                    <nav aria-label="Page navigation example">
                        <ul className={`pagination justify-content-end ${classes.ulCss} ${classes.customPagination}`}>
                            <li className={`page-item ${isPreviousDisabled ? 'disabled' : ''}`}>
                            <a aria-label="Previous" className="page-link"
                                href="#"
                                tabIndex="-1"
                                onClick={() => handlePageChange(currentPage - 1)}>
                                <span aria-hidden="true">«</span>
                            </a>
                            </li>
                            {startPage > 1 && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                            )}
                            {pagesArray.slice(startPage - 1, endPage).map((index) => (
                            <li
                                key={index}
                                className={`page-item ${classes.numCss}`}>
                                <a className={`page-link  ${index + 1 === currentPage ? 'Mui-selected' : ''}`} href="#" onClick={() => handlePageChange(index + 1)}>
                                {index + 1}
                                </a>
                            </li>
                            ))}
                            {endPage < totalPages && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                            )}
                            <li className={`page-item ${isNextDisabled ? 'disabled' : ''}`}>
                            <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                                <span aria-hidden="true">»</span>
                            </a>
                            </li>
                        </ul>
                    </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} >
        <Modal.Body style={{ overflowY: 'auto', maxHeight: 'calc(88vh - 210px)' }}>
          <div>
            <div className={`row ${classes.rowButton}`}>
              { renderFailedStepAttachment() }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer >
          <button onClick={() => setShowModal(false)} className={`${classes.Footer}`}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FailedTestCaseStepsPage;