import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({
    barChartHeading: {
        backgroundColor: '#000048',
        color: '#ffffff',
        padding: '0.6rem 0rem 0.6rem 1rem',
        fontSize: '0.82rem'
    },
    mainTableStyle: {
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
    },
    tableCell: {
        height: '10px !important'
    },
    tableHead: {
        fontSize: '13px !important',
        textAlign: 'center !important',
        backgroundColor: '#ccc8c8 !important',
        color: '#58589d !important',
    },
    colThStyle: {
        backgroundColor: '#ccc8c8 !important',
        color: '#58589d !important',
    },
    tBody: {
        textAlign: 'center !important',
    },
    colTdStyle: {
        fontSize: '13px',
    },
    colTdArrowStyle: {
        paddingRight: '2rem !important',
    },
    ulCss: {
        lineHeight: '0.75rem',
    },
    customPagination: {
        '& .Mui-selected': {
            backgroundColor: '#3373b2 !important',
            color: 'white'
        },
    },
    paginationBoxStlye: {
        paddingRight: '1rem',
    },
    dataUnavailable:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        margin: 0,
        padding: '0.5rem 1rem 1rem 0rem',
        fontSize: '0.88rem !important',
    },
    
    barGraph: {
        height: '15rem', 
        padding: '0rem 1.5rem 0rem 0.7rem'
    },

    isLoadingStyle: {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        height: '10vh', 
        paddingTop: '30%' 
    },
    noDataMain: {
        padding: '0rem 1rem 0rem 1rem'
    },
    noDataHeading: {
        fontSize: '1.2rem !important',
    },
    noDataMessage: {
        display:'flex', 
        justifyContent: 'center', 
        width: '100%', 
        fontSize: '1.1rem', 
        paddingTop: '1.5rem', 
        paddingBottom: '2rem'
    },
}));

export default cssClasses;