import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({
  div1: {
    width: '100%',
    border: 'none',
  },
  div2: {
    textAlign: 'end',
  },
  tableBorders: {
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    marginBottom: '0',
    paddingBottom: '0',
  },
  tbody: {
    marginBottom: '0',
    paddingBottom: '0',
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
  colStyleCheckbox: {
    textAlign: 'left',
    paddingLeft: '2rem !important',
    color: 'white !important',
    backgroundColor: '#000048 !important',
    width: '5rem',
  },
  loading1: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '10vh',
    paddingTop: '30%',

  },
  colStyleName: {
    textAlign: 'left',
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
    marginBottom: '1px',
    cursor: 'pointer',
  },
  performanceIconText: {
    fontSize: '0.9rem',
    color: '#000048',
    cursor: 'pointer',

  },
  accessibilityIconImg: {
    width: '15px',
    height: '15px',
    marginRight: '2px',
    marginLeft: '17px',
    marginBottom: '3px',
    cursor: 'pointer',
  },
  accessibilityIconText: {
    fontSize: '0.9rem',
    paddingLeft: '2px',
    color: '#000048',
    cursor: 'pointer',
  },
  colStyle1: {
    padding: '0.9rem 0rem 0rem 0rem !important',
    fontSize: '14px',
  },
  colStyleName1: {
    padding: '0.9rem 0rem 0rem 0rem !important',
    fontSize: '14px',
    textAlign: 'left',
  },
  colStyleCheckbox1: {
    padding: '0.9rem 0rem 0rem 0rem !important',
    fontSize: '14px',
    textAlign: 'left',
    paddingLeft: '2rem !important',
    width: '5rem',
  },
  colStyleButton: {
    fontSize: '13px',
  },
  iconStyle: {
    cursor: 'pointer',
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
  deletePopupDiv1: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  deletePopupDiv2: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center',
  },
  deletePopupYesButton: {
    color: 'white',
    cursor: 'pointer',
    marginRight: '10px',
    border: 'none',
    width: '4rem',
  },
  deletePopupNoButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem',
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
    maxWidth:'12rem',
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