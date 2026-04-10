import { makeStyles } from '@material-ui/core';
 
const cssClasses = makeStyles((theme) => ({
 
    chatBox: {
        flexDirection: 'column',
        justifyContent: 'center',
        overflow:'hidden',
    },
    closeButton: {
        padding: "0",
        minWidth: "24px",
        right: "15px",
        position: "absolute",
    },
    textareaContainer:{
        display:'flex',
        width:'28rem',
        alignItems:'center',
        justifyContent:'space-between',
        padding:theme.spacing(2),
    },
    textField:{
        marginTop:'auto',
    },
    messageHeader: {
        backgroundColor: 'blue',
        color: 'white',
        height: '25%'
    },
    messagesArea: {
        display: 'flex',
        alignItems: "center",
    },
    messageContent: {
      padding:theme.spacing(2),
      flex:1,
      overflowY:'auto',
    },
    searchBar: {
        postion: 'fixed',
    },
 
    middlesection:{
        display:'flex',
        flexDirection:'column',
        height:'25rem',
    },
    userMessage: {
        backgroundColor: 'lightgrey !important',
        padding: '8px',
        borderRadius: '8px !important',
        marginBottom: '8px',
        textAlign:'left',
        width:'fit-content',
        alignSelf:'flex-start !important'
      },
      apiMessage: {
        backgroundColor: '#006CA5 !important',
        color: 'white !important',
        padding: '8px',
        borderRadius: '8px !important',
        marginBottom: '8px',
        alignSelf:'flex-end !important'
      },
      userMessageContainer: { display: 'flex', 
      justifyContent: 'flex-start', // align to the left
     },
       apiMessageContainer: { display: 'flex',
        justifyContent: 'flex-end', // align to the right 
    },
    imageStyle:{
        width:'2rem',
        height:'2rem',
        paddingTop:'12px',
    },
 
}));

export default cssClasses;
