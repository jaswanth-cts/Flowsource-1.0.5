import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({
 
  cardBody: {
    fontSize: '18px',
    marginTop: '-1.5rem',
    //height:'70%'
  },
  cardTitle: {
    fontSize: '18px',
  },
  bgInfo:{
    backgroundColor: '#92bbe6',
  },
  statusCss: {
    color: 'black',
    fontSize: '0.7rem',
  },
  lastRow: {
    background: 'white',
    color: 'white',
    height: '3.5rem',
    borderRadius: '3px',
    marginLeft: '0rem',
    marginTop: '-1rem',
    marginRight: '1rem',
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
    borderRadius: '5px',
  },
 
  clockIcon: {
    marginRight: '5px',
    height: '12px',
    marginTop: '2px',
  },
  idCss: {
    fontSize: '10px',
    marginTop: '0.3rem',
    marginLeft: '0.2rem',
  },
  customText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 3,
    // width: '166px',
    transition: 'width 0.3s ease',
  },
  hoverUnderline:{
    '&:hover':{
      textDecoration:'underline',
    },
  },
  clamp: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  paginations: {
    marginTop: '1rem',
    marginLeft: '1rem',
  },
  pageItem: {
    margin: '0 2px',
  },
  numCss: {
    backgroundColor: '#2e308e',
    border: '1px solid #2e308e',
    padding: '2px 0px',
    color: 'white',
  },
  ulCss: {
    lineHeight: '1rem',
  },
  customPagination: {
    '& .Mui-selected': {
      // border: '1px solid #000',
      backgroundColor: '#3373b2 !important',
      color: 'white'
 
    },
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
    boxSizing: 'unset',
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  pipeIdCss :{
    marginTop: '1px',
    fontSize: '0.7rem',
    padding: '0.6rem',
  },
  paddingchn:{
    paddingLeft:'12px',
    paddingRight:'12px',
  }
});
 
export default cssClasses;
