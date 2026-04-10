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
    },
    disabledLink: {
        pointerEvents: 'none',
        opacity: '0.5',
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
        },
        "& th.checkboxColumn": {
            width: '5%',
        },
        "& th.nameColumn": {
            width: '15%',
        },
        "& tbody": {
            textAlign: '-webkit-center',
        },
    },
    tableHead: {
        fontSize: '0.8rem',
        textAlign: 'center',
        backgroundColor: '#000048',
        color: 'white',
    },
    thWithImg: {
        width: '10% !important',
    },
    checkBox: {
        accentColor: "#89CFF0",
    },
    colStyle: {
        padding: '0.2rem 0.2rem !important',
        fontSize: '13px',
    },
    colStyleNameRow: {
        display: 'flex',
        padding: '0.2rem 0.2rem !important',
        textAlign: 'left !important',
        color: '#2F78C4 !important',
        fontSize: '0.80rem !important',
        fontWeight: '700 !important',
    },
    downloadRobotIcon: {
        height: '11px',
        width: '11px',
        marginRight: '0.6rem',
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
    cardHeading: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    cardHeadingText: {
        padding: '0.7rem 0rem 0.2rem 1rem', 
        fontWeight: 'bold !important', 
        color: '#000048 !important',
    },
    cardCloseButton: {
        padding: '0.8rem 1rem 0.2rem 0rem',
    },
    cardBody: {
        backgroundColor: '#ececec !important',
        margin: '0rem 0rem 1rem 1rem',
    },
    cardContent: {
        padding: '0.5rem 0.8rem 0.5rem 1rem',
        wordWrap: 'break-word',
        overflow: 'hidden',
        maxHeight: '12rem',
        overflowY: 'scroll',
    },
    dataUnavailableForPopUp: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        margin: 0,
        padding: '0.5rem 1rem 0.5rem 1rem',
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

    // Create Robot Modal CSS STARTS HERE
    createRobotHeading: {
        color: '#13215E',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        width: 'max-content',
        padding: '0rem 0rem 1rem 1rem',
    },
    formSection: {
        width: '28rem',
    },
    robotNameSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    robotFormInputSection: {
        display: 'flex',
        width: 'max-content',
        padding: '0rem 0rem 0.5rem 1rem',
        alignItems: 'center'
    },
    robotNameLabel: {
        color: '#13215E',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    nameAstrix: {
        color: '#d66d6d !important',
    },
    extendButton: {
        backgroundColor: '#2F78C4',
        color: 'white',
        borderRadius: '3px',
        border: 'transparent',
        padding: '0.2rem 0.5rem',
    },
    robotNameInput: {
        width: '20rem',
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
    robotStatusLable: {
        color: '#9fbfd4 !important',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    robotStatusInput: {
        color: '#bbbbbb',
        backgroundColor: '#ececec',
        width: '20rem',
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
        padding: '0.5rem 0.8rem 1rem 1rem',
    },
    createRobotButton: {
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
      popUpDownloadBox: {
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
      popUpDownloadBoxCard: {
        backgroundColor: 'white',
        padding: '0.3rem',
        borderRadius: '5px',
        textAlign: 'center',
        width: '35rem',  // Fixed width for the dialog box
        wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
      },
      popUpDownloadBoxButton: {
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        width: '4rem',
        backgroundColor: '#000048',
      },

    // CREATE Robot Modal CSS ENDS HERE.
    
}));

export default cssClasses;