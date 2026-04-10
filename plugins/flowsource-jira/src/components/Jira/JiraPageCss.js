import { makeStyles } from '@material-ui/core';
// import humanIcon from './Icons/Human.png';
// import robotIcon from './Icons/Robot.png';

const cssClasses = makeStyles(theme => ({
  jiraMainCointainer: {
    marginLeft: '1.5%',
    marginTop: '5px',
  },
  chartSection: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  chartCards: {
    height: '20rem',
  },
  chartCardHeading: {
    paddingTop: '10px',
    paddingBottom: '3px',
    paddingLeft: '32px',
    fontWeight: 'bold',
  },
  jiraInfoContent: {
    marginTop: '10px',
  },
  infoContPrjName: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1px',
    marginBottom: '0.4rem',
  },
  infoContPrjNameContent: {
    marginTop: ['13px', '!important'],
    marginLeft: ['5px', '!important'],
  },
  pluginVersion: {
    marginTop: ['9px', "!important"],
  },
  infoContPrjItems: {
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'left',
    marginTop: '20px',
    marginBottom: '20px',
  },
  infoContPrjItemsCards: {
    width: '228px',
    height: '80px',
    margin: '0rem 1rem 0rem 0rem',
  },
  lastInfoContPrjItemsCards: {
    width: '228px',
    height: '80px',
  },
  infoContPrjIcon: {
    display: 'flex',
    alignItems: 'left',
    height: '100%',
  },
  infoContPrjIconContent: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '20px',
  },
  jiraIconName: {
    fontSize: [16, '!important'],
    fontWeight: 'bold',
  },
  jiraIconIconValue: {
    fontSize: [35, '!important'],
    fontWeight: 'bold',
    lineHeight: '1',
    margin: '0px',
  },
  cardBorder: {
    borderColor: '#9bd7ff',
  },
  cardBody: {
    paddingTop: '2px',
    paddingBottom: '0px',
  },
  thStyle: {
    backgroundColor: '#2e308e !important;',
    color: 'white !important;',
  },
  trStyle: {
    fontSize: 'small',
  },
  tableStyle: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    overflowX: 'auto',
    textAlign: 'center',
  },
  tableStriped1: {
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    '& tbody': {
      '& tr': {
        '& td': {
          fontSize: '13px',
        },
        '& th': {
          fontSize: '0.4rem',
        },
        '& .tdNameStyle': {
          whiteSpace: 'break-spaces',
          textAlign: 'left',
        },
        '& .tdNameStyleCenter': {
          // whiteSpace: 'break-spaces',
          textAlign: 'center',
        },
      },
      '& tr:nth-child(even)': {
        '& th': {
          backgroundColor: '#E5F7FF',
        },
      },
    },
  },
  hoverUnderline: {
    color: '#0E86D4 !important;',
    '&:hover': {
      textDecoration: 'underline',
      color: '#0E86D4 !important;',
    },
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    listStyleType: 'none',
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
  },
  isLoadingStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100vh',
    paddingTop: '30%',
  },
  botimage: {
    height: '90%',
  },
  jiraBotButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
  },
  // jiraBotPopUpHeader: {
  //   height: '4rem',
  //   backgroundColor: '#000039',
  //   position: 'relative',
  //   display: 'flex',
  //   alignItems: 'center',
  // },
  // jiraBotPopUp: {
  //   height: '100%',
  //   backgroundColor: '#fff',
  //   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  //   flexDirection: 'column',
  //   justifyContent: 'center',
  //   overflow:'hidden',
  // },
  // jiraBotPopUpBody: {
  //   height: '100%',
  // },
  // jiraBotImagesSection: {
  //   padding: '20px',
  //   marginTop: '7%',
  //   marginLeft: '5%',
  //   display: 'flex',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   overflow: 'auto',
  //   height: '30%',
  //   minHeight: 0,
  //   flex: 1,
  //   justifyContent: 'center',
  //   width: '100%',
  // },
  // closeButton: {
  //   padding: "0",
  //   minWidth: "24px",
  //   right: "15px",
  //   position: "absolute !important",
  //   right: '16px',
  //   top: '50%',
  //   transform: 'translateY(-50%)',
  //   minWidth: '32px',
  //   minHeight: '32px',
  //   padding: 0,
  // },
  // step: {
  //   width: '25%',
  //   height: '100%',
  //   display: 'flex',
  //   alignItems: 'center',
  //   position: 'relative',
  //   minHeight: '150px',
  //   width: '100%',
  //   flexDirection: 'row',
  // },
  // icon: {
  //   width: '70px',
  //   height: '70px',
  //   borderRadius: '50%',
  //   backgroundColor: '#dfe1e6',
  //   marginBottom: '10px',
  //   backgroundSize: 'inherit', /* Ensures the whole icon fits */
  //   backgroundRepeat: 'no-repeat',
  //   backgroundPosition: 'center',
  //   position: 'relative',
  //   zIndex: 1,
  //   boxShadow: '0 0 0 3px #ffffff, 0 0 0 5px #dfe1e6',
  // },
  // iconCompleted: {
  //   backgroundColor: '#4CAF50',
  //   boxShadow: '0 0 0 3px #ffffff, 0 0 0 5px #4CAF50',
  // },
  // iconCurrent: {
  //   backgroundColor: '#FF9800',
  //   boxShadow: '0 0 0 3px #ffffff, 0 0 0 5px #FF9800',
  // },
  // humanIcon: {
  //   backgroundImage: `url(${humanIcon})`,
  // },
  // robotIcon: {
  //   backgroundImage: `url(${robotIcon})`,
  // },
  // uploadButton: {
  //   padding: '5px',
  //   height: '77px',
  //   backgroundColor: '#000039',
  //   borderRadius: '5px',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   cursor: 'pointer',
  //   textAlign: 'center',
  //   fontSize: '1em',
  //   color: 'white',
  // },
  // connectingLineDiv: {
  //   height: '100%',
  //   flex: '1',
  //   marginTop: '77px',
  // },
  // connectingLine: {
  //   flex: 1,
  //   height: '4px',
  //   background: '#bdbdbd',
  //   marginBottom: '30%',
  // },
  // stepDetailsSection: {
  //   flex: '1',
  //   marginTop: '-5%',
  //   marginLeft: '23%',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   display: 'flex',
  //   flexDirection: 'row',
  //   width: '68%',
  // },
  // stepDetailsCol: {
  //   flex: 1,
  //   textAlign: 'center',
  //   padding: '1rem',
  //   boxSizing: 'border-box',
  //   width: '20%',
  // },
  // visible: {
  //   visibility: 'visible',
  // },
  // hidden: {
  //   visibility: 'hidden',
  // },
  // stepDetails: {
  //   height: '100%',
  //   display: 'flex',
  //   flexDirection: 'column',
  //   alignItems: 'center',
  // },
  // stepDetailsUpload: {
  //   width: '50%',
  // },

}));

export default cssClasses;