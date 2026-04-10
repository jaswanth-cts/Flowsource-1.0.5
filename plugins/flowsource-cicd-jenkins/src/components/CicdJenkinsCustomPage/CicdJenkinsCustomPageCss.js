import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100vh',
    paddingTop: '30%',
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  statusIndicator: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    marginRight: '8px',
  },
  customDiv: {
    borderBottomLeftRadius: '5px',
    borderBottomRightRadius: '5px',
  },
  cardBody: {
    fontSize: '18px',
    marginTop: '-1.5rem',
    //height:'70%'
  },
  cardTitle: {
    fontSize: '18px',
  },
  iconCSS: {
    marginTop: '0.5rem',
    height: '29px',
    marginRight: '0.5rem',
    cursor: 'pointer',
  },

  text: {
    marginTop: '-1.5rem',
  },

  card1: {
    height: '100%',
    border: 'none',
  },
  shadow: {
    borderRadius: '8px',
  },

  clockIcon: {
    marginRight: '5px',
    height: '12px',
    marginTop: '1px',
  },
  idCss: {
    fontSize: '11px',
    marginTop: '0.3rem',
    cursor: 'pointer',
    color:'#e76c71'
  },
  cardcontent: {
    marginRight: '-2rem',
    fontSize: '12px',
    marginTop:'2px'
  },
  customText: {
    width: 'max-content',
    padding: '10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 3,
    transition: 'width 0.3s ease',
  },
  hoverUnderline: {
    // '&:hover':{
    textDecoration: 'underline',
    // },
  },
  clamp: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageItem: {
    margin: '0 2px',
  },
  previous:{
  color: 'white',
  fontWeight: 'lighter',
  fontSize: '20px',
  position: 'relative',
  top: '-1px',
  border:'none',
  },
  current:{
    backgroundColor: 'white',
    padding:'0px 3px',
    borderRadius:'3px',
    color: 'black',
   },

  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  statusCss: {
    color: 'black',
  },
  //pagination css
  lastRow: {
    background: 'white',
    color: 'white',
    height: '3.5rem',
    borderRadius: '3px',
    marginLeft: '0rem',
    marginTop: '-1rem',
    marginRight: '1rem',

  },
  paginations: {
    margin: "1rem",
    marginLeft:"20px"
    
  },
  triggerButtonPlaceholder: {
    width: '150px',
    height: '0px',
  },
  ulCss: {
    lineHeight: '1rem',
  },
  customPagination: {
    '& .Mui-selected': {
      backgroundColor: '#3373b2 !important',
      color: 'white'
    },
  },
  liCss: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  numCss: {
    backgroundColor: '#2e308e',
    border: '1px solid #2e308e',
    padding: '2px 0px',
    color: 'white',
  },
  btnCss: {
    background: 'none',
    border: 'none',
    height: '20px',
    width: '10px',
    boxSizing: "unset"
  },
  calenderIcon:{
   fontSize: '0.8rem', marginRight: '29px' ,marginLeft:"2px"
  },
  durationCss:{
    fontSize: '11px',
    marginTop: '0.13rem',
    cursor: 'pointer',
  },
  Cancelbtn:{
    backgroundColor: 'white',
    border:"none",
  color:'purple'
  },
  Submitbtn:{
    backgroundColor: 'white',
    border:"none",
    color:'blue'
  },
  modalTitle:{
 padding:"3px",
 margin:"10px"
  },
  modalFooter:{
    borderTop: "none !important",
    marginTop:"0px",
    paddingTop:'0px'
  },
  header: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
  },
  pipelineSection: {
    marginBottom: '1rem',
  }
});

export default cssClasses;