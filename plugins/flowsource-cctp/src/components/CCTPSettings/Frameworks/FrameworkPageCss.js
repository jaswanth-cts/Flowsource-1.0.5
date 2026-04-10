import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    parentDivFramework: {
        width: '100%',
        border: 'none',
    },
    marginbottom1: {
        marginBottom: '1rem',
    },
    marginleft: {
        marginLeft: '10px',
    },
    buttonStyle: {
        margin: '0 3px', // Add spacing between buttons
        fontSize: '13px',
        minWidth: '87px',
        height: '35px',
        borderRadius: '6px'
    },
    iconRight: {
        // marginBottom: '1rem', 
        display: 'flex',
        alignItems: 'center',
        height: '10px',
    },
    marginright1: {
        marginRight: '1rem',
    },
    cursorNotAllowed: {
        cursor: 'not-allowed',
    },
    cursorPointer: {
        cursor: 'pointer',
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
        fontSize: '12px',
    },
    dialogOverlay: {
        position: "fixed",
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
        cursor: 'pointer',
        marginRight: '10px',
        border: 'none',
        width: '4rem'
    },
    dialogBoxNoButton: {
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        width: '4rem'
    },
    dialogOverlayError: {
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
    dialogBoxError: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        textAlign: 'center',
        width: '35rem',  // Fixed width for the dialog box
        wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
    },
    errorDialogBoxButton: {
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        width: '4rem',
        backgroundColor: '#000048'
    },
    newFrameworkBorder: {
        border: '2px solid #000048',
        borderRadius: '2px',
        padding: '4px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '10vh',
        paddingTop: '30%',
    },
    tableBorders: {
        // border: '0.1rem solid #dee2e6',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        "& th": {
            backgroundColor: '#000048',
            color: 'white',
        },
        "& th.checkboxColumn": {
            width: '3%',
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
    checkbox: {
        accentColor: "#89CFF0",
    },
    colStyle1: {
        padding: '0.2rem 0.2rem !important',
        fontSize: '13px',
        alignItems: 'left',
    },
    tablefont: {
        color: '#2F78C4',
        fontSize: '0.80rem',
        fontWeight: '700',
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
    ulCss: {
        lineHeight: '1rem',
        paddingRight: '2rem',
    },
    numCss: {
        color: 'white'
    },
    customPagination: {
        '& .Mui-selected': {
            // border: '1px solid #000',
            backgroundColor: '#3373b2 !important',
            color: 'white'

        },
    },

    parentDiv: {
        width: '100%',
        border: 'none',
    },
    newFrameworkTitle: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#13215E',
        marginBottom: '1rem',
        marginLeft: '1rem',
        marginTop: '1rem',
    },
    form: {
        marginTop: '1.2rem',
    },
    formGroup: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bolder',
        marginLeft: '1.3rem',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    input: {
        width: '60%',
        height: '2rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '2px',
        marginLeft: '0.5rem',
    },
    errorIcon: {
        color: '#d66d6d',
        fontSize: '14px',
        marginTop: '5px',
        display: 'flex',
        alignItems: 'center',
        "& p": {
            color: '#d66d6d',
            margin: '0',
            paddingLeft: '5px',
        }
    },
    grayLabel: {
        color: '#606060',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '63%',
    },
    input_config: {
        width: '60%',
        height: '2rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '2px',
        marginLeft: '0.5rem',
        flex: '1',
        cursor: 'not-allowed',
        color: 'gray',
        backgroundColor: 'lightgray',
    },
    editIcon: {
        marginLeft: '12px',
        cursor: 'pointer',
    },
    horizontalLine: {
        width: '98%',
        margin: '0.5rem 0.7rem',
    },
    marginleft15: {
        marginLeft: '15px',
    },
    buttonStyleNewFramework: {
        margin: '0 5px', // Add spacing between buttons
        fontSize: '13px',
        minWidth: '87px',
        height: '35px',
        borderRadius: '6px'
    },
    dropdownLabel: {
        display: 'block',
        marginBottom: '0.1rem',
        fontWeight: 'bolder',
        marginLeft: '1.3rem',
        minWidth: '50px',
        fontSize: '0.8rem',
    },
    dropdown: {
        height: '2rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '2px',
        cursor: 'pointer',
    },
    stepInput: {
        width: '40%',
        height: '2rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '2px',
        marginLeft: '1.3rem',
        marginRight: '0.5rem',
    },
    addRemoveButton: {
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '0.5rem',
        marginLeft: '1rem',
        "& img": {
            width: '16px',
        }
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1rem',
        marginRight: '57%',
    },
    disableButton: {
        backgroundColor: '#9fbfd4',
        color: 'white',
        height: '32px',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        margin: '1rem 1rem 1rem 0',
        padding: '0rem 1rem',
        border: 'transparent',
    },
    submitCancelButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '32px',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        border: 'transparent',
        margin: '1rem 1rem 1rem 0',
        padding: '0rem 1rem',
    },
    modalTitle: {
        color: '#13215E',
        fontWeight: 'bolder'
    },
    modalBody: {
        overflowY: 'auto',
        maxHeight: 'calc(88vh - 210px)',
    },
    modalInputLeft: {
        width: '20%',
        height: '2rem',
        padding: '0.5rem',
        marginLeft: '0.5rem',
        border: 'none',
    },
    modalInputRight: {
        width: '60%',
        height: '2rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '2px',
        marginLeft: '1rem',
        backgroundColor: 'lightgray',
    },
    modalButtonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    modalDoneButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        border: 'transparent',
        marginRight: '1rem',
        padding: '0rem 1rem',
    },
    modalCancelButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        border: 'transparent',
        padding: '0rem 1rem',
    },

}));

export default cssClasses;