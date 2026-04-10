import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    parentDivFramework: {
        width: '100%', 
        border: 'none',
      },
      iconRight1: {
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '0.5rem',
        justifyContent: 'flex-end',
        width: '100%',
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
        fontSize: '13px',
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
        border: 'transparent',
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
      leftAlign: {
        textAlign: 'center',
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
      dataUnavailable:{
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
      customPagination: {
        '& .Mui-selected': {
          // border: '1px solid #000',
          backgroundColor: '#3373b2 !important',
          color: 'white'
    
        },
      },
      numCss: {
        color: 'white'
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
      Servicenamespan: {
        width: '8rem',
        color: 'red',
        fontSize: '0.9em',
        position: 'absolute',
        marginLeft: '49rem',
        top: '77.5%',
        transform: 'translateY(-50%)',
      },
      ClusternameSpan: {
        width: '8rem',
        color: 'red',
        fontSize: '0.9em',
        position: 'absolute',
        marginLeft: '49rem',
        top: '49%',
        transform: 'translateY(-50%)'
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '63%',
      },
      input4: {
        width: '95%',
        height: '2rem',
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '2px',
        marginLeft: '0.5rem',
      },
      toggleIcon: {
        cursor: 'pointer',
        marginLeft: '4px',
        marginRight: '-3px'
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
      createEnvironmentButton: {
        backgroundColor: '#13215E',
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
        marginTop: '1rem',
        padding: '0rem 1rem',
      },
      
      modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      modalContainer: {
        background: "white",
        padding: "4px",
        borderRadius: 8,
        width: 500,
        height: "auto",
        position: "absolute",
      },
      closeButton: {
        background: "none",
        border: "none",
        fontSize: '2rem',
        cursor: "pointer",
        position: "absolute",
        // top: '-10px',
        right: '10px',
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
    modalTitle: {
        color: '#13215E',
        fontWeight: 'bolder'
      },
      modalBody: {
        overflowY: 'auto', 
        maxHeight: 'calc(88vh - 210px)',
      },
      closeIcon: { 
        cursor: 'pointer',
        marginLeft: 'auto',
        width: '18px',
        height: '18px',
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
      buttonContainer: { 
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1rem',
        marginRight: '57%', 
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
        maxWidth:'13rem',
        '&::placeholder':{
      color:'rgb(186 186 190)',
        },
        '&:focus':{
          backgroundColor: 'white',
          borderBottom: '1px solid rgb(186 186 190)',
          boxShadow:'none',
          color:'rgb(186 186 190)',
        },
      },
      extendButton: {
        backgroundColor: '#2F78C4',
        color: 'white',
        borderRadius: '3px',
        border: 'transparent',
        padding: '0.2rem 0.5rem',
      },
      updateServiceIcon: {
        height: '15px',
        width: '15px',
        marginRight: '0.6rem',
        marginTop: '-7px',
    },
    colStyleNameRow: {
      width: '200px',
      display: 'flex',
      padding: '1rem 0.2rem !important',
      textAlign: 'left !important',
      color: '#2F78C4 !important',
      fontSize: '0.80rem !important',
      fontWeight: '700 !important',
      verticalAlign: 'middle !important',
  },
  cardHeading: {
    display: 'flex',
    justifyContent: 'space-between',
},
selectPriority: {
  height: '2.5rem', width: '100%', appearance: 'none', paddingLeft: '8px', border: '1px solid #D0D0D0'
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

//new

  divcss3:{
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  divcss4:{
    display: 'flex', alignItems: 'center', paddingLeft: '1rem', paddingBottom: '1rem'
  },
  labelcss1:{
    marginRight: '10px'
  },
  selectcss1:{
    padding: '5px',width:'99px'
  },
  inputgroup1:{
    border: 'none',
    borderBottom: '1px solid white',
    backgroundColor: 'white',
    borderRadius: '0',
  },
  bssearch1:{
    color: 'rgb(186 186 190)'
  },
  inputgroup2:{
    border: 'none',
    borderBottom: '1px solid white',
    backgroundColor: 'white',
    borderRadius: '0',
  },
  bsx:{
    color: 'rgb(186 186 190)',
    fontSize: '23px',
    marginTop: '-7px',
  },
  divcss5:{
    display: 'flex', 
    justifyContent: 'flex-end', 
    margin: '0rem 1rem 0.5rem 0rem'
  },
  tdcss1:{
    textAlign: 'center'
  },
  trcss1:{
    display: 'table-row'
  },
  tdcss2:{
    padding: '10px', 
    textAlign: 'center', 
    verticalAlign: 'middle'
  },
  inputcss1:{
    cursor: 'pointer'
  },
  tdcss3:{
    padding: '10px', 
    textAlign: 'center', 
    verticalAlign: 'middle'
  },
  divcss6:{
    display: 'flex', 
    lignItems: 'center', 
    gap: '0px'
  },
  linkcss:{
    textDecoration: 'none', 
    color: '#2F78C4',
    fontWeight: '700', 
    cursor: 'pointer'
  },
  tdcss4:{
    padding: '10px', 
    textAlign: 'center', 
    verticalAlign: 'middle'
  },
  divcss7:{
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    fontSize: '1.2rem',
    paddingTop: '1.5rem',
    paddingBottom: '1.5rem'
  }


}));

export default cssClasses;
