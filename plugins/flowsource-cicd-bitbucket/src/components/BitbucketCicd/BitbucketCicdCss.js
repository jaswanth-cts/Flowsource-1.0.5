import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({
  cardBody: {
    fontSize: '18px',
    marginTop: '-0.5rem',
    height:'120px'
  },
  cardTitle: {
    fontSize: '20px',
  },
  iconCSS: {
    marginTop: '0.5rem',
    height: '29px',
    marginRight: '0.5rem',
    cursor: 'pointer',
  },

  card1: {
    height: '100%',
    border: 'none',
  },
  shadow: {
    borderRadius: '3px',
  },

  clockIcon: {
    marginRight: '4px',
    height: '13px',
  },
  idCss: {
    fontSize: '12px',
  },
  customText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 3,
  },
  hoverUnderline: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  clamp: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
   
  cardcontent: {
    justifyContent: 'start',
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

export default cssClasses;