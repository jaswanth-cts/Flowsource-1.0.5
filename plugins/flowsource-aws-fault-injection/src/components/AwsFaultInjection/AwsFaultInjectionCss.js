import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    mainBackground: {
        backgroundColor: '#e8effa',
    },
    mainWidth:{
        //width:'max-content'
    },
    cardBorder: {
        borderColor: '#9bd7ff'
    },
    imageStyle:{
        width:'31px',
        height:'27px'
    },
    linkStyle:{
        textDecoration:'none',
        color:'#3694ff'
    },
    cardBody:{
        paddingTop:'15px'
    },
    ttStyle:{
        fontSize:'small',
        color:'black',
        fontWeight:'normal',
    },
    tabsContainer:{
      display:'flex',
      alignItems:'left',
      justifyContent:'left',
      flexDirection:'column',
    },
    tabRow:{
        display:'flex',
        alignItems:'left'
    },
    tab:{
       // padding:'10px',
        cursor:'pointer'
    },
    active:{
        color:'#397ca7',
        fontWeight:'bold',
        width:'fit-content',
    },
    activeTab:{
        color:'#397ca7',
        backgroundColor:'none',
        fontWeight:'bold',
        width:'fit-content',
    },
    disableTab:{
        color:'#9fbfd4',
        fontWeight:'bold',
        width:'fit-content',
    },
    nStyle:{
        fontSize: 'small',
        color: 'grey',
    },
    verticalLine: {
        borderRight: '1px solid blue',
        height: '19px',
        margin: '2px 0',
    },
    heading1: {
        color: '#1c6899',
        textAlign: 'left',
        fontSize: 'larger',
        fontWeight: 'bold',
        paddingLeft:'8px',
    },
    trStyle:{
        fontSize:'small',
        //textAlign:'left'
    },
    sStyle:{
        border: '1px solid #3e97be',
        borderRadius: '12px',
        padding: '5px',
        paddingLeft:'15px',
        paddingRight:'15px',
        display: 'inline-block',
    },
    tableStyle:{
        width: '100%',
        borderCollapse: 'collapse',
        // tableLayout: 'fixed',
        // overflowX: 'auto',
        textAlign: 'center',
    },
    tableStriped1: {
        verticalAlign: "middle",
        "& tbody": {
            "& tr": {
                "& td": {
                    fontSize: "0.85rem",
                },
                "& th": {
                    fontSize: "0.4rem",
                },
                "& .tdNameStyle": {
                    whiteSpace: "break-spaces",
                    textAlign: "left",
                }
            },
            "& tr:nth-child(2n+1)": {
                "& td": {
                    backgroundColor: '#E5F7FF',
                },
                "& th": {
                    backgroundColor: '#E5F7FF',
                }
            },
        }
    },
    pluginHeading: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
    pluginVersion: {
        paddingTop: '1rem'
    },
    isLoadingStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '30vh',
        paddingTop: '30%',
      }
}));

export default cssClasses;