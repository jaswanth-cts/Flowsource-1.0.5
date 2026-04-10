import { makeStyles } from '@material-ui/core';
import { createTheme } from '@mui/material/styles';
const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTableCell-head": {
        color: 'white',
        backgroundColor: '#000078',
        height: "32px",
        padding:'0px',
        borderRadius:'0px'
    },
    
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
  marginbottom1: {
    marginBottom: '1rem',
  },
  marginright1: {
    marginRight: '1rem',
  },
  marginright: {
    marginRight: '0.7rem',
  },
  marginleft: {
    marginLeft: '10px',
  },
  iconRight: {
    // marginBottom: '1rem', 
    display: 'flex', 
    alignItems: 'center',
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
  tab: {
    cursor: 'pointer'
  },
  activeTab: {
    color: '#13215E',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'max-content',
  },
  activeTabUnderline: {
    borderBottom: '2px solid #13215E',
    paddingBottom: '4px',
  },
  disableTab: {
    color: '#9fbfd4',
    fontWeight: 'bold',
    width: 'max-content',
  },
  active: {
    color: '#13215E',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  btnSelected: {
    backgroundColor: '#13215E',
    color: 'white',
    height: '30px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginLeft: '1rem',
  },
  btnDefault: {
    backgroundColor: '#E5E4E2',
    color: '#13215E',
    height: '30px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginLeft: '1rem',
  },
  buttonStyle:{
    margin: '0 3px', // Add spacing between buttons
    fontSize: '13px',
    minWidth: '87px',
    height: '35px',
    borderRadius: '6px'
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
  },
  priorityCircle1: {
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
    fontSize: '0.8rem'
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
  horizontalLine: { 
    width: '98%', 
    margin: '0.5rem 0.7rem', 
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  stepBtnSelected: {
    backgroundColor: '#13215E',
    color: 'white',
    // border: '1px solid #13215E',
    height: '30px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginLeft: '1rem',
  },
  stepBtnDefault: {
    backgroundColor: '#E5E4E2',
    color: '#606060',
    // border: '1px solid #E5E4E2',
    height: '30px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginLeft: '1rem',
  },
  dropdownLabel: { 
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bolder',
    marginLeft: '1.3rem',
    minWidth: '80px',
    fontSize: '0.8rem',
  },
  dropdown: {
    height: '2rem',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '2px',
    cursor: 'pointer',
  },  
  submitButton: {
    backgroundColor: '#13215E',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1rem',
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
  },
  createButton: { 
    backgroundColor: '#13215E',
    color: 'white',
    height: '32px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginRight: '1rem',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  cancelButton: { 
    backgroundColor: '#808080',
    color: 'white',
    height: '32px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginRight: '58%',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '63%',
  },
  editIcon: {
    marginLeft: '12px',
    cursor: 'pointer',
  },
  input_config: {
    width: '60%', 
    height: '2rem',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '2px',
    marginLeft: '0.5rem',
    flex: '1',
  },
  grayLabel: {
    color: '#606060',
  },
  newFrameworkBorder: {
    border: '2px solid #000048',
    borderRadius: '2px',
    padding: '4px',
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
  modalButtonContainer: { 
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalDoneButton: { 
    backgroundColor: '#13215E',
    color: 'white',
    height: '30px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
    marginRight: '1rem',
  },
  modalCancelButton: { 
    backgroundColor: '#808080',
    color: 'white',
    height: '30px', 
    borderRadius: '0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    border: 'transparent',
  },
  modalLabel: {
    fontWeight: 'bolder',
    width: '90px',
  },
  modalInput: { 
    width: '60%', 
    height: '2rem',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '2px',
    marginLeft: '0.5rem',
  },
  headerCheckBox:{
    width:"14px",
    height:"14px",
    marginLeft:"14px",
    marginBottom:"10px",
    marginTop:"10px",
    backgroundColor:'#FFF',
    appearance:"none"
  },
  pageLoading:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  tabContentEditPage:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom:'0.95em'
  },
  tabContentEditPageButtonBar:{
    display: 'flex',
    alignItems: 'center',
    marginBottom: 2,
    width: '100%',
    maxWidth: '90%',
  }
}));

 
// Create a custom theme 
export const themeGroupMapping = createTheme({ 
  components: { 
    MuiTableHead:{
        styleOverrides:{
          root:{
            
            "& .MuiTableCell-head": {
              color: "white",
              backgroundColor: "#000048"
            },
          }           
        }
    },
    MuiTableCell:{
        styleOverrides:{
            root: {
                padding: '0px',
            }
        },
    },
    MuiTypography:{
      styleOverrides:{
        root:{
          textAlign: 'left',
           minWidth:'20%',
          textTransform:'uppercase',
          fontWeight:'fontWeightBold',
          fontSize:'10px',
          whiteSpace: 'nowrap',
          
        }
      }
    },
    MuiTextField: { 
        defaultProps: { 
          variant: 'outlined', // Default variant 
          fullWidth: true, // Default fullWidth behavior 
          }, 
    }, 
    
 
    MuiPagination: {
      styleOverrides: {
          root: {
              button: {
                  borderRadius:0,
                  margin:0,
              },
            
             
          },
          ul:{
            li:{
              button:{
                "&.Mui-selected":{
                  backgroundColor:'blue',
                  color:'white'

                }
              }
            }
          },
          
        
           
      },
  }
  }, 
});

export default useStyles;