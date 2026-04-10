import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    isLoadingStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '10vh',
        paddingTop: '30%'
    },
    buttonOptionsSection: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        margin: '0rem 1rem 0.5rem 0rem',
    },
    deleteCreateIcon: {
        height: '15px',
        width: '15px',
        cursor: 'pointer',
    },
    deleteCreateIconText: {
        fontSize: '13px',
        color: '#000048 !important'
    },
    tableBorders: {
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        "& th": {
            backgroundColor: '#000048',
            color: 'white',
            padding: '0.5rem', // Add padding for space
        },
        "& th.checkboxColumn": {
            width: '5%',
        },
        "& th.nameColumn": {
            //  width: '15%',
            textAlign: 'center',
            //paddingLeft: '7rem', // Add padding for space
        },
        "& tbody": {
            textAlign: '-webkit-center',
        },
        "& td": {
            padding: '0.5rem', // Add padding for space
            textAlign: 'center !important'
        },
        "& td.colStyleDelete": {
            textAlign: 'right !important', // Align to the right
            paddingRight: '5rem',
        },
    },
    tableHead: {
        fontSize: '0.8rem',
        textAlign: 'center',
        backgroundColor: '#000048',
        color: 'white',
        padding: '0.5rem', // Add padding for space
    },
    colStyle: {
        padding: '0.5rem', // Adjusted padding for space
        fontSize: '13px',
    },
    colStyleNameRow: {
        //display: 'flex',
        padding: '0.5rem', // Adjusted padding for space
        textAlign: 'left !important',
        fontSize: '0.80rem !important',

    },
    dataUnavailable: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        margin: 0,
        paddingRight: '1rem',
        paddingBottom: '1rem',
    },
    customPagination: {
        '& .Mui-selected': {
            backgroundColor: '#000048 !important',
            color: 'white'

        },
    },
    numCss: {
        color: 'white'
    },
    ulCss: {
        lineHeight: '0.70rem',
        paddingRight: '1rem',
    },
    dialogOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    dialogBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        textAlign: 'center'
    },
    dialogBoxYesButton: {
        color: 'white',
        backgroundColor: '#000048',
        cursor: 'pointer',
        marginRight: '10px',
        border: 'none',
        width: '4rem'
    },
    dialogBoxNoButton: {
        color: 'white',
        backgroundColor: 'grey',
        cursor: 'pointer',
        border: 'none',
        width: '4rem'
    },

    // Create Application Modal CSS STARTS HERE
    createApplicationHeading: {
        color: '#13215E',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        width: 'max-content',
        padding: '0rem 0rem 1rem 1rem',
    },
    formSection: {
        width: '36rem',
    },
    applicationNameSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    applicationFormInputSection: {
        display: 'flex',
        width: 'max-content',
        padding: '0rem 0rem 0.5rem 1rem',
        alignItems: 'center'
    },
    applicationNameLabel: {
        color: '#13215E',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    nameAstrix: {
        color: '#d66d6d !important',
    },
    applicationNameInput: {
        width: '28rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        paddingLeft: '0.3rem',
    },
    nameAlreadyTakenIcon: {
        color: '#d66d6d',
        fontSize: '13px',
        paddingLeft: '13rem',
    },
    applicationFormButtonSection: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.8rem',
        padding: '0.5rem 0.8rem 1rem 1rem',
    },
    createApplicationButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
    },
    disableButton: {
        backgroundColor: '#9fbfd4',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
    },
    cancelButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
    },
    popUpErrorBox: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
    },
    popUpErrorBoxCard: {
        backgroundColor: 'white',
        padding: '0.3rem',
        borderRadius: '5px',
        textAlign: 'center',
        width: '35rem',  // Fixed width for the dialog box
        wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
    },
    popUpErrorBoxButton: {
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        width: '4rem',
        backgroundColor: '#000048',
    },
    nameErrorCssname: {
        width: '8rem',
        color: 'red',
        fontSize: '0.9em',
        position: 'absolute',
        marginLeft: '36rem',
        //   left: 'calc(100% + 0px)', // Adjust the position as needed
        top: '53%',
        transform: 'translateY(-50%)',
    },
    nameErrorCssdesc: {
        width: '8rem',
        color: 'red',
        fontSize: '0.9em',
        position: 'absolute',
        marginLeft: '36rem',
        //   left: 'calc(100% + 0px)', // Adjust the position as needed
        top: '69%',
        transform: 'translateY(-50%)',
    },
    searchStyle:{
        color: 'rgb(186 186 190)',
        backgroundColor: 'white',
        border: 'none',
        width: '200px',
        borderRadius: '0px',
        borderBottom: '1px solid rgb(186 186 190)',
        height:'29px',
        fontSize:'small',
        maxWidth:'10rem',
        '&::placeholder':{
      color:'rgb(186 186 190)',
        },
        '&:focus':{
          backgroundColor: 'white',
          borderBottom: '1px solid rgb(186 186 190)',
          boxShadow:'none',
          color:'rgb(186 186 190)'
        },
      },    
}));

export default cssClasses;