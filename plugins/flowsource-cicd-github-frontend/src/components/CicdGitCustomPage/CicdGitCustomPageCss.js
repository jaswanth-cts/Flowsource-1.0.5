import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({
  cardBody: {
    fontSize: '18px',
    marginTop: '-1.5rem',
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
    marginTop: '2px',
  },
  idCss: {
    fontSize: '10px',
    marginTop: '0.3rem',
    marginLeft: '0.2rem',
  },
  cardcontent: {
    marginRight: '-2rem',
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
    textDecoration: 'underline',
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
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
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
  paginations: {
    marginTop: '1rem',
    marginLeft: '1rem',
  },
  ulCss: {
    lineHeight: '1rem',
  },
  customPagination: {
    '& .Mui-selected': {
      backgroundColor: '#3373b2 !important',
      color: 'white',
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
    boxSizing: 'unset',
  },
  customTooltip: {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc',
  },
  pipeIdCss :{
    position: 'absolute',
    bottom: '30px',
    left: '5px',
    fontSize: '0.7rem',
    padding: '0.6rem',
  },
  truncateText: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordWrap: 'break-word', 
    maxWidth: '200px',
  },
  paddingchn:{
    paddingLeft:'12px',
    paddingRight:'12px',
  }
});

export default cssClasses;
