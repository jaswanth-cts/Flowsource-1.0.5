import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles({
  cardBody: { fontSize: '18px', marginTop: '-1.5rem' },
  cardTitle: { fontSize: '18px' },
  bgInfo: { backgroundColor: '#000048 !important', color: 'white !important' },
  statusCss: { color: 'black', fontSize: '0.7rem' },
  lastRow: {
    background: 'white',
    color: 'white',
    height: '3.5rem',
    borderRadius: '3px',
    marginLeft: '0rem',
    marginTop: '-1rem',
    marginRight: '1rem',
  },
  iconCSS: { marginTop: '0.5rem', height: '29px', marginRight: '0.5rem', cursor: 'pointer' },
  text: { marginTop: '-1.5rem' },
  card1: { height: '100%', border: 'none' },
  // shadow: { borderRadius: '5px' },
  clockIcon: { marginRight: '5px', height: '12px', marginTop: '2px' },
  idCss: { fontSize: '10px', marginTop: '0.3rem', marginLeft: '0.2rem' },
  customText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 3,
    transition: 'width 0.3s ease',
  },
  hoverUnderline: { '&:hover': { textDecoration: 'underline' } },
  clamp: { overflow: 'hidden', textOverflow: 'ellipsis' },
  pagination: { display: 'flex', justifyContent: 'flex-end' },
  paginations: { marginTop: '1rem', marginLeft: '1rem' },
  pageItem: { margin: '0 2px' },
  numCss: { backgroundColor: '#2e308e', border: '1px solid #2e308e', padding: '2px 0px', color: 'white' },
  ulCss: { lineHeight: '1rem' },
  customPagination: {
    '& .Mui-selected': {
      backgroundColor: '#3373b2 !important',
      color: 'white',
    },
  },
  liCss: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  btnCss: { background: 'none', border: 'none', height: '20px', width: '10px', boxSizing: 'unset' },
  pluginHeading: { display: 'flex', justifyContent: 'space-between' },
  pipeIdCss: { marginTop: '1px', fontSize: '0.7rem', padding: '0.6rem' },

  // New styles
  legendIcon: {
    height: '14px',
    marginRight: '4px',
    verticalAlign: 'middle',
  },
  legendLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: '15px',
    fontSize: '0.8rem',
  },
  stageButtonIcon: {
    height: '14px',
    marginRight: '4px',
  },
  buildBranchIcon: {
    height: '14px',
    marginRight: '4px',
    verticalAlign: 'middle',
    marginBottom: '4px'
  },
  stageButton: {
    marginRight: '6px !important',     
    marginBottom: '6px',   
    textTransform: 'none',
    padding: '2px 18px 2px 22px !important',
    borderRadius: '4px !important',
    boxShadow: '0px 0px 0px 0px rgb(0 0 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0) !important'

  },
  succeeded: {
    backgroundColor: ' #dff6dd !important',
    border: '1px solid #107c10 !important',
    color: ' #000 !important',
  },
  error: {
    border: '1px solid #cd4a45 !important',
    backgroundColor: ' #f9ebeb !important',
    color: ' #000 !important',
  },
  inProgress: {
    border: '1px solid #0078d4 !important',
    backgroundColor: ' #abcfeb !important',
    color: ' #000 !important',
  },
  cancelled: {
    border: '1px solid #cd4a45 !important',
    backgroundColor: ' #f9ebeb !important',
    color: '#000 !important',
  },
  abandoned: {
    border: '1px solid rgb(61, 60, 60) !important',
    backgroundColor: ' #d6d2d2a3 !important',
    color: '#000 !important',
  },
  stageUnknown: {
    border: '1px solid rgb(61, 60, 60) !important',
    backgroundColor: ' #d6d2d2a3 !important',
    color: ' #000 !important',
    marginRight: '6px',
    textTransform: 'none',
  },
  
  
  stageCell: {
    maxWidth: 500,
    width: 500,
    verticalAlign: 'top',
  },
  
  stageScrollContainer: {
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    backgroundColor: '#fff',
    paddingBottom: 4,
  
    // Chrome, Safari, Edge scrollbar
    '&::-webkit-scrollbar': {
      height: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#ffffff',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#b0b0b0',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#999999',
    },
  
    // Firefox scrollbar
    scrollbarColor: '#b0b0b0 #ffffff',
    scrollbarWidth: 'thin',
  },
  paddingchn:{
    paddingLeft:'12px',
    paddingRight:'12px',
  }
});

export default cssClasses;
