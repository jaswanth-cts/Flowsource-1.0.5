import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({
popUpErrorBox: {
    position: "fixed",
    width: "24rem",
    height: "12rem",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
},
popUpErrorBoxCard: {
    backgroundColor: 'white',
    borderRadius: '1px',
    textAlign: 'center',
    wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
},
popUpErrorBoxButton: {
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    height: '2rem',
    padding: '0.5rem 1rem',
    marginBottom: '1rem',
    backgroundColor: '#000048',
},

}));

export default cssClasses;