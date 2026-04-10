import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles({

    background: {
        backgroundColor: '#F8F8F8',
        width: '100% !important',
    },
    cardBorderRadius: {
        borderRadius: '0%',
    },
    cardPadding:{
        paddingBottom: '4px'
    },

    cardDesc: {
        /* vertical-align: super, */
        fontSize: '14px',
        display: 'block',
    },
    card1val: {
        color: '#4CB4FF',
        fontSize: '3rem',
        fontWeight: '800',
        fontStretch: 'semi-condensed',
    },
    card2val: {
        color: '#9782e7',
        fontSize: '3rem',
        fontWeight: '800',
        fontStretch: 'semi-condensed',
    },
    card3val: {
        color: '#3d905c',
        fontSize: '3rem',
        fontWeight: '800',
        fontStretch: 'semi-condensed',
    },
    card4val: {
        color: '#d94b4b',
        fontSize: '3rem',
        fontWeight: '800',
        fontStretch: 'semi-condensed',
    },

    cardText4: {
        marginRight: '-3%',
    },

    subscript: {
        fontSize: 'large',
    },

    cardFooter: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: '10px',
        fontSize: 'xx-small', 
        color: '#6c757d',
        fontStyle: 'italic' 
    },    

    chart: {
        maxWidth: '36rem',
        maxHeight: '16rem',
    },
    chartCardHeight: {
        height: '19rem !important',
    },

    cardBody: {
        minHeight: '2rem',
    },
    cardText: {
        marginTop: '-8%',

        "& #percent": {
            fontSize: 'xx-large',
        },
    },
    cardDisabled: {
        backgroundColor: 'lightgray',
    },
    cardEnabled: {
        backgroundColor: 'white',
    },
    iconPlacement: {
        width: '26px',
        height: '26px',
        marginRight: '10px'
    },
    pluginHeading: {
      display: 'flex',
      justifyContent: 'space-between',
    },

});

export default cssClasses;
