import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({
  parentDivFramework: {
    width: '100%', 
    border: 'none',
  },
  secondDiv: {
    textAlign: 'end', 
    marginRight: '1rem',
  },
  reportClientConfig: {
    height: '10%',
    width: '6%',
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
      borderCollapse: 'collapse'
    },
    tableHead: {
      fontSize: '0.8rem',
      textAlign: 'center',
      backgroundColor: '#000048',
      color: 'white',
    },
    colStyle: {
      color: 'white !important',
      backgroundColor: '#000048 !important',
    },
    priorityCircle: {
      width: '30px',
      color: '#FFFFFF',
      height: '30px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#11BF6A',
      border: '1px solid #11BF6A',
      marginbottom: '9px',
      fontSize: '0.8rem',
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
  performanceIconImg: {
      width: '15px', 
      height: '15px', 
      marginRight: '3px', 
      marginLeft: '15px',
      marginBottom: '1px'
    },
    performanceIconText: {
      fontSize: '0.9rem',
      color: '#000048',
      
    },
    accessibilityIconImg: {
      width: '15px', 
      height: '15px', 
      marginRight: '3px', 
      marginLeft: '17px',
      marginBottom: '1px'
    },
    accessibilityIconText: {
      fontSize: '0.9rem',
      paddingLeft: '2px',
      color: '#000048' 
    },
    fontlabel: {
      fontWeight: 'bold',
      fontColor: '#070707',
    },
  colStyle1: {
    padding: '0.9rem 0rem 0rem 0rem !important',
    fontSize: '14px',
  },
  colStyleButton: {
    fontSize: '13px',
  },
  button: {
  width: '7rem',
  color: 'white',
  fontSize: '0.8rem',
  marginRight: '0.5rem',
  height: '30px',
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'transparent',
  padding: '0rem 1rem',
  },
  disablebutton: {
  height: '1.9rem',
  width: '7rem',
  color: '#000048',
  fontSize: '0.8rem',
  backgroundColor: 'white',
  },
  loadingText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '10vh',
    paddingTop: '30%'
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
  disabledLink: { 
    pointerEvents: 'none', 
    opacity: '0.5',
  },
  cursorNotAllowed: {
    cursor: 'not-allowed',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  marginright1: {
    marginRight: '1rem',
  },
  loaderSpinner: {
    height: '17px',
    width: '17px',
    cursor: 'default',
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
    labeltable: {
      alignContent: 'center',
      paddingRight: '1.5rem',
      color: '#13215E',
      fontWeight: 'bold',
      width: 'fit-content',
    },
    selectInput: {
      height: '2.5rem',
      width: '14.3rem',
      paddingLeft: '8px'
    },
    NameInput: {
      width: '48rem', height: '2.5rem', marginTop: '-3rem', marginLeft: '9rem', border: '1px solid #D0D0D0', paddingLeft: '8px'
    },
    labelType: {
      fontWeight: 'bold',
      fontColor: '#070707',
      alignContent: 'center',
      paddingRight: '7rem',
      color: '#070707'
    },
    labelService: {
      fontWeight: 'bold',
      fontColor: '#070707',
      alignContent: 'center',
      paddingRight: '20%',
      color: '#070707'
    },
    selectType: {
      height: '2.5rem', width: '16.6rem', appearance: 'none', paddingLeft: '8px', borderColor: '#D0D0D0'
    },
    labelPriority: {
      fontWeight: 'bold',
      fontColor: '#070707',
      alignContent: 'center', paddingRight: '1rem', color: '070707'
    },
    selectPriority: {
      height: '2.5rem', width: '70%', appearance: 'none', paddingLeft: '8px', border: '1px solid #D0D0D0'
    },
    labelReruncount: {
      alignContent: 'center', paddingRight: '3.7rem',
      fontWeight: 'bold',
      fontColor: '#070707',
    },
    selectReruncount: {
      height: '2.5rem', width: '16.5rem', paddingLeft: '8px', border: '1px solid #D0D0D0'
    },
    labelTool: {
      alignContent: 'center', paddingRight: '7.2rem',
      fontWeight: 'bold',
      fontColor: '#070707',
    },
    selectTool: {
      height: '2.5rem', width: '16.5rem', appearance: 'none', paddingLeft: '8px', borderColor: '#D0D0D0'
    },
    labelConfig: {
      alignContent: 'center', paddingRight: '1rem', color: 'lightgray',
      fontWeight: 'bold',
      fontColor: '#070707',
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
      paddingLeft: '8px', borderColor: '#D0D0D0'
    },
    editIcon: {
      marginLeft: '12px',
      cursor: 'pointer',
    },
    modalTitle: {
      color: '#13215E',
      fontWeight: 'bolder'
    },
    closeIcon: {
      cursor: 'pointer',
      marginLeft: 'auto',
      width: '18px',
      height: '18px',
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
      fontSize: '0.8rem',
      marginRight: '0.5rem',
      height: '30px',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'transparent',
      padding: '0rem 1rem',
      },
    labelArgs: {
      alignContent: 'center', 
      paddingRight: '1.7rem', 
      color: 'lightgray',
      fontWeight: 'bold',
      fontColor: '#070707',
    },
    labelRobotstype: {
      alignContent: 'center', 
      paddingRight: '3.6rem',
      fontWeight: 'bold',
      fontColor: '#070707',
    },
    selectRobotstype: {
      height: '2.5rem', 
      width: '48rem', 
      appearance: 'none', 
      paddingLeft: '8px', 
      borderColor: '#D0D0D0'
    },  
    labelRobots: {
      position: 'absolute',
      left: '8%',
      transform: 'translateX(-47%)',
      paddingRight: '5.8rem',
      paddingTop: '0.5rem',
      fontWeight: 'bold',
      fontColor: '#070707',
    },
    Robots: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #D0D0D0',
      height: 'auto',
      width: '48rem',
      paddingLeft: '8px',
      marginTop: '0rem',
      marginLeft: '8.8rem',
      minHeight: '40px',
    },
    robotsOverflow: {
      maxHeight: '200px',
      overflowY: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px',
      padding: '5px',
    },
    spanRobots: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '8px',
      border: '1px solid lightgray',
      padding: '3px 3px 3px 3px',
      backgroundColor: 'lightgray',
    },
    deleteicon: {
      marginLeft: '4px',
      cursor: 'pointer'
    },
    dropdown: {
      position: 'absolute',
      width: '48rem',
      backgroundColor: 'white',
      border: '1px solid #D0D0D0',
      marginLeft: '8.9rem',
      top: '100%',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: '1000'
    },
    labeldropdown: {
      display: 'block',
      padding: '5px'
    },
    clearAllIcon: {
      cursor: 'pointer',
      marginLeft: 'auto',
      marginRight: '10px',
      width: '9px'
    },
    selectService: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '5px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      height: '10vh',
      paddingTop: '30%',
    },
    clickTestSuite: {
      cursor: 'pointer',
      color: 'blue !important'
    },
}));

export default cssClasses;