import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({

  cardBody: {
    fontSize: '15px',
    margin: '-0.5rem',
    height:'120px',
    padding:'6px'
  },
  cardTitle: {
    fontSize: '14px',
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
    fontSize: '11px',
    marginTop: '0.3rem',
  },
  cardcontent: {
    marginRight: '-1rem',
  },
  customText: {
    width: 'max-content',
    padding: '5px',
    marginLeft: '0.2rem',
    marginTop: '0.5rem',
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
    fontSize: '0.9rem',
  },
  //pagination css
  lastRow: {
    background: 'white',
    color: 'white',
    height: '3.5rem',
    borderRadius: '3px',
    marginLeft: '1rem',
    marginTop: '-1rem',
    marginRight: '1rem',

  },
  paginations: {
    marginTop: "1rem",
    marginLeft: "1rem",
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
});

export default cssClasses;