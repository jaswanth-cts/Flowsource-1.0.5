import { makeStyles } from '@material-ui/core';
 
const cssClasses = makeStyles((theme) => ({
 
  tableBorders: {
    // border: '0.1rem solid #dee2e6',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    "& th": {
            backgroundColor: '#ccc8c8',
            color: '#58589d',
        },
    "& tbody": {
            textAlign: '-webkit-center',
        },    
  },
  tableCell: {
    height: '10px !important'
  },
 
  tableHead: {
    fontSize: '12px',
    textAlign: 'center',
    // backgroundColor: 'lightgrey',
    color: 'white',
  },
 
  colStyle1: {
    //padding: '0.2rem 0.2rem !important',
    fontSize: '12px',
  },
  colStyle3: {
    paddingRight: '3rem !important',
  },
 
  //pagination css
  ulCss: {
    lineHeight: '0.75rem',
},
customPagination: {
    '& .Mui-selected': {
        // border: '1px solid #000',
        backgroundColor: '#3373b2 !important',
        color: 'white'
    },
},
paginationBoxStlye: {
    paddingRight: '1rem',
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
 
headingDiv:{
  backgroundColor: '#000048',
  height: '2.5rem',
  marginTop: '2px'
},
headingP:{
  textAlign: 'left',
  paddingLeft: '1rem',
  paddingTop: '10px',
  color: 'white',
  fontSize: '0.82rem'
},
 
//AccessibilityTwo
atDiv1:{
  backgroundColor: '#000048',
  height: '2.5rem',
  marginTop: '2px'
},
atP1:{
  textAlign: 'left',
  paddingLeft: '1rem',
  paddingTop: '10px',
  color: 'white',
  fontSize: '0.82rem'
},
atDiv2:{
marginTop: '2rem'
},
atDiv3:{
   marginLeft: '1rem'
},
atDiv4:{
  height: '2rem',
  backgroundColor: '#7373d8',
  width: '100%'
},
atP2:{
  textAlign: 'center',
  marginLeft: '-1rem',
  lineHeight: '1.5rem',
  paddingTop: '0.2rem'
},
atSpan1:{
  fontSize: '19px',
  marginRight: '9px',
  color: 'white',
  verticalAlign: 'middle'
},
atSpan2:{
  fontSize: '0.8em',
  color: 'white',
  verticalAlign: 'middle',
  marginTop: '2px',
  display: 'inline-block'
},
atDiv5:{
  marginLeft: '1rem',
},
atDiv6:{
  height: '2rem',
  backgroundColor: '#7373d8',
  width: '100%'
},
atP3:{
  textAlign: 'center',
  marginLeft: '0rem',
  lineHeight: '1.5rem',
  paddingTop: '0.2rem',
},
atSpan3:{
  fontSize: '19px',
  marginRight: '9px',
  color: 'white',
  verticalAlign: 'middle',
},
atSpan4:{
  fontSize: '0.8em',
  color: 'white',
  verticalAlign: 'middle',
  marginTop: '2px',
  display: 'inline-block'
},
atDiv7:{
  marginLeft: '1rem',
},
atDiv8:{
  height: '2rem',
  backgroundColor: '#7373d8',
  width: '100%'
},
atP4:{
  textAlign: 'center',
  marginLeft: '-1rem',
  lineHeight: '1.5rem',
  paddingTop: '0.2rem'
},
atSpan5:{
  fontSize: '19px',
  marginRight: '9px',
  color: 'white',
  verticalAlign: 'middle'
},
atSpan6:{
  fontSize: '0.8em',
  color: 'white',
  verticalAlign: 'middle',
  marginTop: '2px',
  display: 'inline-block'
},  
atDiv9:{
  backgroundColor: '#000048',
  height: '2.5rem',
  marginTop: '2px'
},  
atP5:{
  textAlign: 'left',
  paddingLeft: '1rem',
  paddingTop: '10px',
  color: 'white',
  fontSize: '0.82rem'
},  
atDiv10:{
  maxHeight: "258px",
  overflowY: "auto",
  overflowX: 'hidden',
  border: "1px solid #dee2e6"
},  
atTable:{
  marginBottom: '0'
},
// atTBody:{
//   fontSize: '12px',
// },
atTBody: {
  "& tr": {
      cursor: 'pointer',
  },
  "& td": {
      textAlign: 'left',
      "& span": {
          backgroundColor: 'transparent',
      },
      "& span.selected": {
          backgroundColor: '#c8c3c6',
      },
  },
},
atDiv11:{
  border: '1px solid lightgrey'
},
// atTable1:{
//   marginBottom: '0',
//   borderCollapse: 'collapse'
// },
atTable1: {
  marginBottom: '0',
  borderCollapse: 'collapse',
  "& th.violation": {
            border: 'none',
            backgroundColor: '#ccc8c8',
        },
        "& th.description": {
            border: 'none',
            backgroundColor: '#ccc8c8',
            padding: '0rem',
            paddingBottom: '0.5rem',
        },
  "& tbody": {
      fontSize: '12px',
      display: 'block',
      maxHeight: '220px',
      overflowY: 'auto',
      width: '100%',
      "& tr": {
          display: 'table',
          width: '100%',
          tableLayout: 'fixed',
          "& td": {
              borderTop: '1px solid lightgrey',
              borderBottom: '1px solid lightgrey',
          },
      },
      "& tr.no-data": {
          textAlign: '-webkit-center',
          display: 'block',
      },
  },
},
atTHead2:{
  fontSize: '12px', position: "sticky",
  top: 0,
  zIndex: 1,
  backgroundColor: '#ccc8c8',
  display: 'table',
  width: 'calc(100% - 0px)' /* Adjust for scrollbar width */
},

barGraphDiv:{
  height: '12rem'
},
barGraphDiv1:{
  padding:'0rem 0rem 0rem 1rem',
},
barGraphDiv2:{
  height: '11rem',
  textAlign: 'center',
  paddingTop: '5rem',
},
loading1:{
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'flex-start', 
  height: '10vh', 
  paddingTop: '30%',
                
},
barDiv:{
  padding: '1rem 1rem 0rem 0rem',
},
loading2:{
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'flex-start', 
  height: '10vh', 
  paddingTop: '30%',
},
barDiv2:{
  padding: '2rem 2rem 0rem 0rem',
},
link: {
  color: 'blue',
  cursor: 'pointer',
  textDecoration: 'none', // Add this line to remove underline
},
popup: {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '29px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  width:'600px',
  textAlign: 'left',
  maxHeight:'335px',
},
overlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
},
closeButton: {
  position: 'absolute',
  top: '-5px',
  fontSize: '2rem',
  right: '10px',
  cursor: 'pointer',
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
searchDiv1:{
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  marginTop: '0.5rem',
  marginBottom: '-0.5rem',
},
searchDiv2:{
  flex: 1, 
  maxWidth: '280px', 
  paddingLeft: '0.5rem', 
  paddingBottom: '0.5rem',
},
inputGroupCss:{
  border: 'none',
  borderBottom: '1px solid white',
  backgroundColor: 'white',
  borderRadius: '0',
},
bsSearch:{
  color: 'rgb(186 186 190)',
},
inputGroupText:{
  border: 'none',
  borderBottom: '1px solid white',
  backgroundColor: 'white',
  borderRadius: '0',
},
bsxCss:{
  color: 'rgb(186 186 190)',
  fontSize: '23px',
  marginTop: '-7px',
},
noDataTr:{
  height: 'auto',
},
noDataTd:{
  padding: '0', 
  border: 'none', 
  paddingTop: '0.8rem'
},
}));
 
export default cssClasses;
