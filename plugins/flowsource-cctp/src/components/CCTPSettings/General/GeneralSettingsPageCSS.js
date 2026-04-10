import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  loading: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    height: '10vh', 
    paddingTop: '30%',
  },
  generalTabUpdateButton: {
    backgroundColor: '#13215E',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  generalTabButtonContainer: {
    marginBottom: '1rem',
    marginLeft: '12.5rem',
  },
  dialogOverlay: {
    position: "fixed",
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
  errorDialogBoxButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    width: '4rem',
    backgroundColor: '#000048'
  },
  dialogBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center'
  },
  parentDivMain: {
    width: '9.9%',
  },
  parentDiv: {
    width: '100%', 
    border: 'none',
  },
  newFrameworkTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#13215E',
    marginBottom: '1rem',
    marginLeft: '1rem',
    marginTop: '1rem',
  },
 
  errorText: {
    color: '#d66d6d',
  },

}));

export default cssClasses;