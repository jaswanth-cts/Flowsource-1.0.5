import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from '../TestingMainPageCSS.js';
import dateUtils from '../DateUtil.js';
import delete_icon from '../../Icons/Delete_icon.png';
import { Modal, Box, Typography, Button } from '@mui/material';

import log from 'loglevel';

const TestPlanPage = ({ testPlanData, onTestPlanDataChange, isDeleted }) => {
  const classes = cssClasses();

  const [tableData, setTableData] = useState([]);
  const [testPlanDetails, setTestPlanDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [, setActiveTab] = useState('testPlanPage');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDeleteButton, setSelectedDeleteButton] = useState('yes');
  const [deleteError, setDeleteError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const baseUrl = config.getOptionalString('backend.baseUrl');
  const backendBaseApiUrl = setBaseUrlVal();
  
  function setBaseUrlVal() {
      if(baseUrl.endsWith('/')) {
        return `${baseUrl}api/flowsource-cctp/`;
      } else {
        return `${baseUrl}/api/flowsource-cctp/`
      } 
  };

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTableData = tableData.slice(startIndex, endIndex);
  const pagesToShow = 3;
  const pagesArray = [...Array(totalPages).keys()];

  let startPage = 1;
  let endPage = Math.min(pagesToShow, totalPages);

  function setStartPage() {
    if(currentPage > pagesToShow - 2) {
        return currentPage - Math.floor(pagesToShow / 2);
    } else {
        return startPage;
    }
  };

  function setEndPage() {
      if(currentPage > pagesToShow - 2) {
          return Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages);
      } else {
          return endPage;
      }
  };

  startPage = setStartPage();
  endPage = setEndPage();

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;


  async function getTestPlanData() {
    //Load TestSuite table data
    let testPlanDataArray = new Array();
    if (testPlanData !== null && testPlanData !== undefined) {
      testPlanData.testSuites.forEach(function (item, index) {
        const entry = { TestSuiteName: item.testSuiteName, Createdon: dateUtils.formatDate(item.testSuiteCreatedDate), NoofTestcases: item.noOfTestCases, testPlanId: item.testPlanId };
        testPlanDataArray.push(entry);
      });
    } else {
      log.info('No Data to load');
    }
    //Set the table data for testplan
    setTableData(testPlanDataArray);
    const testPlanDetails = {
      testPlanName: testPlanData.testPlanName,
      type: testPlanData.type,
      testPlanId: testPlanData.testPlanId
    };
    setTestPlanDetails(testPlanDetails);
  }

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  useEffect(async () => {
    getTestPlanData();
  }, [testPlanData]);

  const handleTestPlanClick = (testPlanId) => {
    onTestPlanDataChange(testPlanId, 'createTestPlan');
  };

  const handleDeleteTestPlan = () => {
    isDeleted();
  };

  const confirmDelete = (testPlanId) => {
    setSelectedRow(testPlanId);
    setSelectedDeleteButton('yes');
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setSelectedDeleteButton('no');
    setShowDeleteDialog(false);
  };

  const onClickDeleteTestPlan = async () => {

    setSelectedDeleteButton('yes');
    setShowDeleteDialog(false);  // Hide the dialog before starting the delete

    const hasTestSuites = tableData?.length > 0 && tableData.some(item => item.TestSuiteName);

    if (hasTestSuites) {
      handleShowModal();
      return; // Exit early
    }
    setDeleteLoading(true);
    // Optimistically update table data to remove the deleted item
    const filteredData = tableData.filter(item => item.testPlanId !== testPlanId);
    setTableData(filteredData);

    // Delete test plan
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/test-plans/${selectedRow}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Read the error message from the response
        const errorText = await response.text();
        // Format the error message
        const formattedError = `HTTP error! status: status: ${response.status}, message: Error deleting test plan`;
        log.error('Error deleting frameworks: API returned: ', errorText);
        // Set the error state with the formatted error message
        setDeleteError(formattedError);
        // Restore table data if deletion fails
        setTableData([...tableData]);
        setShowErrorDialog(true);
      } else {
        setSelectedRow(null);
        handleDeleteTestPlan();
        // setDeleted(!deleted)
      }
    } catch (error) {
      setShowErrorDialog(true);
      log.error("Error while deleting test plan data:", error);
      if (!error.message.includes('HTTP error!')) {
        setDeleteError(`Error while deleting test plan data: ${error.message}`);

      }
      // Restore table data if deletion fails
      setTableData([...tableData]);
    } finally {
      // Set loading to false after the fetch operation is complete
      setDeleteLoading(false);
      setActiveTab('testPlanPage');
    }
  }

  return (
    <div>
      {deleteLoading ? (
        <div className={`App p-3 ${classes.loadingContainer}`}>Deleting...</div>
      ) : (
        <div>
          <div className={`w-80 card ms-4 me-4 mb-0 mt-0`} style={{ width: '96%', border: 'none' }}>
            <div className={`row justify-content-start mt-2 pb-0`}>
              <div className={`row`} >
                <div className={`col-12 d-flex align-items-center justify-content-between ms-2 mb-3`} >
                  <div style={{ fontSize: '1rem', color: '#000048' }}>TEST PLAN SUMMARY</div>
                  <img
                    src={delete_icon}
                    alt="Delete test plan"
                    style={{ cursor: 'pointer' }}
                    title="Delete Test Plan"
                    onClick={() => confirmDelete(testPlanDetails.testPlanId)}
                  />

                  {/* Confirmation Dialog */}
                  {showDeleteDialog && (
                    <div className={`${classes.dialogOverlayDelete}`}>
                      <div className={`${classes.dialogBoxDelete}`}>
                        <p>Do you want to delete this Test Plan?</p>
                        <button
                          style={{ backgroundColor: selectedDeleteButton === 'yes' ? '#000048' : 'grey' }}
                          className={`${classes.dialogBoxDeleteYesButton}`}
                          onClick={onClickDeleteTestPlan}
                        >
                          Yes
                        </button>
                        <button
                          style={{ backgroundColor: selectedDeleteButton === 'no' ? '#000048' : 'grey' }}
                          className={`${classes.dialogBoxDeleteNoButton}`}
                          onClick={handleDeleteCancel}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Error Dialog */}
                  {showErrorDialog && (
                    <div className={`${classes.dialogOverlayDeleteError}`}>
                      <div className={`${classes.dialogBoxDeleteError}`}>
                        <div className="card ms-2 me-2 mb-2 mt-2 w">
                          <div className="card-header">
                            <h6>Error Occured</h6>
                          </div>
                          <div className="card-body">
                            <div className="alert alert-danger" role="alert">
                              {deleteError}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`${classes.errorDialogBoxDeleteButton}`}
                          onClick={() => setShowErrorDialog(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  <Modal
                    open={showModal}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                  >
                    <Box
                      sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper',
                        border: '1px solid', boxShadow: 24, p: 4, borderRadius: 2,
                      }}
                    >
                      <Typography id="modal-title" variant="h6" component="h2">
                        Cannot Delete Test Plan
                      </Typography>
                      <Typography id="modal-description" sx={{ mt: 2 }}>
                        Test plan has test suites. Cannot delete the test plan.
                      </Typography>
                      <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Button variant="contained" color="primary" onClick={handleCloseModal}>
                          Close
                        </Button>
                      </Box>
                    </Box>
                  </Modal>
                </div>
              </div>
              <div className={`ms-5 ps-5`} style={{ width: '71%' }}>
                <table className={`table ms-5 mt-2 me-4 mb-2 ${classes.tableStriped1} table-bordered`}>
                  <tbody>
                    <tr>
                      <th className={`${classes.colStyle}`} style={{ fontSize: '0.80rem' }}>TEST PLAN</th>
                      <th className={`${classes.colStyle}`} style={{ fontSize: '0.80rem' }}>TOOL</th>
                    </tr>
                    <tr>
                      <td
                        className={`${classes.colStyle1} ${classes.clickTestPlan}`}
                        onClick={() => handleTestPlanClick(testPlanDetails.testPlanId)}
                      >
                        {testPlanDetails.testPlanName}
                      </td>
                      <td className={`${classes.colStyle1}`}>{testPlanDetails.type}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className="mb-0 ms-3 me-3 table-responsive" style={{ marginTop: '1rem' }}>
                  {tableData.length === 0 ? '' :
                    <table className={`table ${classes.tableBorders} `}>
                      <thead>
                        <tr className={`${classes.tableHead}`}>
                          <th className={`${classes.colStyle}`} scope="col-4">
                            TEST SUITE
                          </th>
                          <th className={`${classes.colStyle}`} scope="col-4">
                            NO OF TEST CASES
                          </th>
                          <th className={`${classes.colStyle}`} scope="col-4">
                            CREATED ON
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ textAlign: '-webkit-center' }}>
                        {currentTableData.map((row) => {
                          return (
                            <tr key={row.TestSuiteName}>
                              <td className={`${classes.colStyle1}`} >
                                <div className={classes.tablefont} >
                                  {row.TestSuiteName}
                                </div>
                              </td>
                              <td className={`${classes.colStyle1}`}>
                                <div className={classes.priorityCircle}>
                                  {row.NoofTestcases}
                                </div>
                              </td>
                              <td className={`${classes.colStyle1}`} >
                                {row.Createdon}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  }
                  {/* <div className='d-flex align-items-center mt-2'>
                    <img
                      src={delete_icon}
                      alt="Delete Icon"
                      className={`${classes.stackTrace}`}
                    />
                    <span style={{ fontSize: '0.7rem' }} className='px-1'>To delete the test plan</span>
                  </div> */}
                  <div>
                    {tableData.length === 0 ? '' :
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
                    }
                    <div className='d-flex align-items-center mt-2 mb-2'>
                      <img
                        src={delete_icon}
                        alt="Delete Icon"
                        className={`${classes.stackTrace}`}
                      />
                      <span style={{ fontSize: '0.7rem' }} className='px-1'>To delete the test plan</span>
                    </div>
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

export default TestPlanPage;
