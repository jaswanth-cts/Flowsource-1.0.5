import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  pieChart: {
    maxWidth: '40rem',
    maxHeight: '20rem',
    marginTop: '2rem',
    justifyContent: 'center',
    display: 'flex',


  },
  displayError: {
    fontWeight: 'bold',
    fontSize: '18px',
  },
  rowStyle: {
    marginTop: '-1.2%',
  },
  colStyle: {
    padding: '0.65rem 0.65rem !important',
  },
  bStyle: {
    border: 'white',
    backgroundColor: '#e8effa',
  },
  
  iconStyle: {
    flex: '1 0 auto',
  },
  card2: {
    marginBottom: '2rem',
    marginRight: '2rem',
    height: '17.6rem',
  },
  shadowBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 16px 16px 28px',
    borderRadius: '35px',
    backgroundColor: 'lightgrey',
    width: 'max-content',
  },
  pStyle: {
    display: 'inline-flex',
  },
  boxStyle: {
    borderRight: '1px solid black',
    paddingRight: '6px',
    marginLeft: '-1.5rem'
  },
  boxStyle1: {
    borderRight: '1px solid black',
    paddingRight: '6px',

  },
  gitStyle: {
    paddingLeft: '5px'
  },

  optionStyle: {
    color: 'blue !important',
  },
  selectStyle: {
    marginTop: '-1rem',
    height: '2rem',
    borderTopRightRadius: '15px',
    color: '#62a2df',
    borderBottomRightRadius: '15px',
    border: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  mainBackgroundRender: {
    backgroundColor: '#e8effa',
    width: '100%',
  },
  mainBackground: {
    backgroundColor: '#e8effa',
    width: '127%',
  },
  backgroundClass: {
    backgroundColor: '#e8effa',
  },
  heading: {
    textAlign: 'left',
    padding: '5px',
    fontWeight: 'bold',
    color: '#30599c',
    marginLeft: '1.5%',
    marginTop: '1.5%',
  },
  cardStyle: {
    marginBottom: '-0.1rem',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    marginTop: '-0.15rem',
  },
  rStyle: {
    marginTop: '2rem',
  },
  mainWidth: {
    //width:'max-content'
  },
  cardBorder: {
    borderColor: '#9bd7ff'
  },
  imageStyle: {
    width: '28px',
    height: '21px',
    marginTop: '-1.6em',
  },
  linkStyle: {
    textDecoration: 'none',
    color: '#3694ff'
  },
  cardBody: {
    paddingTop: '2px'
  },
  ttStyle: {
    fontSize: 'small',
    color: 'black',
    fontWeight: 'normal',
  },
  tabsContainer: {
    display: 'flex',
    alignItems: 'left',
    justifyContent: 'left',
    flexDirection: 'column',
  },
  tabRow: {
    display: 'flex',
    alignItems: 'left'
  },
  tab: {
    cursor: 'pointer'
  },
  active: {
    color: '#397ca7',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  activeTab: {
    color: '#397ca7',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  disableTab: {
    color: '#9fbfd4',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  nStyle: {
    fontSize: 'small',
    color: 'grey',
  },
  verticalLine: {
    borderRight: '1px solid blue',
    height: '19px',
    margin: '2px 0',
  },
  heading1: {
    color: '#1c6899',
    textAlign: 'left',
    fontSize: 'larger',
    fontWeight: 'bold',
    paddingLeft: '8px',
  },
  trStyle: {
    fontSize: 'small',
  },
  sStyle: {
    border: '1px solid #3e97be',
    borderRadius: '12px',
    padding: '5px',
    paddingLeft: '15px',
    paddingRight: '15px',
    display: 'inline-block',
  },
  tableStyle: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    overflowX: 'auto',
    textAlign: 'center',
  },
  tableStriped1: {
    borderCollapse: 'collapse',
    // width: '100%',
    width: "90%",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textAlign: "center",
    textOverflow: "ellipsis",
    // "& tbody": {
    //   "& tr": {
    //     "& td": {
    //       fontSize: "0.65rem",
    //       border: "none",
    //     },
    //     "& th": {
    //       fontSize: "0.8rem"
    //     }
    //   },
    // }
    "& tbody": {
      "& tr": {
        "& td": {
          fontSize: "0.85rem",
        },
        "& th": {
          fontSize: "0.4rem",
        },
        "& .tdNameStyle": {
          whiteSpace: "break-spaces",
          textAlign: "left",
        }
      },
      "& tr:nth-child(2n+1)": {
        "& td": {
          backgroundColor: '#E5F7FF',
        },
        "& th": {
          backgroundColor: '#E5F7FF',
        }
      },
    }
  },

  cardImageScan: {
  },
  cardImageScanTable: {
    flex: '1 0 auto',
    maxWidth: '100%',
    overflowX: 'auto', 
  },

  cardImageScanStyle: {
  },
  fixedLenCol:{
    width: "50%",
    textAlign: 'left'
  },
  ImageScantableStyle: {
    textAlign: 'left !important'
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  sourceHeading: {
    textAlign: 'left',
    padding: '5px',
    fontWeight: 'bold',
    color: '#30599c',
  },
  sourceStyle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

export default cssClasses;
