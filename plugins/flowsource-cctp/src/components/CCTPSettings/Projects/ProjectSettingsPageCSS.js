import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  verticalLine: {
    borderRight: '2px solid #13215E',
    height: '19px',
    margin: '2px 0',
  },
  loading: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    height: '10vh', 
    paddingTop: '30%',
  },
 
  parentDivMain: {
    width: '9.9%',
  },
  parentDivFramework: {
    width: '100%', 
    border: 'none',
  },

  marginbottom: {
    marginBottom: '1rem',
  },
  marginTop: {
    marginTop: '1rem',
  },
  marginright: {
    marginRight: '0.7rem',
  },
  marginleft: {
    marginLeft: '10px',
  },
  marginleft15: {
    marginLeft: '15px',
  },

  iconRight: {
    // marginBottom: '1rem', 
    display: 'flex', 
    alignItems: 'center',
    height: '10px',
  },
  iconRight1: {
    // marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    // marginLeft: '47rem',
    paddingBottom: '0.5rem',
    justifyContent: 'flex-end',
    width: '100%',
  },
  deleteCreateIcon: {
    height: '15px', 
    width: '15px',
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
  deleteCreateIconText: {
    fontSize: '12px',
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
  dataUnavailable:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    margin: 0,
    paddingRight: '1rem',
    paddingBottom: '1rem',
  },
  checkbox: {
    accentColor: "#89CFF0",
  },
  colStyle1: {
    padding: '0.2rem 0.2rem !important',
    fontSize: '13px',
    alignItems: 'left',
  },
  alignLeft:{
    textAlign: 'left'
  },
  
    customPagination: {
    '& .Mui-selected': {
      // border: '1px solid #000',
      backgroundColor: '#3373b2 !important',
      color: 'white'

    },
  },
  ulCss: {
    lineHeight: '1rem',
    paddingRight: '2rem',
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
  label: { 
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bolder',
    marginLeft: '1.3rem',
    minWidth: '100px',
    fontSize: '0.8rem',
  },
  input: { 
    width: '33%', 
    height: '2rem',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '2px',
    marginLeft: '0.7rem',
  },
  
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '1rem',
    marginBottom: '1rem',
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
    padding: '0.2rem',
    border: '1px solid #ccc',
    borderRadius: '2px',
    cursor: 'pointer',
    marginLeft: '0.7rem',
  },  

  margintop: {
    marginTop: '0.5rem'
  },
  
  addPropertybuttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    marginRight: '15%',
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
  
  newFrameworkBorder: {
    border: '2px solid #000048',
    borderRadius: '2px',
    padding: '4px',
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
  errorDialogBoxButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem',
    backgroundColor: '#000048'
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
  tablefont: {
    color: '#2F78C4',
    fontSize: '0.80rem',
    fontWeight: '700',
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
filterItems:{
  display: 'flex',
  marginLeft: '10px',
  marginTop: '-10px',
  marginBottom: '15px'
},
filterType: { 
  display: 'block',
  marginTop: '0.3rem',
  fontWeight: 'bolder',
  marginLeft: '1rem',
  marginRight: '0.5rem',
  fontSize: '0.8rem',
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
errorText: {
    color: '#d66d6d',
  },
 
  form: {
    marginTop: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  dropdown1: {
    width: '16%',
    border: '1px solid #ccc',
    height: '2rem',
    padding: '0.5rem',
    marginLeft: '0.5rem',
    borderRadius: '2px',
},
hiddenOption:{
  display: 'none'
},
disableButton: {
  backgroundColor: '#9fbfd4',
  color: 'white',
  height: '32px',
  borderRadius: '3px',
  justifyContent: 'center',
  fontSize: '0.8rem',
  border: 'transparent',
  marginRight: '1rem',display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  border: 'transparent',
  margin: '1rem 1rem 1rem 0',
  padding: '0rem 1rem',
},
}));

export default cssClasses;
