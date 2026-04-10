import { makeStyles } from '@material-ui/core';
 const cssClasses = makeStyles({

tableRow: {
    backgroundColor: '#3373b2', 
    color: 'white',
    height:'10px !important'
},
tableBorders:{
borderCollapse:'collapse'
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
  numCss: {
    backgroundColor: '#2e308e',
    border: '1px solid #2e308e',
    padding: '2px 0px',
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
   
   pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      listStyleType: 'none',
    },
  paginations:{
marginTop:"1rem",
marginLeft:"1rem",
  },
  customPagination: {
    '& .Mui-selected': {
     // border: '1px solid #000',
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
  displayMsg:{
    textAlign: 'center',
    paddingTop: '15px',
    fontSize:'0.82rem'
  },
  darkBlueBox: {
    backgroundColor: '#000048',
    color: 'white',
    padding: '2px 5px',
    marginLeft: '10px',
    borderRadius: '5px',
    display: 'inline-block',
    textAlign: 'center',
    fontSize: '0.82rem',
    lineHeight: '1.5rem',
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moreVertIcon: {
    marginRight: '30px',
    color: 'grey',
  },
  isLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '30%'
  },
  isLoadingAccordian: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '0.5rem'
  },
  accordionSpacing: {
    marginBottom: '16px', // Adds spacing between accordions
  },
  cycleButtonStyle: {
    margin: '0 5px', // Add spacing between buttons
    fontSize: '13px',
    minWidth: '87px',
    height: '20px',
    backgroundColor: 'transparent',
    border: '1px solid #000048',
    color: '#2e308e',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#2e308e',
      color: '#FFFFFF',
    },
  },
  activeButton: {
    backgroundColor: '#2e308e',
    color: '#FFFFFF',
  },
});

export default cssClasses;
