import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({
  cardBody: {
    fontSize: '18px',
    marginTop: '-1.5rem',
  },
  githubIcon: {
    width: '30px',
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
  monitorUrl1:{
    marginBottom: '2%',
    marginTop: '1%',
    marginLeft: '2%',
  },
  cardAlign:{
    display: 'flex', 
    alignItems: 'center', 
    marginLeft: '1rem', 
    marginTop: '1rem' 
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
    marginLeft: '0.2rem',
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
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageItem: {
    margin: '0 2px',
  },
  paginations: {
    marginTop: '0.5rem',
    marginLeft: '1rem',
  },
  numCss: {
    color: 'white',
  },
  ulCss: {
    lineHeight: '2rem',
  },
  customPagination: {
    '& .Mui-selected': {
      backgroundColor: '#3373b2 !important',
      color: 'white',
    },
  },
  cardcontent: {
    justifyContent: 'center',
  },

cardItems: {
    display: 'flex',
    marginLeft: '1rem',
    marginTop: '1rem',
},
customDatepicker: {
  marginLeft: '0.5rem',
},
datepickerIcon: {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
},
datepickerContainer: {
  position: 'relative',
  display: 'inline-block',
},
customDatepicker1: {
  marginLeft: '1rem',
},
cardItemsBulkHead: {
    display: 'flex',
    marginLeft: '-3.3rem',
    marginTop: '1rem',
},
cardItemsRateLimit: {
  display: 'flex',
  marginLeft: '-3.3rem',
  marginTop: '1rem',
},

cards: {
    width: '25rem',
    height: '7.5rem',
    margin: '0rem 1rem 0rem 0rem'
},
cardsTitle: {
    display: 'flex',
    marginLeft: '2rem',
    justifyContent: 'left',
    alignItems: 'center',
    marginTop: '1rem'
},
cardsTitleImg: {
    width: '1.25rem', 
    height: '1.25rem', 
    marginRight: '0.4rem',
},
cardsTitleText: {
    fontSize: [16, "!important"],
},
cardsValue: {
    display: 'flex',
},
cardsValueText: {
    marginLeft: '2rem',
    fontSize: [45, "!important"],
    fontWeight: 'bold',
    color: '#4169E1',
},
verticalLine: {
  borderRight: '1px solid blue',
  height: '19px',
  margin: '2px 0',
},
load: {
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'flex-start',
  paddingTop: '30%',
},
datePicker: {
  width: '1.6rem', 
  marginLeft: '0.5rem',
},
cursorStyle: {
  cursor: 'pointer', 
  width: '10rem', 
  marginLeft: '0.5rem',
},
hoverStyle: {
  color: '#0E86D4 !important;',
  '&:hover': {
    textDecoration: 'underline',
    color: '#0E86D4 !important;',
  },
},
tab:{
     cursor:'pointer'
 },
 activeTab:{
    color:'#397ca7',
    backgroundColor:'none',
    fontWeight:'bold',
    width:'fit-content',
},
disableTab:{
    color:'#9fbfd4',
    fontWeight:'bold',
    width:'fit-content',
},
pluginHeading: {
  display: 'flex',
  justifyContent: 'space-between',
},
pluginVersion: {
    paddingTop: '1.1rem'
}
});

export default cssClasses;
