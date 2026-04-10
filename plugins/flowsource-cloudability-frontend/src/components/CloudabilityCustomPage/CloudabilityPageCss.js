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
      // border: '1px solid #000',
      backgroundColor: '#3373b2 !important',
      color: 'white',
    },
  },
  cardcontent: {
    justifyContent: 'center',
  },

  //   ----------------------------------------
  cardItems: {
    display: 'flex',
    // textAlign: 'center',
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
  budgetCostMonth:{
    fontSize: 'small',
    fontWeight: 'bold',
    color: '#4169E1',
    paddingRight: '12px',

  },
  loadingText: {
    marginTop: '1rem',
    marginLeft: '2rem',
    fontSize: [20, "!important"],
  },
  cardsDollarIcon: {
    width: '1.9rem',
    height: '1.9rem',
    marginTop: '1.7rem',
    marginLeft: '-0.25rem'
  },
  cardsArrowIcon: {
    width: '1.25rem',
    height: '1.25rem',
    marginLeft: '1.9rem',
    marginTop: '2rem',
  },
  cardsArrowIconEnv: {
    width: '1.25rem',
    height: '1.25rem',
    marginTop: '2rem',
  },
  cardsCostDiffText: {
    fontSize: 18,
    marginTop: '2rem',
    color: '#808080'
  },
  cardsDiffDollarIcon: {
    height: '1.6rem',
    width: '1.6rem',
    marginTop: '2rem',
    marginLeft: '-0.5rem'
  },
  cloudabilityLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#3f51b5',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  headingDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '-1rem',
  },
});

export default cssClasses;
