import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  parentDivFramework: {
    width: '100%', 
    border: 'none',
  }, 
  marginleft10: {
    marginLeft: '10px',
  },
  tabNames: { 
    marginRight: '10px', 
    fontSize: '0.875rem',
    fontFamily: 'Helvetica',
    color: '#13215E',
    backgroundColor: 'none',
    fontWeight: 'bold',
  },
  tabArrow: {
    marginRight: '10px',
  },
  tabArrowIcon: {
    height: '13px'
  },
  iconRight: {
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  marginright1: {
    marginRight: '1rem',
  },
  deleteIcon: {
    height: '15px', 
    width: '15px',
  },
  deleteCreateIconText: {
    fontSize: '0.875rem',
    fontFamily: 'Helvetica'
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
      width: '5%',
        },
    "& th.nameColumn": {
      width: '20%',
        },
    "& th.robotColumn": {
      width: '15%',
        },
    "& th.executionColumn": {
      width: '15%',
        },
    "& th.iconColumn": {
      width: '4%',
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
  colStyle1: {
    padding: '0.2rem 0.2rem !important',
    fontSize: '13px',
  },
  checkbox: {
    accentColor: "#89CFF0",
  },
  tablefont: {
    color: '#2F78C4',
    fontSize: '0.80rem',
    fontWeight: '700',
  },
  btnstatus: {
    cursor: 'none',     
    width: '4.5rem',     
    borderRadius: '6rem', 
    fontSize: '0.7rem', 
  },
  statuspassed: {
    backgroundColor: '#11BF6A', 
    color: '#FFFFFF', 
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
  errorText: {
    color: '#d66d6d',
  },
  backbutton: {
    color: '#13215E',
    backgroundColor: 'none',
    // fontWeight: 'bold',
    width: 'fit-content',
    fontSize: '0.875rem',
    fontFamily: 'Helvetica'
  },
  backbuttonIcon: {
    fontSize: '16px',
    fontFamily: 'Helvetica'
  },
  dialogOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
  },
  dialogBox: {
    background: "white",
    width: "80%",
    maxWidth: "600px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    padding: "0rem 1rem 1rem 1rem",
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    top: "0",
    zIndex: "1",
    color: "#000048",
  },
  dialogHeaderText: {
    fontSize: "20px",
    fontWeight: "bolder",
    paddingTop: "5px",
  },
  closeButtonDialogBox: {
    background: "none",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    marginLeft: "auto",
    color: "#000048",
    top: "0",
    marginRight: "-0.5rem",
  },
  dialogBoxOkButton: {
    backgroundColor: "#000048",
    color: 'white',
    cursor: 'pointer',
    marginRight: '10px',
    border: 'none',
    width: '4rem'
  },
  dialogBoxContent: {
    marginTop: "0", flex: "1", overflowY: (props) => props.hasErrorLog && !props.isErrorLoading ? 'auto' : 'hidden', // 'auto' ensures the scrollbar appears only when needed 
    overflowX: "hidden", 
    textAlign: "right", 
    scrollbarWidth: "thin",
  },
  textWrap: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    textAlign: "left",
    margin: "0",
  },
  dialogBoxLoading: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    overflowY: "scroll",
    overflowX: "hidden",
  },
  dialogOverlayRerun: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
  },
  dialogBoxRerun: {
    background: "white",
    width: "80%",
    maxWidth: "500px",
    height: "200px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    padding: "0rem 1rem 1rem 1rem",
  },
  dialogHeaderRerun: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    top: "0",
    zIndex: "1",
    color: "#000048",
    marginTop: "1rem",
  },
  dialogHeaderRerunText: {
    fontSize: "20px",
    fontWeight: "bolder",
    paddingTop: "5px",
  },
  closeButtonRerunDialogBox: {
    background: "none",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    marginLeft: "auto",
    color: "#000048",
    top: "0",
    marginRight: "-0.5rem",
  },
  dialogBoxContentRerun: {
    marginTop: "0.5rem",
    flex: "1",
    marginLeft: "1rem",
    display: "flex",
    alignItems: "center",
  },
  rerunDropdownLabel: {
    marginTop: '0.5rem', 
    fontSize: '0.9rem', 
    color: '#36454F',
  },
  robotSelect: {
    width: '30%',
    padding: '1px',
    marginTop: '8px',
    marginLeft: '0.6rem',
    border: 'none',
    borderRadius: '4px',
    minWidth: '40px', 
    height: "2rem",
    color: '#000048',
  },
  dialogBoxFooterRerun: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  rerunDialogBoxButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem',
    height: '1.5rem',
    backgroundColor: '#000048'
  },
  dialogOverlayRerunStatus: {
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
  dialogBoxRerunStatus: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center'
  },
  rerunsuccess: {
    color: '#11BF6A',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  rerunerror: {
    color: '#d66d6d',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  cursorNotAllowed: {
    cursor: 'not-allowed',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  disabledLink: { 
    pointerEvents: 'none', 
    opacity: '0.5',
  },
  dialogOverlayDelete: {
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
  dialogBoxDelete: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center'
  },
  dialogBoxYesButtonDelete: {
    color: 'white',
    cursor: 'pointer',
    marginRight: '10px',
    border: 'none',
    width: '4rem'
  },
  dialogBoxNoButtonDelete: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem'
  },
  dialogOverlayDeleteError: {
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
  dialogBoxDeleteError: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center',
    width: '35rem',  // Fixed width for the dialog box
    wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
  },
  deleteErrorDialogBoxButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem',
    backgroundColor: '#000048'
  },
  
}));

export default cssClasses;