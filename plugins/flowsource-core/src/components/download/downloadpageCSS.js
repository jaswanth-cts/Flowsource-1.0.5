import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({
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
  title: {
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
    width: '7rem',
    height: '2.1rem',
    color: '#ECF1F4',
     backgroundColor: '#404447',
     fontSize: '0.9rem',
     cursor: 'pointer',
     border: '#1F292C',
     borderRadius: '5px',
  },

});
export default cssClasses;
