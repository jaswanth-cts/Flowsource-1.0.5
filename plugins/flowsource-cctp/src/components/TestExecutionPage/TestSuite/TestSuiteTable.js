import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import cssClasses from './TestSuiteProjectCSS';

const TestSuiteTable = ({ testPlans = [], loading, initialSelectedCases=[], 
    onSelectionChange, testPlansForEdit,  tasksForTestPlan, setTestPlansForEdit }) => {
    const classes = cssClasses();
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTestPlan, setSelectedTestPlan] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

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
    startPage = currentPage > pagesToShow - 2 ? currentPage - Math.floor(pagesToShow / 2) : startPage;
    endPage = currentPage > pagesToShow - 2 ? Math.min(currentPage + Math.floor(pagesToShow / 2), totalPages) : endPage;
    const isPreviousDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;
    
    const handleSelectAllChange = () => {
        let newSelectedRows = [...selectedRows];

        if (!selectAll) {
            const newSelections = currentTableData.map((row, index) => ({
                name: row.Name,
                page: currentPage,
                rowIndex: index,
                task: row,
            }));

            newSelectedRows = [
                ...newSelectedRows,
                ...newSelections.filter(
                    sel => !newSelectedRows.some(existing =>
                        existing.name === sel.name &&
                        existing.page === sel.page &&
                        existing.rowIndex === sel.rowIndex
                    )
                )
            ];
        } else {
            newSelectedRows = newSelectedRows.filter(
                selected =>
                    !currentTableData.some(
                        (row, index) =>
                            selected.name === row.Name &&
                            selected.page === currentPage &&
                            selected.rowIndex === index
                    )
            );
        }

        setSelectedRows(newSelectedRows);
        setSelectAll(!selectAll);

        const selectedTasks = newSelectedRows.map(sel => sel.task);
        onSelectionChange(selectedTasks, selectedTestPlan);
    };

    const handleCheckboxChange = (e, rowName, rowIndex) => {
        const row = currentTableData[rowIndex];
        const rowIdentifier = {
            name: rowName,
            page: currentPage,
            rowIndex,
            task: row
        };

        let newSelectedRows;

        if (e.target.checked) {
            newSelectedRows = [...selectedRows, rowIdentifier];
        } else {
            newSelectedRows = selectedRows.filter(
                selected =>
                    !(selected.name === rowName &&
                        selected.page === currentPage &&
                        selected.rowIndex === rowIndex)
            );
        }

        setSelectedRows(newSelectedRows);

        setSelectAll(
            currentTableData.length > 0 &&
            currentTableData.every((row, index) =>
                newSelectedRows.some(
                    selected =>
                        selected.name === row.Name &&
                        selected.page === currentPage &&
                        selected.rowIndex === index
                )
            )
        );

        const selectedTasks = newSelectedRows.map(sel => sel.task);
        onSelectionChange(selectedTasks, selectedTestPlan);
    };

    useEffect(() => {
        setSelectAll(currentTableData.length > 0 && currentTableData.every((row, index) => selectedRows.some(selected => selected.name === row.Name && selected.page === currentPage && selected.rowIndex === index)));
    }, [selectedRows, currentPage, tableData]);

    const handleTestPlanChange = (event) => {
        const selectedPlanName = event.target.value;

        // Find the full test plan object based on the selected name
        const selectedPlanData = testPlans.find(plan =>{
            return plan.name === selectedPlanName
        });        
        
        if (selectedPlanData) {
            setSelectedTestPlan(selectedPlanData); // Update with full object
            
            const transformedDataForTable = selectedPlanData.task?.tasks?.map((task) => {
                return {
                    Name: task.displayName || '',
                    IDTag: task.name,
                };
            });
            setTableData(transformedDataForTable);

            
            let newSelectedRows = [];

            if (tasksForTestPlan && selectedPlanData.name === testPlansForEdit) {
                newSelectedRows = transformedDataForTable
                    .map((row, index) => {
                        const isSelected = tasksForTestPlan.some(task => task.name === row.IDTag && task.displayName === row.Name);
                        if (isSelected) {
                            const page = Math.floor(index / ITEMS_PER_PAGE) + 1;
                            const rowIndexOnPage = index % ITEMS_PER_PAGE;
                            return {
                                name: row.Name,
                                page,
                                rowIndex: rowIndexOnPage,
                                task: row
                            };
                        }
                        return null;
                    })
                    .filter(Boolean);

                onSelectionChange(newSelectedRows.map(sel => sel.task), selectedPlanData);
            } else {
                onSelectionChange([], selectedPlanData);
            }


            setSelectedRows(newSelectedRows);
            setSelectAll(transformedDataForTable.length > 0 && transformedDataForTable.every((row, index) =>
                newSelectedRows.some(selected => selected.name === row.Name && selected.page === currentPage && selected.rowIndex === index)
            ));

            setCurrentPage(1);
        } else {
            setSelectedTestPlan(null);
            setTableData([]);
            onSelectionChange([], null); 
        }
    };

    useEffect(() => {
        if(testPlansForEdit !== null){
            setSelectedTestPlan({"name": testPlansForEdit});
            handleTestPlanChange({ target: { value: testPlansForEdit } }); // Update table data
        } else if (testPlansForEdit === null && testPlans?.length > 0) {
            const defaultPlan = testPlans[0];
            setSelectedTestPlan(defaultPlan); // Default to the first test plan
            handleTestPlanChange({ target: { value: defaultPlan.name } });
        }
    }, [testPlans]);
    

    if (loading) {
        return <div className={`App p-3 ${classes.loadingContainer}`}>Loading...</div>;
    }

    let testplanTagCountr = 0;

    return (
        <div className="container mt-3 mb-3">
            <div className="card">
                <div className={`w-80`} style={{ width: '100%', border: 'none' }}>
                    <div className={`row mt-3 ms-2 mb-2`}>
                        <div className="col-5">
                            <label htmlFor="tool" className={`${classes.labeltable}`}>TEST PLAN</label>
                            <select
                                className={`select-input ${classes.selectInput}`}
                                name="tool"
                                required
                                id="tool"
                                value={selectedTestPlan?.name || ''}
                                onChange={handleTestPlanChange}
                            >
                                {testPlans.map((plan) => (
                                    <option key={plan.id} value={plan.name}>
                                        {plan.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <table className={`table ${classes.tableBorders}`}>
                        <thead>
                            <tr className={`${classes.tableHead}`}>
                                <th className={`${classes.colStyle}`} scope="col">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                </th>
                                <th className={`${classes.colStyle}`} scope="col">NAME</th>
                                <th className={`${classes.colStyle}`} scope="col">ID/TAG</th>
                            </tr>
                        </thead>
                        <tbody style={{ textAlign: '-webkit-center' }}>
                            {currentTableData.map((row, index) => {
                                return (
                                    <tr key={ "TestPlanTag" + testplanTagCountr++ }>
                                        <td className={`${classes.colStyle1}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.some(selected => selected.name === row.Name && selected.page === currentPage && selected.rowIndex === index)}
                                                onChange={(e) => { handleCheckboxChange(e, row.Name, index) }}
                                            />
                                        </td>
                                        <td className={`${classes.colStyle1}`}> {row.Name}</td>
                                        <td className={`${classes.colStyle1}`}>{row.IDTag}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
                </div>

            </div>
        </div>

    );
};

export default TestSuiteTable;