import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles({

  mainPageTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0rem 0rem 1rem',
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  testCycleHeading: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'lightgray',
    padding: '1rem 1rem 1rem 1rem',
  },
  testCycleContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: '3px',
    border: '1px solid #0000002d',
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
  tableHeading: {
    padding: '1rem 1rem 0.5rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem 1rem 1rem 1rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '3px',
    border: '1px solid #0000002d',
    boxShadow: '-1px 1px 10px 2px rgba(0, 0, 0, 0.1)',
  },
  tableBorders: {
    borderCollapse:'collapse',
    verticalAlign:'middle',
  }, 
  tableHead: {
    fontSize:'0.70rem',
    backgroundColor:'#000048',
    color:'white',
  },
  tableHeadCell: {
    padding: '0.5rem !important',
    color: 'white !important',
    backgroundColor: '#2e308e !important',
    '&:nth-child(2)': {
      minWidth: '35px',
    },
    '&:nth-child(3)': {
      width: '500px',
    },
  },
  tableBodyCell: {
    padding: '0.5rem',
  },

  cardItems: {
      display: 'flex',
  },
  cards: {
      width: '50%',
      height: '5.5rem',
      margin: '0rem 1rem 0rem 0rem',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      boxShadow: '-1px 1px 10px 2px rgba(0, 0, 0, 0.1)',
  },
  cardsTitle: {
      display: 'flex',
      marginLeft: '2rem',
      alignItems: 'center',
      marginTop: '1rem',
      justifyContent: 'center',
  },
  cardsTitleText: {
      fontSize: [16, "!important"],
  },
  cardsValue: {
      display: 'flex',
      justifyContent: 'center',
  },
  cardsValueText: {
      marginLeft: '2rem',
      fontSize: [45, "!important"],
      fontWeight: 'bold',
      color: '#4169E1',
  },
  loadingText: {
    marginTop: '1rem',
    marginLeft: '2rem',
    fontSize: [20, "!important"],
  },

  tableContainerWithPagination: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: '3px',
    width: '-webkit-fill-available',
  },

  paginationScroll: {
    display: 'flex',
    padding: '1rem',
    overflow: 'scroll',
    height: '83px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#FFFFFF',
    marginLeft: 'auto',
  },
  paginationButton: {
    padding: '8px 16px',
    margin: '0 4px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    color: '#2f308e',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  paginationCurrPageButton: {
    backgroundColor: '#2f308e',
    color: '#f0f0f0',
  },

  accordianDisplay: {
    display: ['block', "!important"],
    padding: ['0px', "!important"],
    boxShadow: '-1px 1px 10px 2px rgba(0, 0, 0, 0.1)',
  },
  accordianDisplayNoBoxShadow: {
      display: 'block !important',
      padding: '0px !important',
      boxShadow: 'none',
  },

  testCyclesContainer: {
    marginTop: '1rem',
    marginRight: '1rem',
  },
  testCycleTableHead: {
    fontSize:'0.70rem',
    backgroundColor:'#000048',
    color:'white',
    position: 'sticky',
    top: '0',
    zIndex: '1',
  },
  testCycleTableContainer: {
    maxHeight: '220px',
    overflowY: 'auto',
  },
  statusFilter: {
    display: 'block',
    justifySelf: 'right',
    minWidth: '160px',
    height: '40px',
  },
  searchDropdownStyle: {
    height: '30px',
  },
  linkStyleHoverUnderline: {
    color: '#0E86D4 !important;',
    '&:hover': {
      textDecoration: 'underline',
      color: '#0E86D4 !important;',
    },
  },

  executionStatus: {
    margin: 0,
    fontSize: '14px',
    width: '22%',
  },
  cycleName: {
    margin: 0,
    fontSize: '14px',
    width: '27%',
  },
  testCases: {
    margin: 0,
    fontSize: '14px',
    width: '17%',
  },
  noTestCasesText: {
    margin: 15,
    fontSize: '14px',
    width: '22%',
  },
  buttonGroupStyle: {
    fontWeight: 'bold !important',
    fontSize: '13px !important',
    padding: '10px !important',
    marginRight: '7px !important',
    textTransform: 'lowercase !important',
    display: 'flex !important',
    justifyContent: 'flex-end !important',
  },
  activeSprintButton: {
    color: 'white !important',
    backgroundColor: '#13225F !important',
  },
  inactiveSprintButton: {
    color: 'inherit !important',
    backgroundColor: 'inherit !important',
  },
  
  totalDefectsCard: {
    backgroundColor: '#FFFFFF',
    marginLeft: '8%',
  },
  cardImage: {
    paddingRight: '5px',
    paddingLeft: '5px',
  },
  totalTestCasesValue: {
    color: 'green',
  },
  totalDefectsValue: {
    color: 'red',
  },
  headingText: {
    margin: 0,
    color: '#000048',
    fontSize: '18px',
  },
  inputGroupText: {
    border: 'none',
    borderBottom: '1px solid white',
    backgroundColor: 'white',
    borderRadius: '0',
  },
  searchIcon: {
    color: 'rgb(186 186 190)',
  },
  cancelSearchIcon: {
    color: 'rgb(186 186 190)',
    fontSize: '23px',
    marginTop: '-7px',
  },

});

export default cssClasses;
