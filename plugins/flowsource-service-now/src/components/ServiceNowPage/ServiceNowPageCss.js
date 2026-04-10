import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles({
    tableStriped1: {
        "& tbody": {
            "& tr": {
                "& td": {
                    fontSize: "0.80rem"
                },
                "& th": {
                    fontSize: "0.9rem"
                }
            },
            "& tr:nth-child(2n+1)": {
                "& td": {
                    backgroundColor: '#E5F7FF',
                },
                "& th": {
                    backgroundColor: '#E5F7FF',
                }
            },
        }
    },
    linkStyle:{
        textDecoration:'none',
        color:'#3694ff'
    },
    header: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
    },
    ulCss:{
        lineHeight:'1rem',
    },
    customPagination: {
        '& .Mui-selected': {
            // border: '1px solid #000',
            backgroundColor: '#3373b2 !important',
            color:'white'
        },
    },
    numCss:{
        color:'white'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    pageItem: {
        margin: '0 2px',
    },
    paginations: {
        marginTop: "1rem",
        marginLeft: "1rem",
    },
    pluginHeading: {
      display: 'flex',
      justifyContent: 'space-between',
      marginLeft: '15px',
    },
    priorityOption: {
        fontWeight: 'bold',
        fontSize: '13px',
        marginLeft: '30px'
    },
    stateOption: {
        fontWeight: 'bold',
        fontSize: '13px',
    },
    pluginVersion: {
        float: 'right',
        marginTop: '-13px',
        marginLeft: '20px'
    },
    priorityFilterBox: {
        fontSize: '12px',
        height: '25px',
        marginTop: '-3px',
        fontSize: '13px',
        minWidth: '100px',
        marginBottom: '11px',
    },
    stateFilterBox: {
        fontSize: '12px',
        height: '25px',
        marginTop: '-3px',
        fontSize: '13px',
        minWidth: '100px',
        marginBottom: '10px',
    },
    searchBox: {
        fontSize: '15px',
        height: '25px',
        padding: '5px',
        marginTop: '-14px',
        marginLeft: '10px'
    },
    isLoading: {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        paddingTop: '30%' 
    },
});


export default cssClasses;