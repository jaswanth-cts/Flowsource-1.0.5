import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  tab: {
    cursor: 'pointer'
  },
  tablefont: {
    color: '#2F78C4',
    fontSize: '0.80rem',
    fontWeight: '700',

  },
  buttonStyle:{
    margin: '0 3px', // Add spacing between buttons
    fontSize: '13px',
    minWidth: '87px',
    height: '35px',
    borderRadius: '6px'
  },
  cardBorder: {
    border: '0.5px solid #000048'

  },
  tableRow: {
    backgroundColor: '#3373b2',
    color: 'white',
    height: '10px !important'
  },
  tableBorders: {
    // border: '0.1rem solid #dee2e6',
    borderCollapse: 'collapse',
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
    paddingRight: '1rem',
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
infoContPrjItemsCards: {
  width: '320px',
  height: '87px',
  margin: '0rem 1rem 0rem 0rem'
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
cctpIconIconValue: {
  fontSize: [20, "!important"],
  fontWeight: 'bold',
  marginBottom: '0'
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
    color: '#13215E',
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
    fontFamily: 'Helvetica',
    float: "right", 
    fontSize: "12px"
  },
  accordianDisplay: {
    display: ['block', "!important"],
    backgroundColor: 'white',
    padding: 0,
    paddingBottom: '1px',
    // backgroundColor: '#f2f7f4',
  },

  accordianSummary:{
    backgroundColor: '#92bbe6',
  },
  mainDiv: {
    width: ['100%', '!important'],
    border: ['none', '!important'],
  },
  colStyle: {
    color: ['white', '!important'],
    backgroundColor: ['#000048', '!important'],
  },
  tBody: {
    textAlign: ['-webkit-center', '!important'],
  },
  colStyleText: {
    padding: '0.7rem 0.2rem 0rem 0rem !important',
    fontSize: '13px',
  },
  colStyle1: {
    padding: '0.2rem 0.2rem !important',
    fontSize: '13px',
  },
  heading1: {
    width: 'max-content',
    color: '#13215E',
  },  
  table2:{
    marginLeft:'-1.5rem',
    marginRight:'-1rem',
  },
  performanceIconImg: {
    width: '15px', 
    height: '15px', 
    marginRight: '3px', 
    marginLeft: '15px' 
  },
  performanceIconText: {
    fontSize: '0.7rem'
  },
  accessibilityIconImg: {
    width: '15px', 
    height: '15px', 
    marginRight: '3px', 
    marginLeft: '17px' 
  },
  accessibilityIconText: {
    fontSize: '0.7rem',
    paddingLeft: '2px'
  },
  customImage: {
    width: '53% !important',
  },  

  cspamDiv1:{
    float: "right",
  },
  tabDiv1:{
    marginLeft: '-1rem',
  },
  tab2Div1:{
    marginTop: '-1rem',
    marginRight: '10px', 
    color: '#13215E'
  },
  tab2Div2:{
    marginRight: '10px'
  },
  tab2Div3:{
    marginRight: '1rem', 
    marginTop: '0.7rem',
  },
  tab3Div1:{
    marginTop: '-1rem', 
    marginRight: '10px',
  },
  tab3Div2:{
    marginRight: '10px'
  },
  tab3Div3:{
    marginRight: '10px'
  },
  tab3Div4:{
    marginRight: '1rem', 
    marginTop: '0.7rem'
  },
  isLoadingStyle: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    height: '10vh', 
    paddingTop: '30%' 
  },
  dataUnavailable:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    margin: 0,
    paddingRight: '1rem',
    paddingBottom: '1rem',
},
}));

export default cssClasses;
