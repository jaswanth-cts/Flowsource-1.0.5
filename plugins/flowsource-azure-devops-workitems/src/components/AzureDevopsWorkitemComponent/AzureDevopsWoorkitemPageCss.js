import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({
    issueStatusBarChart: {
        height: '17rem', 
        padding: '1rem 1rem 0.5rem 1rem'
    },
    reqByPriorityChart: {
        height: '17rem', 
        padding: '1rem 1rem 0.5rem 1rem'
    },
    devopsMainCointainer: {
        marginLeft: '1.5%',
        marginTop: '5px',
    },
    chartSection: {
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'space-between'
    },
    chartCards: {
        height: '20rem'
    },
    chartCardHeading: {
        paddingTop: '10px',
        paddingBottom: '3px',
        paddingLeft: '32px',
        fontWeight: 'bold',
    },
    devopsInfoContent: {
        marginTop: '10px',
    },
    infoContPrjName: {
        display: 'flex',
        gap: '1px',
        marginBottom: '0.4rem',
        justifyContent: 'space-between'
    },
    projectDefaultImage: {
        width: '50px',
        height: '50px'
    },
    infoContPrjNameContent: {
        marginTop: '15px',
        paddingTop: '5px',
        marginLeft: '5px'
    },
    infoContCard: {
        padding: '0.5rem 1.5rem 1rem 1rem',
    },
    infoContPrjItems: {
      display: 'flex',
      justifyContent: 'space-between',
      textAlign: 'left',
      marginTop: '20px',
      marginBottom: '20px',
    },
    infoContPrjItemsCards: {
      width: '140px',
      height: '60px',
      margin: '0rem 1rem 1rem 0rem',
    },
    infoContPrjIcon: {
        display: 'flex',
        alignItems: 'left',
        height: '100%',
    },
    infoContPrjIconContent: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: '20px',
    },
    infoContPrjIconImage: {
        width: '40px', 
        height: '40px'
    },
    devopsIconName: {
      fontSize: [16, '!important'],
      fontWeight: 'bold',
    },
    devopsIconIconValue: {
        fontSize: [20, '!important'],
        fontWeight: 'bold',
        lineHeight: '1',
        margin: '0px',
    },
    cardBorder: {
        borderColor: '#9bd7ff',
      },
      cardBody: {
        paddingTop: '2px',
        paddingBottom: '0px',
      },
      thStyle: {
        backgroundColor: '#2e308e !important;',
        color: 'white !important;',
      },
      trStyle: {
        fontSize: 'small',
      },
      tableStyle: {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        overflowX: 'auto',
        textAlign: 'center',
      },
      tableStriped1: {
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    
        '& tbody': {
          '& tr': {
            '& td': {
              fontSize: '13px',
            },
            '& th': {
              fontSize: '0.4rem',
            },
            '& .tdNameStyle': {
              whiteSpace: 'break-spaces',
              textAlign: 'left',
            },
            '& .tdNameStyleCenter': {
              textAlign: 'center',
            },
          },
          '& tr:nth-child(even)': {
            '& th': {
              backgroundColor: '#E5F7FF',
            },
          },
        },
      },
      hoverUnderline: {
        color: '#0E86D4 !important;',
        '&:hover': {
          textDecoration: 'underline',
          color: '#0E86D4 !important;',
        },
      },
      pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        listStyleType: 'none',
      },
      numCss: {
        backgroundColor: '#2e308e',
        border: '1px solid #2e308e',
        padding: '2px 0px',
      },
      liCss: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      btnCss: {
        background: 'none',
        border: 'none',
        height: '20px',
        width: '10px',
      },
      isLoadingStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '100vh',
        paddingTop: '30%',
      }
    }));

export default cssClasses;
