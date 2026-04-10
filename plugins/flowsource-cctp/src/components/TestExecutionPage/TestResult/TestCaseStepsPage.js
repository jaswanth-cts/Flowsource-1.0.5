import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from '../TestingMainPageCSS.js';
import arrow from '../../Icons/arrow.png';
import stack_trace from '../../Icons/stack_trace.png';
import attachment_icon from '../../Icons/attachment_icon.png';
import { Modal } from 'react-bootstrap';
import dateUtils from '../DateUtil.js';

import log from 'loglevel';

const TestCaseStepsPage = (props) => {
  const classes = cssClasses();
  const [showModal, setShowModal] = useState(false);
  const [popUpImage, setPopUpImage] = useState('');
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isFailedDownload, setFailedDownload] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTabChange = (testCaseName, failureLogs) => {
    props.setActiveTab('failedteststep');
    const tabJsonTestCase = {
      "tab1": props.tabDetails.tab1,
      "tab2": props.tabDetails.tab2,
      "tab3": props.tabDetails.tab3,
      "tab4": testCaseName
    }
    props.setTabDetails(tabJsonTestCase);
    props.setHistoryTestExecution(4);
    props.setFailedTestCaseLogs(failureLogs);
  };

  const handleAttachmentDownload = async (attachmentName) => {
    setShowModal(true);
    getAttachmentForTestCaseSteps(attachmentName);
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

  const getAttachmentForTestCaseSteps = async (attachmentName) => {
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

  async function getTestCaseSteps() {
    try {
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/testResults/testCases/testSteps/${props.testCaseId}?testCaseName=${props.testCaseName}`);
        const data = await response.json();

        let testCaseStepsArray = [];
        if (data !== null && data !== undefined) {
            data.forEach(function (item) {
                let attachmentName = '';
                if (item.attachments.length > 0) {
                    attachmentName = item.attachments[0]?.name;
                }
                const entry = {
                    Steps: item.name,
                    Description: item.description,
                    Time: dateUtils.formatDate(item.startTime),
                    Duration: dateUtils.formatTime(item.duration),
                    Status: item.result,
                    AttachmentName: attachmentName,
                    Stacktrace: item.exceptionStacktrace,
                    TestCaseName: item.name,
                    FailureLogs: item.logs
                };
                testCaseStepsArray.push(entry);
            });
        }
        // Set the table data for test steps
        setTableData(testCaseStepsArray);
    } catch (error) {
        log.error('Error fetching test case steps:', error);
        setError(`Error fetching test case steps: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

  useEffect(async () => {
    getTestCaseSteps();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'PASSED') {
      return '#11BF6A';
    } else if (status === 'FAILED') {
      return '#FB6868';
    } else {
      return 'transparent';
    }
  };

  function renderAttachment() {
    if(isLoading) {
      return (
        <div className={`App p-3 ${classes.loading1}`}>
          Loading...
        </div>
      );
    }
    else if(isFailedDownload) {
      return (
        <div className={`App p-3 ${classes.loading1}`}>
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

  return (
    <div>
      <div className={`w-100 mt-0`} style={{ border: 'none' }}>
        <div className={`row justify-content-start mt-0 pb-2`}>
          <div>
            {isLoading ? (
              <div className={`App p-3 ${classes.loading1}`}>
                Loading...
              </div>
            ) : (
              <div className="table-responsive">
                <table className={`table ${classes.tableBorders} `}>
                  <thead>
                    <tr className={`${classes.tableHead}`}>
                      <th className={`${classes.colStyle}`} scope="col">STEPS</th>
                      <th className={`${classes.colStyle}`} scope="col">DESCRIPTION</th>
                      <th className={`${classes.colStyle}`} scope="col">TIME</th>
                      <th className={`${classes.colStyle}`} scope="col">DURATION</th>
                      {<th className={`${classes.colStyle}`} scope="col">ATTACHMENT</th>}
                      <th className={`${classes.colStyle}`} scope="col">STATUS</th>
                      <th className={`${classes.colStyle}`} scope="col"></th>
                      <th className={`${classes.colStyle}`} scope="col" ></th>
                    </tr>
                  </thead>
                  <tbody style={{ textAlign: '-webkit-center' }}>
                    {currentTableData.map((row) => {
                      return (
                        <tr key={row.TestPlanName}>
                          <td className={`${classes.colStyle1}`}>
                            {row.Steps}
                          </td>
                          <td className={`${classes.colStyle1}`}>{row.Description}</td>
                          <td className={`${classes.colStyle1}`}>{row.Time}</td>
                          <td className={`${classes.colStyle1}`}>{row.Duration}</td>
                          {(row.Status==='FAILED' && row.AttachmentName !== '') ? (
                            <td className={`${classes.colStyle1}`}>
                              <a href='#'><img src={attachment_icon} alt="Attachment Icon" onClick={() => handleAttachmentDownload(row.AttachmentName)} /></a>
                            </td>
                          ) : <td></td>
                          }
                          <td className={`${classes.colStyle1}`}>
                            <button type="button" class="btn" style={{cursor: 'default', borderRadius: '6rem', fontSize: '0.7rem', backgroundColor: getStatusColor(row.Status), color: '#FFFFFF' }}
                            >{row.Status}</button>
                          </td>
                          <td>
                            {row.Status === 'FAILED' && (
                              <>
                              <img
                                src={stack_trace}
                                alt="Stacktrace Icon"
                                title='Click to view stacktrace'
                                className={`float-end ${classes.pointer}`}
                                onClick={() => setShowDialog(true)}
                              />
                              {showDialog && (
                                <div className={`${classes.dialogOverlay}`}>
                                  <div className={`${classes.dialogBox}`}>
                                    <div className={`${classes.dialogHeader}`}>
                                      <h2 className={`${classes.dialogHeaderText}`}>Stack Trace</h2>
                                      <button className={`${classes.closeButtonStackTrace}`} onClick={() => setShowDialog(false)}>×</button>
                                    </div>
                                    <div className={`${classes.dialogContentStackTrace}`}>
                                      <pre className={`${classes.textWrap}`}>{row.Stacktrace}</pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                              </>
                            )}
                          </td>
                          <td>
                            {row.Status === 'FAILED' && (
                              <img
                                src={arrow}
                                alt="Arrow Icon"
                                className={`float-end ${classes.pointer}`}
                                onClick={() => handleTabChange(row.TestCaseName, row.FailureLogs)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {tableData.length === 0 ? (
                  ''
                 ) : (
                  <>
                    <div className='d-flex justify-content-between align-items-center mt-2'>
                      <div className='d-flex align-items-center'>
                        <img
                          src={stack_trace}
                          alt="Stacktrace Icon"
                          className={`${classes.stacktrace}`}
                        />
                        <span className={`${classes.click}`}>Click to view stacktrace</span>
                      </div>
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
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} >
        <Modal.Body className={`${classes.modalbody}`}>
          <div>
            <div className={`row ${classes.rowButton}`}>
              { renderAttachment() }
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

export default TestCaseStepsPage;