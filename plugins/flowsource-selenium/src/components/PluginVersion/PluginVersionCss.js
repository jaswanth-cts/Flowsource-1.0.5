import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    InfoIcon: {
        '&:hover': {
            backgroundColor: 'inherit !important;',
        }
    }
    
}));

export default cssClasses;