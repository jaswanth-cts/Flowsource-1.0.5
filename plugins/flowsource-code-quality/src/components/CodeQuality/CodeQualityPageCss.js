import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    scanStatusSection: {
       display: 'flex',
       justifyContent: 'space-between',
       alignItems: 'center',
    },
    scanDateText: {
        fontSize: [18, "!important"],
        fontWeight: 'bold',
    },
    qualityGateStatus: {
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'center',
        gap: '1rem'
    },
    qgsText: {
        fontSize: [16, "!important"],
        fontWeight: 'bold',
    },
    statusTextBox: {
        width: '11rem',
        height: '4rem',
    },
    infoContCard: {
        marginTop: '1rem',
        marginBottom: '0.5rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
    },
    infoContPrjItems: {
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'center',
        marginTop: '1.2rem',
        marginBottom: '1.2rem',
    },
    infoContPrjItemsCards: {
        width: '10.7rem',
        height: '6rem',
        margin: '0rem 0rem 0rem 0.7rem'
    },
    firstInfoContPrjItemsCards: {
        width: '10.7rem',
        height: '6rem',
    },
    infoContPrjIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15px'
    },
    cardIconName: {
        paddingLeft: '3px',
        fontSize: [16, "!important"]
    },
    cardIconValue: {
        fontSize: [25, "!important"],
        fontWeight: 'bold'
    },
    cardIconValueIfNoData: {
        fontSize: [18, "!important"],
        fontWeight: 'bold'
    },
    cardVulnerbIconName: {
        fontSize: [16, "!important"],
        paddingRight: '0.3rem'
    },
    infoContHotspotPrjIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10px'
    },
    cardhotspotIconName: {
        paddingRight: '20px',
        fontSize: [16, "!important"]
    },
    cardhotspotIconValue: {
        fontSize: [25, "!important"],
        fontWeight: 'bold',
    },
    allScanTextSection: {
        marginBottom: '1rem'
    },
    allScanText: {
        fontSize: [18, "!important"],
        fontWeight: 'bold',
    },
    chartSection: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    chartCardHeading: {
        paddingTop: '1rem',
        paddingLeft: '1.2rem',
        fontWeight: 'bold',
    },
    pluginHeading: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    sonarQubeLink: {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: '#3f51b5',
        '&:hover': {
            textDecoration: 'underline',
        },
    },

}));

export default cssClasses;