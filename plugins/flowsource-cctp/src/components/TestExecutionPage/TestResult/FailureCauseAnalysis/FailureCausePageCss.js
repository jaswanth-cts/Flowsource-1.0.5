import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '10vh',
        paddingTop: '30%',
    },
    failureCauseCardHeader: {
        backgroundColor: "#000048",
        color: "white",
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    failureCountDiv: {
        width: "200px",
        height: "100px",
        backgroundColor: "white",
        border: "1px solid #e6c7c7",
        borderRadius: "8px",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "50px",
        color: "#dd6a6a",
    },
    failureCountSpan: {
        fontSize: "17px",
        marginTop: "11%",
        paddingLeft: "3%",
        color: "black",
    },
    failureDescriptionDiv: {
        maxHeight: "80%",
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    failureDescriptionTable: {
        borderCollapse: "collapse",
        marginBottom: "0"
    },
    failureDescriptionTableTh: {
        fontWeight: "bold",
        fontSize: "15px",
        position: "sticky",
        top: 0,
        backgroundColor: "#f8f9fa",
        zIndex: 1,
        borderBottom: "2px solid #ccc",
    },
    failureDescriptionTableRow: {
        borderBottom: "2px solid #ccc",
    },
    issueCircle: {
        width: "200px",
        height: "200px",
        position: "relative",
        bottom: '2rem'
    },
    issueCircleInnerDiv: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
    },
    issueCircleText1: {
        fontSize: "28px",
        fontWeight: "bold",
    },
    issueCircleText2: {
        fontSize: "18px",
        fontWeight: "bold",
    },
    chipDiv: {
        backgroundColor: "#06C7CC",
        color: "black",
        cursor: "pointer",
    },
    chartContainer: {
        maxWidth: 600,
        marginLeft: "15rem",
        padding: "20px",
    },
    chartDiv: {
        width: '100%',
        height: '200px',
    },
    testCaseDiv: {
        maxHeight: "300px",
        overflowY: "auto",
        overflowX: "hidden",
        border: "1px solid #dee2e6",
    },
    testCaseTableTh: {
        position: "sticky",
        top: 0,
        zIndex: 1,
    },
    testCaseTableBody1: {
        borderBottom: "1px solid #dee2e6",
        cursor: "pointer",
        "& td": {
            backgroundColor: "transparent",
        },
        "& td.active": {
            backgroundColor: "#F1F1F1",
        },
    },
    logsDiv: {
        maxHeight: "300px",
    },
    navLink: {
        backgroundColor: 'transparent',
        color: 'black',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        '&:hover': {
            textDecoration: 'none',
        },
        '&:focus, &:active': {
            outline: 'none',
            boxShadow: 'none',
        },
    },
    activeNavLink: {
        backgroundColor: '#000048',
        color: 'white',
        '&:focus, &:active': {
            color: 'white',
            outline: 'none',
        },
    },
    navCardBody: {
        maxHeight: "300px",
        overflowY: "auto",
        overflowX: "hidden",
    },
    navCardContent: {
        fontSize: "12px",
        whiteSpace: "pre-wrap",
    },
    screenshotContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
    },
    cursor: {
        cursor: 'pointer'
    },
    thumbnailImage: {
        width: "100px",
        height: "100px",
        objectFit: "fill",
        borderRadius: "4px",
        border: "1px solid #ddd",
    },
    tableDiv: {
        height: "15rem",
    },
    predictionTable: {
        marginBottom: "0",
        borderCollapse: 'collapse'
    },
    tableHead: {
        backgroundColor: '#000048',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        display: 'table',
        width: '100%',
        "& th": {
            backgroundColor: "#000048",
            color: "white",
            textAlign: "left",
        },
        "& th:first-child": {
            width: "20%",
        },
        "& th:last-child": {
            width: "80%",
        },
    },
    ulCss: {
        lineHeight: '1rem',
        paddingRight: '2rem',
    },
    customPagination: {
        '& .Mui-selected': {
            backgroundColor: '#3373b2 !important',
            color: 'white'

        },
    },
    numCss: {
        color: 'white'
    },
    predictionTableBody: {
        fontSize: '12px',
        display: 'block',
        width: '100%'
    },
    predictionTableTr: {
        display: "table",
        width: '100%',
        tableLayout: 'fixed'
    },
    predictionTableTd1: {
        paddingLeft: "1%",
        width: "19.9%",
        fontSize: '15px'
    },
    predictionTableTd2: {
        height: "100px",
        overflowY: "auto",
        display: "block",
        maxWidth: "100%"
    },
    modalBackdrop: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: '999',
    },

    modalContainer: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '20px',
        zIndex: '1000',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
    },

    modalContent: {
        textAlign: 'center',
    },

    modalImage: {
        width: '100%',
        height: 'auto',
        maxWidth: '800px',
        maxHeight: '800px',
        borderRadius: '8px',
        objectFit: 'contain', 
    },

    modalFooter: {
        marginTop: '20px',
        justifyContent: 'flex-end !Important',
        display: 'flex',
    },

    closeButton: {
        backgroundColor: '#92bbe6',
        color: 'rgb(19, 33, 94)',
        border: '1.3px solid #92bbe6',
        borderRadius: '16px',
        fontSize: '1rem',
        width: '72px',
        height: '35px',
        fontWeight: 'bold',
    },
}));

export default cssClasses;