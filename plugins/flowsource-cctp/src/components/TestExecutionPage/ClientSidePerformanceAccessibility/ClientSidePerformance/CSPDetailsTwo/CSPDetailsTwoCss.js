import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    barChartHeading: {
        backgroundColor: '#000048',
        color: '#ffffff',
        padding: '0.6rem 0rem 0.6rem 1rem',
        fontSize: '0.82rem',
    },
    cardsSection: {
        justifyContent: 'space-around !important',
    },
    cardContent: {
        display: 'flex !important',
        height: '4.2rem',
        width: '100% !important',
    },
    cardHeading: {
        fontWeight: 'bold',
        fontSize: '0.9rem',
        padding: '0.4rem 0rem 0.1rem 0.6rem',
    },
    cardValue: {
        padding: '0.1rem 2rem 0.2rem 0.6rem',
    },
    tTFPCardColor: {
        backgroundColor: '#fcbf09 !important', 
        width: '1.3rem !important' 
    },
    tTCPCardColor: {
        backgroundColor: '#7cb943 !important', 
        width: '1.3rem !important' 
    },
    loadTimeCardColor: {
        backgroundColor: '#ff7b7b !important', 
        width: '1.3rem !important' 
    },
    pageSizeCardColor: {
        backgroundColor: '#e7b2fe !important', 
        width: '1.3rem !important', 
    },
    noOfReqCardColor: {
        backgroundColor: '#3f4ef0 !important', 
        width: '1.3rem !important' 
    },

    tableDiv: {
        margin: '0.5rem 1rem 0.5rem 1rem', 
        border: '0.1rem solid #ccc8c8'
    },
    tableHead: {
        fontSize: '12px !important', 
        position: 'sticky !important', 
        top: [0, '!important'],
        zIndex: [1, '!important'],
    },
    tableHeadTh: {
        border: 'none !important', 
        backgroundColor: '#ccc8c8 !important' 
    },
    tBody: {
        fontSize: '11px'
    },
    tBodyTdName: {
        border: 'none !important', 
        fontWeight: 'bold !important' 
    },
    tBodyTdVal: {
        border: 'none !important' 
    },

    stackedBarGraph: {
        height: '10rem', 
        padding: '0rem 0.1rem 0rem 0.3rem', 
        margin: '0rem'
    },
    pieChartGraph: {
        height: '20rem', 
        padding: '0rem 2rem 0rem 2rem'
    },

    isLoadingStyle: {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        height: '10vh', 
        paddingTop: '30%' 
    },
    noDataMain: {
        padding: '0rem 1.1rem 0.5rem 1rem'
    },
    noDataHeading: {
        fontSize: '1.2rem !important',
    },
    noDataMessage: {
        display:'flex', 
        justifyContent: 'center', 
        width: '100%', 
        fontSize: '1.1rem', 
        paddingTop: '1.5rem', 
        paddingBottom: '2rem'
    }

}));

export default cssClasses;