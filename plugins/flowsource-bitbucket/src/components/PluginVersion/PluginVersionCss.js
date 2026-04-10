import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    InfoIcon: {
        '&:hover': {
            backgroundColor: 'inherit !important;',
        },
    },
    cardSection: {
        height: '8rem !important;',
    },
    infoHeading: {
        padding: '0.4rem 1.3rem 0.2rem 1rem', 
        fontWeight: 'bold !important' 
    },
    infoSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0rem 1.5rem 0rem 1.1rem',
    },
    frontEndSect: {
        marginBottom: '0.8rem'
    },
    hr: {
        marginTop: '0.1rem',
        marginBottom: '1rem'
    }
    
}));

export default cssClasses;