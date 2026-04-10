import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    createRobotHeading: {
        color: '#13215E',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        width: 'max-content',
        padding: '0rem 0rem 1rem 1rem',
    },
    formSection: {
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content',
    },
    formInputSections: {
        display: 'flex',
        gap: '6rem',
    },
    formRowOne: {
        margin: '0rem 0rem 0rem 0.5rem',
    },
    formRowTwo: {
        margin: '0rem 1rem 0rem 0rem',
    },
    robotNameSection: {
        display: 'flex',
        flexDirection: 'column',
        width: 'max-content',
    },
    robotFormInputSection: {
        display: 'flex',
        width: 'max-content',
        padding: '0rem 0rem 0.5rem 1rem',
        alignItems: 'center'
    },
    robotFormInputSectionTwo: {
        display: 'flex',
        width: 'max-content',
        padding: '0rem 0rem 0.5rem 1rem',
        alignItems: 'center'
    },
    robotNameLabel: {
        color: '#13215E',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '60px',
        fontSize: '0.8rem',
    },
    nameAstrix: {
        color: '#d66d6d !important',
    },
    robotNameInput: {
        width: '18rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        paddingLeft: '0.3rem',
    },
    nameAlreadyTakenIcon: { 
        color: '#d66d6d',
        fontSize: '13px',
        paddingLeft: '9rem',
    }, 
    robotStatusLable: {
        color: '#9fbfd4 !important',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '60px',
        fontSize: '0.8rem',
    },
    robotStatusInput: {
        color: '#bbbbbb',
        backgroundColor: '#ececec',
        width: '18rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        cursor: 'not-allowed',
        paddingLeft: '0.3rem',
    },
    robotFormTwoLable: {
        color: '#9fbfd4 !important',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    robotFormTwoInput: {
        color: '#bbbbbb',
        backgroundColor: '#ececec',
        width: '18rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        cursor: 'not-allowed',
        paddingLeft: '0.3rem',
    },
    robotFormButtonSection: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.8rem',
        padding: '0.5rem 1rem 1rem 1rem',
    },
    updateRobotButton: {
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
      isLoadingStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '10vh',
        paddingTop: '30%'
    },

}));

export default cssClasses;