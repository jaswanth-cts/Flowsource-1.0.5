import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({

  title: {
    marginTop:'5px',
    fontSize: '1.5rem',
    fontWeight:'bold'
  },
  background: {
    marginBottom: '2%',
  },
  pageHeader:{
    
  },

  PageTitle: {
    marginBottom: '2%',
  },

  AddButton2: {
  },
  AddButton: {
    left: '100px',
    //transform: 'translateY(-20%)',
    //marginTop: '-2%',
  },


  HostLink: {
    left: '100px',
  },
  HostLinkCardPage: {
    left: '80px',
  },


  table: {
    background: '#B0D4E1',

  },
 
  tableHeader: {
    backgroundColor: '#4483B0 ', 
    color: '#F9FAFA', 
    fontWeight: 'bold',
    marginLeft: '80%', 
    paddingTop: '7px',
    paddingBottom: '1px',
    fontSize: '1.2rem',
  },
  tableButton: {
    backgroundColor: '#4483B0 ', 
    color: '#F9FAFA', 
    fontWeight: 'bold',
    marginTop: '7%',
    marginLeft: '80%', 
    paddingTop: '7px',
    paddingBottom: '7px',
  },
  tableRow: {
    backgroundColor: '#3373b2', 
    color: 'white',
    height:'10px !important',
    minheight: '30px', 
    paddingTop: '7px',
    paddingBottom: '7px',
  },
  refreshButton: {
    left: '22%',
    transform: 'translateY(-20%)',
    marginTop: '7%',
    color: '#1498CD',
  },
  Amber: {
    backgroundColor: '#F5BD2C',
  },
  Green: {
    backgroundColor: '#11BF6A',
  },
  Red: {
    backgroundColor: '#FB6868',
  },
  defaultClass: {
    backgroundColor: 'gray',
  },

  cardsRow: {
    marginbottom: '-1.5rem' , 
  },

  card: {
    borderRadius: '8px',
    marginTop: '8%',
    color: 'white',
    boxshadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: '194px',
  },
  title1: {
    fontSize: '1.20rem',
    height: '7%',
    color: '#E4E4E4',
    textAlign: 'start',
  },
  description: {
    fontSize: '0.9rem',
    color: '#E4E4E4',
    height: '29%',
    marginbottom: '7%',
  },
  footer: {
    width: '100%',
    margin: ['0 0 0 0', "!important"],
    height: '28%'
  },
  buttonsection: {
    marginLeft: '-50%',
  },
  button: {
    width: '6rem',
    height: '2.1rem',
    color: '#ECF1F4',
     backgroundColor: '#404447',
     fontSize: '0.9rem',
     cursor: 'pointer',
     border: '#1F292C',
     borderRadius: '5px',
  },
  backbutton: {
    width: '6rem',
    height: '2.1rem',
     backgroundColor: '#39ABD8',
     fontSize: '0.9rem',
     cursor: 'pointer',
     border: '#1F292C',
     borderRadius: '5px',
     fontWeight: 'bold',
  },

  h2configure: {
    fontWeight: 'bold', 
    fontSize: '1.6rem', 
    marginBottom: '5%'
  },
  layout: {
    border: '1px solid #ccc', 
    padding: '20px', 
    borderRadius: '8px', 
    height: '350px', 
    position: 'relative' 
  },
  heading: {
    fontWeight: 'bold', 
    fontSize: '1rem', 
    marginBottom: '3%' 
  },
  textarea: {
    width: '100%',
    height: '213px',
    padding: '10px',
    fontsize: '1rem',
    border: '1px solid #ccc',
    borderradius: '4px',
    resize: 'vertical',
  },
  showSuccessDialog: {
    position: 'fixed',
    top: '50vh',
    left: '57vw',
    marginBottom: '30vh',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    zIndex: 1000,
    minwidth: '26vw',
    minheight: '24vh',
    zoom: '1',

  },
  
  cancel: {
    marginLeft: '78%', 
    color: '#3E4142', 
    fontSize: '1rem', 
    backgroundColor: '#ECF1F4', 
    borderColor: '#ECF1F4', 
    width: '7%', 
    marginTop: '0%', 
    position: 'static', 
    borderRadius: '5px' 
  },
  startbutton: {
    display: 'inline-block', 
    color: '#E4E4E4', 
    fontSize: '1rem', 
    backgroundColor: '#3987BA', 
    marginLeft: '0.8%', 
    borderColor: '#3987BA', 
    width: '14%', 
    borderRadius: '5px' 
  },
  TaskAltOutlinedIcon: {
    fontSize: '48px', 
    color: '#2BA5E1', 
    marginLeft: '45%', 
    position: 'static',
  },
  message: {
    color: '#1F2224', 
    fontSize: '1rem', 
    textAlign: 'center'
  },
  okbutton: {
    color: '#E4E4E4',
    fontSize: '1rem',
    backgroundColor: '#2EABFB',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderColor: '#2EABFB',
    width: '30%',
    borderRadius: '5px',
    display: 'block', 
  },
tableBorders:{
borderCollapse:'collapse'
},
tableCell: {
    height:'10px !important'
},
chartHeight:{
height:'14.5rem',
},
cardHeight:{
    height:'17rem',
    },
    
searchStyle:{
  color: 'white',
  backgroundColor: '#3373b2',
  border: 'none',
  width: '200px',
  borderRadius: '0px',
  borderBottom: '1px solid white',
  height:'29px',
  fontSize:'small',
  maxWidth:'10rem',
  '&::placeholder':{
color:'white',
  },
  '&:focus':{
    backgroundColor: '#3373b2',
    borderBottom: '1px solid white',
    boxShadow:'none',
    color:'white'
  },
},    
checkboxs:{
marginBottom:'0.7rem',
},
firstRow:{
  background: '#3373b2', 
  color: 'white', 
  height: '3.5rem',
  borderRadius:'3px',
},  
lastRow:{
  background: 'white', 
  color: 'white', 
  height: '3.5rem',
  borderRadius:'3px',
  marginLeft:'0rem',
  marginTop:'-1rem',

},    
tableHead:{
fontSize:'0.70rem'
},
tableStriped1: {
    "& tbody": {
      "& tr": {
        "& td": {
          fontSize: "0.80rem"
        },
        "& th": {
          fontSize: "0.8rem"
        }
      },
      "& tr:nth-child(2n+1)": {
        "& td": {
          backgroundColor: '#d5eaff',
        },
        "& th": {
          backgroundColor: '#d5eaff',
        }
      },
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageItem: {
    margin: '0 2px',
  },
  paginations:{
marginTop:"1rem",
marginLeft:"1rem",
  },
  numCss:{
color:'white'
  },
  ulCss:{
    lineHeight:'1rem',
  },
  customPagination: {
    '& .Mui-selected': {
     // border: '1px solid #000',
      backgroundColor: '#3373b2 !important',
      color:'white'

    },
  },
  pStyle:{
    textAlign:'center',
    paddingTop:'6rem'
  },
  cardCss:{
    height:'100% ! important'
  },
  cards:{
    height:'15rem'
  },
  buttonStyle:{
    margin: '0 8px', // Add spacing between buttons
    fontSize: '13px',
    minWidth: '87px',
    height: '35px',
    borderRadius: '6px'
  },
  displayMsg:{
    textAlign: 'center',
    paddingTop: '15px',
    fontSize:'0.82rem'
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});
export default cssClasses;