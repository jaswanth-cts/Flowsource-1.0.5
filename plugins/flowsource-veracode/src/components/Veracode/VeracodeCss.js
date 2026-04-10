import { makeStyles } from '@material-ui/core';
 const cssClasses = makeStyles((theme) => ({

  
  mainBackground: {
    backgroundColor: '#e8effa',
    overflowX:'hidden',
    width: '127%',
  },
  heading: {
    textAlign:'left',
    padding: '5px',
    fontWeight: 'bold',
    color: '#30599c'
  },
  card1:{
    textAlign:'left',
    paddingLeft:'10px',
    paddingTop:'10px',
    fontSize:'small'
  },
  fStyle:{
    fontSize:'small',
    marginLeft:'2rem',
  },
  iconStyle:{
    textAlign:'end',
  },
  imageStyle:{
    width:'31px',
    height:'27px',
},
  customList: {
    listStyle: 'none', // Remove default list styles
    textAlign:'left',
    fontSize:'14px',
    marginBottom:'0px'
  },
  customListItem: {
    paddingLeft: '20px',  // Adjust padding as needed
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '5px',          // Adjust position as needed
      top: '50%',           // Adjust position as needed
      transform: 'translateY(-50%)',
      width: '8px',        // Adjust size as needed
      height: '8px',       // Adjust size as needed
      borderRadius: '50%',  // Create a circular bullet
      backgroundColor: '#5988d4', // Set your desired bullet color
    },
  },

  card2Heading:{
    padding:'15px',
    fontSize:'larger'
  },

  textSection: {
    textAlign: 'left',
    paddingLeft: theme.spacing(4),
    fontSize:'small'
  },
  verticalLine: {
    borderLeft: '1px solid #ccc',
    height: '10rem',
    margin: `0 ${theme.spacing(4)}px`,
  },
  pieChart2:{
   paddingRight:"1.2rem"
  },
  pieChart: {
    maxWidth: '30rem',
    maxHeight: '15rem',
    marginBottom:'1rem',

  
  },
  cardHeading:{
    textAlign:'left',
    paddingLeft:'20px',
    paddingTop:'10px',
    fontSize:'larger'
  },
  card5:{
    height:'100% ! important'
  },
  barStyle:{
    paddingLeft:'30px',
    paddingTop:'10px',
    width:'70%',
    height:'210px',
  },
  cardStyle:{
    maxWidth: '32rem',
    maxHeight: '15rem',
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft:'3rem',
    display: 'flex',
    paddingBottom:'0.5rem'

  },
  ttstyle:{
    color:'#6950d9',
     fontSize:'xx-large'
  },
  pp1style:{
    width:'101px',
    marginTop:'2rem',
    paddingLeft:'10px'
  },
  pp2style:{
    width:'101px',
    paddingLeft:'10px'
  },

  ptstyle:{
    color:'#26ab28',
    fontSize:'xx-large'
  },
  pHeading1:{
    padding:'5px',
    paddingLeft:'25px',

  },
pHeading2:{
  textAlign:'left',
  padding:'5px',
  paddingLeft:'20px',  
},
rstyle:{
  width:'max-content',
},
bStyle:{
border:'white'
},
pStyle:{
  textAlign:'left',
  paddingTop:'3rem'
},

col7:{ 
  flex: '0 0 auto',
  width: '62.333333%'
},
col5:{
  flex: '0 0 auto',
  width: '36.666667%'
},
pluginHeading: {
  display: 'flex',
  justifyContent: 'space-between',
},
}));

export default cssClasses;