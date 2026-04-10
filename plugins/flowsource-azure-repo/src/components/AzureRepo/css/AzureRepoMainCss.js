import { makeStyles } from '@material-ui/core';
 const cssClasses = makeStyles({

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
    pageItem: {
      margin: '0 2px',
    },
    paginations:{
  marginTop:"1rem",
  marginLeft:"1rem",
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
      marginLeft: '1rem !important', 
      width: '98.5% !important'
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
  numCss: {
    backgroundColor: '#2e308e',
    border: '1px solid #2e308e',
    padding: '2px 0px',
    color:'white'
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
    },
    ContentBox:{
      minWidth: '400px',
      minHeight: '100px',
     paddingtop: '0px',
     margintop:'0px',
     justifyContent: 'center',
     alignItems: 'center',
    },
    moreVertIcon: {
      marginRight: '30px',
      color: 'grey',
    },
  });

export default cssClasses;
