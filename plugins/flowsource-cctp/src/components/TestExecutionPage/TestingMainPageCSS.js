import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  tab: {
    cursor: 'pointer'
  },
  mainPageTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0rem 0rem 1rem',
  },
  tableBorders: {
    // border: '0.1rem solid #dee2e6',
    borderCollapse: 'collapse'
  },
  tablefont: {
    color: '#2F78C4',
    fontSize: '0.80rem',
    fontWeight: '700',

  },
  dataUnavailable: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    margin: 0,
    paddingRight: '1rem',
    paddingBottom: '1rem',
  },
  cardBorder: {
    border: '0.5px solid #000048'
  },
  testborder: {
    width: '96%',
    border: 'none',
  },
  tableRow: {
    backgroundColor: '#3373b2',
    color: 'white',
    height: '10px !important'
  },
  tableCell: {
    height: '10px !important'
  },
  chartHeight: {
    height: '14.5rem',
  },
  tableHead: {
    fontSize: '0.8rem',
    textAlign: 'center',
    backgroundColor: '#000048',
    color: 'white',
  },
  tableHeadFailed: {
    fontSize: '0.8rem',
    // textAlign: 'center',
    backgroundColor: '#000048',
    color: 'white',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageItem: {
    margin: '0 2px',
  },
  paginations: {
    marginTop: "1rem",
    marginLeft: "1rem",
  },
  numCss: {
    color: 'white'
  },
  ulCss: {
    lineHeight: '1rem',
    paddingRight: '2rem',
  },
  customPagination: {
    '& .Mui-selected': {
      // border: '1px solid #000',
      backgroundColor: '#3373b2 !important',
      color: 'white'

    },
  },

  priorityCircle: {
    width: '30px',
    color: '#FFFFFF',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11BF6A',
    border: '1px solid #11BF6A',
    marginbottom: '9px',
    fontSize: '0.8rem',
  },
  priorityCircle1: {
    width: '30px',
    color: '#FFFFFF',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11BF6A',
    border: '1px solid #11BF6A',
    marginbottom: '9px',
    fontSize: '0.8rem'
  },
  priorityCircle2: {
    width: '30px',
    color: '#FFFFFF',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FB6868',
    border: '1px solid #FB6868',
    marginbottom: '9px',
    fontSize: '0.8rem'

  },
  infoContPrjItems: {
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'center',
    marginTop: '10px',
    marginBottom: '20px',
  },
  infoContPrjItemsCard: {
    width: '320px',
    height: '87px',
    margin: '0rem 1rem 0rem 0rem',
    backgroundColor: '#06C7CC !important',
  },
  infoContPrjItemsCard1: {
    width: '320px',
    height: '87px',
    margin: '0rem 1rem 0rem 0rem',
    backgroundColor: '#7373D8 !important',
  },


  statuspassed: {
    backgroundColor: '#11BF6A',
    color: '#FFFFFF',
  },
  statusfailed: {
    backgroundColor: '#FB6868',
    color: '#FFFFFF',
  },
  statusdefault: {
    backgroundColor: 'transparent',
    color: '#FFFFFF'
  },
  btnstatus: {
    pointerEvents: 'none',
    width: '4.5rem',
    borderRadius: '6rem',
    fontSize: '0.7rem',
  },

  infoContPrjIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15px'
  },
  cctpIconName: {
    fontSize: [17, "!important"]
  },
  cctpIconName1: {
    fontSize: [16, "!important"]
  },
  verticalLine: {
    borderRight: '2px solid #13215E',
    height: '19px',
    margin: '2px 0',
  },
  cctpIconIconValue: {
    fontSize: [20, "!important"],
    fontWeight: 'bold',
    marginBottom: '0'
  },
  dialogContent: {
    height: '250px',
    marginTop: '-22px', /* Adjust the height as needed */
  },
  dialogtitle: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '-1rem'
  },
  Footer: {
    backgroundColor: '#92bbe6',
    color: 'rgb(19, 33, 94)',
    border: '1.3px solid #92bbe6',
    borderRadius: '16px',
    fontSize: '1rem',
    width: '72px',
    height: '35px',
    fontWeight: 'bold',
  },
  closeButton: {
    justifyContent: 'flex-end',
  },
  dialogPaper: {
    width: '900px', /* Adjust the width as needed */
  },
  buttonStyle: {
    margin: '0 3px', // Add spacing between buttons
    fontSize: '13px',
    minWidth: '87px',
    height: '35px',
    borderRadius: '6px'
  },
  priorityCircle3: {
    width: '30px',
    color: '#FFFFFF',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0A309',
    border: '1px solid #F0A309',
    marginbottom: '9px',
    fontSize: '0.8rem'

  },


  active: {
    color: '#13215E',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  activeTab: {
    color: '#13215E',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'max-content',
  },
  disableTab: {
    color: '#9fbfd4',
    fontWeight: 'bold',
    width: 'max-content',
  },
  activeSubTab: {
    color: '#397ca7',
    backgroundColor: 'none',
    fontWeight: 'normal',
    fontSize: 'small',
    width: 'fit-content',
  },
  disableSubTab: {
    color: '#9fbfd4',
    fontWeight: 'normal',
    fontSize: 'small',
    width: 'fit-content',
  },
  backbutton: {
    color: '#13215E',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'fit-content',
    fontSize: '0.875rem',
    fontFamily: 'Helvetica'
  },
  accordianDisplay: {
    display: ['block', "!important"],
    backgroundColor: 'white',
    padding: 0,
    paddingBottom: '1px',
    // backgroundColor: '#f2f7f4',
  },

  accordianSummary: {
    backgroundColor: '#92bbe6',
  },

  tableStriped1: {
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textAlign: "center",
    textOverflow: "ellipsis",

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
          backgroundColor: 'rgb(0, 0, 72)',
          color: 'white',
        },
        "& th": {
          backgroundColor: 'rgb(0, 0, 72)',
          color: 'white',
        }
      },
    }
  },
  colStyle: {
    color: 'white !important',
    backgroundColor: '#000048 !important',
  },
  colStyle1: {
    padding: '0.2rem 0.2rem !important',
    fontSize: '13px',
  },
  colStyleFailed: {
    paddingLeft: '1.7rem !important',
  },
  colStyle1Failed: {
    padding: '0.2rem 1.7rem !important',
    fontSize: '13px',
  },
  colStyle1Failed1: {
    padding: '0.2rem 4.2rem !important',
    fontSize: '13px',
  },
  heading1: {
    width: 'max-content',
    color: '#13215E',
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  table2: {
    marginLeft: '-1.5rem',
    marginRight: '-1rem',
  },

  tableStriped2: {
    width: "95%",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textAlign: "center",
    textOverflow: "ellipsis",

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
          backgroundColor: '#FFFFF',
        },
        "& th": {
          backgroundColor: '#FFFFF',
        }
      },
    }
  },

  tableStriped: {
    '& thead': {
      '& th': {
        backgroundColor: '#0E86D4 !important',
        textAlign: 'center',
        color: '#FFFFFF',
        fontweight: 500,
        lineheight: '8px',
        fontSize: '18px',
      },
    },
    '& tbody': {
      '& tr': {
        '& td': {
          fontSize: '0.80rem',
          textAlign: '-webkit-center',
          paddingBottom: '0.5rem',
        },
        '& th': {
          fontSize: '0.80rem',
          textAlign: 'center',
        },
      },
      '& tr:nth-child(2n+1)': {
        '& td': {
          backgroundColor: '#E5F7FF',
          textAlign: '-webkit-center',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          fontweight: 500,

        },
        '& th': {
          backgroundColor: '#E5F7FF',
          textAlign: '-webkit-center',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          fontweight: 500,
        },
      },
    },
  },
  pointer: {
    cursor: "pointer",
  },

  dialogOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
  },

  dialogBox: {
    background: "white",
    width: "80%",
    maxWidth: "600px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    padding: "0rem 1rem 1rem 1rem",
  },

  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    top: "0",
    zIndex: "1",
    color: "#000048",
  },

  dialogHeaderText: {
    fontSize: "20px",
    fontWeight: "bolder",
    paddingTop: "5px",
  },

  closeButtonStackTrace: {
    background: "none",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    marginLeft: "auto",
    color: "#000048",
    top: "0",
    marginRight: "-0.5rem",
  },

  dialogContentStackTrace: {
    marginTop: "0",
    flex: "1",
    overflowY: "scroll",
    overflowX: "hidden",
    textAlign: "right",
    scrollbarWidth: "thin",
  },

  textWrap: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    textAlign: "left",
    margin: "0",
  },


  //maintenance report screen css

  customImage: {
    width: '55% !important',
  },
  modalimg: {
    width: '100%',
    height: '100%'
  },
  modalbody: {
    overflowY: 'auto',
    maxHeight: 'calc(88vh - 210px)'
  },
  mrRow: {
    marginLeft: '-4.5rem'
  },
  mrCol: {
    width: '30%'
  },
  card1: {
    width: "100%", // Full column width
    height: "4rem",
    backgroundColor: "#06C7CC",
    color: "white",
  },
  cardBody1: {
    marginTop: '-0.2rem',
  },
  cardTitle1: {
    fontSize: '16px',
    fontWeight: 'bold',
    width: 'max-content',
    color: 'black'
  },
  cardP1: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'black'
  },
  card2: {
    width: "100%",
    height: "4rem",
    backgroundColor: "#7373D8",
    color: "white",
  },
  card2Div: {
    marginTop: '-0.3rem'
  },
  cardTitle2: {
    fontSize: '16px',
    fontWeight: 'bold',
    paddingTop: '18px',
    color: 'black',
    flex: '1'
  },
  cardTitleSecond: {
    fontSize: '16px',
    fontWeight: 'bold',
    paddingTop: '18px',
    color: 'black',
    flex: '1'
  },
  card2P: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'black'
  },
  card2PDiv: {
    flex: '1',
    textAlign: 'center'
  },
  card3: {
    width: "100%",
    height: "4rem",
    backgroundColor: "#06C7CC",
    color: "white",
  },
  card3Div: {
    marginTop: '-0.3rem'
  },
  card3P1: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '-3px',
    color: 'black'
  },
  card3P2: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'black'
  },
  tableDiv1: {
    width: '100%',
    border: 'none'
  },
  thStyle: {
    color: 'white',
    backgroundColor: '#000048',
  },
  mrTableBorders: {
    // border: '0.1rem solid #dee2e6',
    borderCollapse: 'collapse'
  },
  mrTableHead: {
    fontSize: '0.8rem',
    textAlign: 'center',
    backgroundColor: '#000048',
    color: 'white',
  },
  mrColStyle1: {
    padding: '0.2rem 0.2rem !important',
    fontSize: '13px',
  },
  mrTBody: {
    textAlign: '-webkit-center'
  },
  mrTableRow: {
    textAlign: "center",
    //backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white"
  },
  //MaintenanceRepoprtMainPage
  backButtonDiv: {
    float: "right",
  },
  backButtonPre: {
    color: '#13215E',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'fit-content',
    fontFamily: 'Helvetica',
    float: "right",
    fontSize: "12px"
  },
  mrTab2: {
    marginRight: '1rem',
    marginTop: '0.7rem'
  },
  fta: {
    padding: '0rem 1.5rem 0rem 0.7rem'
  },
  blueBoxContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2E308E',
    marginLeft: '-0.7rem',
    marginRight: '-2.8rem'
  },
  blueBoxWithDropdown: {
    flex: '1',
    backgroundColor: '#2E308E',
    padding: '4px',
    display: 'flex'
  },
  mrDropdown: {
    padding: '2.3px',
    borderRadius: '5px',
    marginRight: '13px',
    fontSize: '11px'
  },
  loadingNoData: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '16rem'
  },
  loading1: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '10vh',
    paddingTop: '30%',
  },
  buttonfield: {
    cursor: 'none',
    borderRadius: '6rem',
    fontSize: '0.7rem',
    color: '#FFFFFF'
  },
  stacktrace: {
    width: '15px',
    height: '15px',
    marginRight: '10px',
    marginLeft: '15px'
  },
  click: {
    fontSize: '0.7rem'
  },

  blueBoxContainer1: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2E308E',
    marginLeft: '0.7rem',
    marginRight: '-1.5rem'
  },
  blueBoxContainerBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2E308E',
    marginLeft: '-0.8rem',
    marginRight: '-2.5rem'
  },
  blueBoxContainerBar1: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2E308E',
    marginLeft: '0.4rem',
    marginRight: '-1.5rem'
  },
  blueBoxWithDropdownBar: {
    flex: 1,
    backgroundColor: '#2E308E',
    padding: '4px',
    display: 'flex'
  },
  blueBoxWithDropdownBar1: {
    flex: 1,
    backgroundColor: '#2E308E',
    padding: '4px',
    display: 'flex'
  },
  mrDropdownBar: {
    padding: '2.3px',
    borderRadius: '5px',
    marginRight: '10px',
    fontSize: '11px',
    marginLeft: '60%'
  },
  mrDropdownBar1: {
    padding: '2.3px',
    borderRadius: '5px',
    marginRight: '11px',
    fontSize: '11px',
    marginLeft: '5.8rem'
  },
  mrDropdown1: {
    padding: '2.3px',
    borderRadius: '5px',
    marginRight: '11px',
    fontSize: '11px',
    marginLeft: '0.5rem'
  },
  activeTabUnderline: {
    borderBottom: '2px solid #13215E',
    paddingBottom: '4px',
  },
  createTestPlanButton: {
    fontSize: '14px',
    padding: '3px 8px',
    color: '#FFFFFF',
    backgroundColor: '#13215E',
    borderColor: '#13215E',
    borderRadius: 'none',
    '&:hover': {
      backgroundColor: '#13215E',
      borderColor: '#13215E',
      cursor: 'pointer',
      color: '#FFFFFF',
    },
  },
  cancelButton: {
    fontSize: '14px',
    padding: '3px 8px',
    backgroundColor: '#13215E',
    borderColor: '#13215E',
    borderRadius: 'none',
    '&:hover': {
      backgroundColor: '#13215E',
      borderColor: '#13215E',
      cursor: 'pointer',
    },
  },
  clickTestPlan: {
    cursor: 'pointer',
    color: 'blue !important'
  },
  selectStyle: {
    color: '#13215E',
    fontSize: '15px',
    fontWeight: '500'
  },
  deleteSelectedButton: {
    backgroundColor: '#13215E !important',
    color: 'white',
    fontSize: '0.8rem',
    padding: '5px 10px',
    borderRadius: '4px',
    border: 'none',
    height: "30px",
  },
  dialogOverlayDelete: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  dialogBoxDelete: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center'
  },
  dialogBoxDeleteYesButton: {
    color: 'white',
    cursor: 'pointer',
    marginRight: '10px',
    border: 'none',
    width: '4rem'
  },
  dialogBoxDeleteNoButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem'
  },
  dialogOverlayDeleteError: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  dialogBoxDeleteError: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center',
    width: '35rem',  // Fixed width for the dialog box
    wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
  },
  errorDialogBoxDeleteButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem',
    backgroundColor: '#000048'
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    background: "white",
    padding: 20,
    borderRadius: 8,
    width: 800,
    position: "relative",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  formCheckboxGroup: {
    display: "flex",
    gap: "30px",
    alignItems: "center",
    marginBottom: 15,
    paddingLeft: '17%',
    marginTop: '2%',
  },
  modalFooter: {
    textAlign: "right",
  },
  importButton: {
    background: "#13215E",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: "500",
  },
  closeButtonTestPlan: {
    background: "none",
    border: "none",
    fontSize: '2rem',
    cursor: "pointer",
    position: "absolute",
    top: '0px',
    right: '10px',
  },
  projectModalHeader: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#13215E",
    paddingBottom: '10px',
  },
  smallDropdown: {
    width: '150px',
    height: '30px',
    fontSize: '0.85rem',
    color: '#13215E',
    paddingBottom: '2px',
    paddingTop: '2px',
    borderColor: 'lightgray',
    fontWeight: '400',
    whiteSpace: 'normal',
    textOverflow: 'ellipsis',
  },
  fullScreenLoader: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
  },
  disabledButton: {
    backgroundColor: ' #d3d3d3',
    cursor: 'not-allowed',
  },

  searchStyle: {
    color: 'rgb(186 186 190)',
    backgroundColor: 'white',
    border: 'none',
    width: '200px',
    borderRadius: '0px',
    borderBottom: '1px solid rgb(186 186 190)',
    height: '29px',
    fontSize: 'small',
    maxWidth: '13rem',
    '&::placeholder': {
      color: 'rgb(186 186 190)',
    },
    '&:focus': {
      backgroundColor: 'white',
      borderBottom: '1px solid rgb(186 186 190)',
      boxShadow: 'none',
      color: 'rgb(186 186 190)',
    },
  },
  loadingText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '10vh',
    paddingTop: '30%'
  },
}));

export default cssClasses;
