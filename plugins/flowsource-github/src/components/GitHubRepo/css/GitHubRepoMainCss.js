import { makeStyles } from '@material-ui/core';
 const cssClasses = makeStyles({
  iconcontainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width:'180px'

  },
tableRow: {
    backgroundColor: '#3373b2', 
    color: 'white',
    height:'10px !important'
},
tableBorders:{
borderCollapse:'collapse',
verticalAlign:'middle',
},
tableCell: {
    height:'10px !important'
},
chartHeight:{
height:'14.5rem',
},
cardHeight:{
    height:'17rem',
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
checkboxs:{
marginBottom:'0.7rem',
},
firstRow:{
  background: 'white', 
  color: '#000048', 
  height: '3.5rem',
  borderRadius:'3px',
},  
lastRow:{
  background: 'white', 
  color: 'white', 
  height: '3.5rem',
  borderRadius:'3px',
  marginLeft:'0rem',
  marginTop:'-1rem',

},    
tableHead:{
fontSize:'0.70rem',
backgroundColor:'#000048',
color:'white',
},
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pageItem: {
    margin: '0 2px',
  },
  paginations:{
marginTop:"1rem",
marginLeft:"1rem",
  },
numCss: {
  backgroundColor: '#2e308e',
  border: '1px solid #2e308e',
  padding: '2px 0px',
  color:'white',
},
liCss: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
},
btnCss: {
  background: 'none',
  border: 'none',
  height: '20px',
  width: '10px',
  boxSizing:"unset"
},
  ulCss:{
    lineHeight:'1rem',
  },
  customPagination: {
    '& .Mui-selected': {
      backgroundColor: '#3373b2 !important',
      color:'white'
    },
  },
  pStyle:{
    textAlign:'center',
    paddingTop:'6rem'
  },
  cardCss:{
    height:'100% ! important'
  },
  cards:{
    height:'15rem'
  },
  buttonStyle:{
    margin: '0 3px', // Add spacing between buttons
    fontSize: '13px',
    minWidth: '87px',
    height: '20px',
  },
  cardStyle:{
    border: '1px solid lightGray', 
    borderRadius: '5px', 
    marginLeft: '0.1rem !important',
    marginRight: '0.2rem !important',
  },
  displayMsg:{
    textAlign: 'center',
    paddingTop: '15px',
    fontSize:'0.82rem'
  },
  darkBlueBox: {
    backgroundColor: '#2e308e',
    color: 'white',
    padding: '1px 4px',
    marginLeft: '10px',
    display: 'inline-block',
    textAlign: 'center',
    fontSize: '0.82rem',
    lineHeight: '1.0rem',
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  moreVertIcon: {
    color: 'grey',
  },
  ContentBox:{
    minWidth: '400px',
    minHeight: '100px',
   paddingtop: '0px',
   margintop:'0px',
   justifyContent: 'center',
   alignItems: 'center',
  },
  isLoading: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    paddingTop: '30%' 
  },
  dataUnavailable: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0.5rem 0.5rem 0.5rem 0rem',
    padding: '2rem 2rem 0.5rem 0rem',
    fontSize: '0.88rem !important',
    fontWeight: 'bold !important',
  },
  noDataMessagePrCycle:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1rem 0rem 1rem 0rem',
    padding: '2rem 2rem 0.5rem 0rem',
    fontSize: '0.88rem !important',
    fontWeight: 'bold !important',
},

});
export default cssClasses;
