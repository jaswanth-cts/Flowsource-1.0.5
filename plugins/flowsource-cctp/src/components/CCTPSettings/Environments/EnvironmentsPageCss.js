import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

    isLoadingStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '10vh',
        paddingTop: '30%'
    },
    buttonOptionsSection: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        margin: '0rem 1rem 0.5rem 0rem',
    },
    deleteCreateIcon: {
        height: '15px',
        width: '15px',
    },
    disabledLink: {
        pointerEvents: 'none',
        opacity: '0.5',
    },
    deleteCreateIconText: {
        fontSize: '13px',
        color: '#000048 !important'
    },

    tableBorders: {
        borderCollapse: 'collapse',
        // tableLayout: 'fixed',
        "& th": {
            backgroundColor: '#000048',
            color: 'white',
        },
        "& th.checkboxColumn": {
            width: '5%',
        },
        "& th.nameColumn": {
            width: '15%',
            textAlign: 'left',
        },
        "& tbody": {
            textAlign: '-webkit-center',
        },
    },
    tableHead: {
        fontSize: '0.8rem',
        textAlign: 'center',
        backgroundColor: '#000048',
        color: 'white',
    },
    thWithImg: {
        width: '10% !important',
    },
    checkBox: {
        accentColor: "#89CFF0",
    },
    colStyle: {
        padding: '0.2rem 0.2rem !important',
        fontSize: '13px',
    },
    colStyleNameRow: {
        display: 'flex',
        padding: '0.2rem 0.2rem !important',
        textAlign: 'left !important',
        fontSize: '0.80rem !important',
        color: '#2F78C4 !important',
    },
    downloadEnvironmentIcon: {
        height: '11px',
        width: '11px',
        marginRight: '0.6rem',
    },
    dataUnavailable: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        margin: 0,
        paddingRight: '1rem',
        paddingBottom: '1rem',
    },
    customPagination: {
        '& .Mui-selected': {
            backgroundColor: '#000048 !important',
            color: 'white'

        },
    },
    numCss: {
        color: 'white'
    },
    ulCss: {
        lineHeight: '0.70rem',
        paddingRight: '1rem',
    },
    cardHeading: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    cardHeadingText: {
        padding: '0.7rem 0rem 0.2rem 1rem',
        fontWeight: 'bold !important',
        color: '#000048 !important',
    },
    cardCloseButton: {
        padding: '0.8rem 1rem 0.2rem 0rem',
    },
    cardBody: {
        backgroundColor: '#ececec !important',
        margin: '0rem 0rem 1rem 1rem',
    },
    cardContent: {
        padding: '0.5rem 0.8rem 0.5rem 1rem',
        wordWrap: 'break-word',
        overflow: 'hidden',
        maxHeight: '12rem',
        overflowY: 'scroll',
    },
    dataUnavailableForPopUp: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        margin: 0,
        padding: '0.5rem 1rem 0.5rem 1rem',
    },
    dialogOverlay: {
        position: 'fixed',
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
    dialogBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        textAlign: 'center'
    },
    dialogBoxYesButton: {
        color: 'white',
        backgroundColor: '#000048',
        cursor: 'pointer',
        marginRight: '10px',
        border: 'none',
        width: '4rem'
    },
    dialogBoxNoButton: {
        color: 'white',
        backgroundColor: 'grey',
        cursor: 'pointer',
        border: 'none',
        width: '4rem'
    },

    createEnvironmentHeading: {
        color: '#13215E',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        width: 'max-content',
        padding: '0rem 0rem 1rem 1rem',
    },
    formSection: {
        width: '36rem',
    },
    environmentNameSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    environmentFormInputSection: {
        display: 'flex',
        width: 'max-content',
        padding: '0rem 0rem 0.5rem 1rem',
        alignItems: 'center'
    },
    environmentNameLabel: {
        color: '#13215E',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    nameAstrix: {
        color: '#d66d6d !important',
    },
    environmentNameInput: {
        width: '28rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        paddingLeft: '0.3rem',
    },
    environmentNameInput1: {
        width: '9rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        paddingLeft: '0.3rem',
    },
    nameAlreadyTakenIcon: {
        color: '#d66d6d',
        fontSize: '13px',
        paddingLeft: '13rem',
    },
    environmentStatusLable: {
        color: '#9fbfd4 !important',
        display: 'block',
        fontWeight: 'bolder',
        minWidth: '100px',
        fontSize: '0.8rem',
    },
    environmentStatusInput: {
        color: '#bbbbbb',
        backgroundColor: '#ececec',
        width: '20rem',
        height: '1.8rem',
        border: '1px solid #bbbbbb',
        borderRadius: '2px',
        cursor: 'not-allowed',
        paddingLeft: '0.3rem',
    },
   
    createEnvironmentButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
        marginRight: '1rem',
    },
    updateEnvironmentButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px', 
        borderRadius: '3px', 
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
        marginRight: '1rem',
    },
    disableButton: {
        backgroundColor: '#9fbfd4',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
        marginRight: '1rem',
    },
    cancelButton: {
        backgroundColor: '#13215E',
        color: 'white',
        height: '30px',
        borderRadius: '3px',
        justifyContent: 'center',
        fontSize: '0.8rem',
        border: 'transparent',
    },
    popUpErrorBox: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
    },
    popUpErrorBoxCard: {
        backgroundColor: 'white',
        padding: '0.3rem',
        borderRadius: '5px',
        textAlign: 'center',
        width: '35rem',  // Fixed width for the dialog box
        wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
    },
    popUpErrorBoxButton: {
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        width: '4rem',
        backgroundColor: '#000048',
    },
    popUpDownloadBox: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
    },
    popUpDownloadBoxCard: {
        backgroundColor: 'white',
        padding: '0.3rem',
        borderRadius: '5px',
        textAlign: 'center',
        width: '35rem',  // Fixed width for the dialog box
        wordWrap: 'break-word',  // Ensure content wraps to multiple lines if needed
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for better visibility
    },
    popUpDownloadBoxButton: {
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        width: '4rem',
        backgroundColor: '#000048',
    },
    formGroup: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    dropdownLabel: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bolder',
        marginLeft: '1.3rem',
        minWidth: '50px',
        fontSize: '0.8rem',
    },
    labelEnvironments: {
        position: 'absolute',
        left: '8%',
        transform: 'translateX(-50%)',
        paddingRight: '5.8rem',
        paddingTop: '0.5rem',
        fontWeight: 'bold',
        fontColor: '#070707',
    },
    
    spanEnvironments: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '8px',
        border: '1px solid lightgray',
        padding: '3px 6px', // Adjust padding for better fit
        borderRadius: '10px', // Add some border radius for better appearance
        marginBottom: '4px', // Add some margin at the bottom for spacing
        height: '1.3rem', // Adjust the height of the chips
        backgroundColor: '#7175d5',
        color: 'white',
        marginTop: '5px',
    },
    deleteicon: {
        marginLeft: '4px',
        cursor: 'pointer',
        width: '12px', // Adjust the width of the delete icon
        height: '12px' // Adjust the height of the delete icon
    },
   
    labeldropdown: {
        display: 'block',
        padding: '5px'
    },
    
    Robots: {
        display: 'flex', 
        alignItems: 'center', 
        border: '1px solid #D0D0D0', 
        width: '28rem', 
        paddingLeft: '8px', 
        marginTop: '0rem', 
        flexWrap: 'wrap', // Ensure the items wrap if they exceed the width
        overflowY: 'auto', // Enable vertical scrolling if items exceed the height
        maxHeight: '10rem', // Set maximum height for the container
    },
    noItemsFound:{
        marginLeft: '5px',
        height: '1.7rem',
        paddingTop: '0.3rem',
    },
    noItemsFoundUpdate:{
        height: '1.7rem',
        paddingTop: '0.3rem',
    },

   
    dropdownContainer: {
        display: 'block',
    },
    dropdown: {
        width: '28rem',
        backgroundColor: 'white',
        border: '1px solid #D0D0D0',
        maxHeight: '10rem', // Set maximum height for the dropdown
        overflowY: 'auto', // Enable vertical scrolling
        marginTop: '0.5rem', // Add some space between the dropdown and the button section
    },
    environmentFormButtonSection: {
        display: 'flex',
        padding: '0.5rem 0.8rem 1rem 1rem',
        paddingLeft: '26.5rem',
    },
    hiddenOption:{
        display: 'none'
    },
    nameCss:{
        width: '8rem',
        color: 'red',
        fontSize: '0.9em',
        position: 'absolute',
        marginLeft: '36rem',
        paddingTop: '2rem',
      //   left: 'calc(100% + 0px)', // Adjust the position as needed
       // top: '40%',
        transform: 'translateY(-50%)',
    },
    searchStyle:{
        color: 'rgb(186 186 190)',
        backgroundColor: 'white',
        border: 'none',
        width: '200px',
        borderRadius: '0px',
        borderBottom: '1px solid rgb(186 186 190)',
        height:'29px',
        fontSize:'small',
        maxWidth:'10rem',
        '&::placeholder':{
      color:'rgb(186 186 190)',
        },
        '&:focus':{
          backgroundColor: 'white',
          borderBottom: '1px solid rgb(186 186 190)',
          boxShadow:'none',
          color:'rgb(186 186 190)'
        },
      },    
}));

export default cssClasses;