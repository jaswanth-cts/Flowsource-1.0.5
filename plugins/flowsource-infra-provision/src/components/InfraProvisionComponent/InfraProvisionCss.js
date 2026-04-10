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

  PageTitle: {
    marginBottom: '2%',
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
    minheight: '30px', 
    height: '30px',
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
  isLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '20vh',
    marginTop: '15vh',
  },
  conGrid:{
    width:'100%',
  },
  buttonGrid:{
    marginLeft:'auto',
  },
  addButton:{
marginRight:'-1rem',
  },
  addButtonImg:{
    width:'2.5rem',
  }
});
export default cssClasses;
