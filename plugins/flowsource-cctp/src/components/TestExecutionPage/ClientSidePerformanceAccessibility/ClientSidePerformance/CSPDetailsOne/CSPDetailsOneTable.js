import React, { useState } from 'react';


import cssClasses from './CSPDetailsOneCss.js';

import arrow from '../../../../Icons/arrow.png';

const CSPDetailsOneTable = ({ tansactionsTableData, props }) => {
    
    const classes = cssClasses();

    const handleTabChange = (testSuiteName, testCaseName) => {
        
        props.setActiveTab('CSPPageTwo');
        props.setHistoryTestExecution(3);
        
        const tabJsonTestCase = {
          "tab1": 'Client Side Performance',
          "tab2": props.tabDetails.tab2,
          "tab3": testSuiteName
        }
        
        props.setTabDetails(tabJsonTestCase);
        props.setTestCaseName('testCasesName=' + testCaseName + '&stepsName=' + testSuiteName);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const pagesToShow = 3;
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(tansactionsTableData.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
    
    const currentTableData = tansactionsTableData.slice(startIndex, endIndex);
    const pagesArray = [...Array(totalPages).keys()];
  
    let startPage = 1;
    let endPage = Math.min(pagesToShow, totalPages);
    startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
    endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
    
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

    let transactionCounter = 0;

    return (
        <div className="table-responsive">
            <table className={`table ${classes.mainTableStyle}`}>
                <thead>
                    <tr className={` ${classes.tableHead}`}>
                        <th className={`${classes.colThStyle}`}>NAME</th>
                        <th className={`${classes.colThStyle}`}>Page Size (MB)</th>
                        <th className={`${classes.colThStyle}`}>Load Size (ms)</th>
                        <th className={`${classes.colThStyle}`}></th>
                    </tr>
                </thead>
                <tbody className={`${classes.tBody}`}>
                    {currentTableData.map((row, index) => (
                        <tr key={"Transaction" + transactionCounter++}>
                            <td className={`${classes.colTdStyle}`}>{row.testStepName}</td>
                            <td className={`${classes.colTdStyle}`}>{row.pageSize}</td>
                            <td className={`${classes.colTdStyle}`}>{row.loadTime}</td>
                            <td className={`${classes.colTdArrowStyle}`}>
                                <a href="#">
                                    <img
                                        src={arrow}
                                        alt="Arrow Icon"
                                        className={`float-end`}
                                        onClick={() => handleTabChange(row.testStepName, row.testCaseName)}
                                    />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {tansactionsTableData.length === 0 ? 
                (<p className={`${classes.dataUnavailable}`}>
                    <b>No Data Available</b>
                </p>) :
                <nav className={` ${classes.paginationBoxStlye}`} aria-label="Page navigation example">
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
                                <a className={`page-link  ${index + 1 === currentPage ? 'Mui-selected' : ''}`} 
                                    href="#" 
                                    onClick={() => handlePageChange(index + 1)}>
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
                            <a href="#" 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                                <span aria-hidden="true">»</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            }
        </div>
    );
};

export default CSPDetailsOneTable;