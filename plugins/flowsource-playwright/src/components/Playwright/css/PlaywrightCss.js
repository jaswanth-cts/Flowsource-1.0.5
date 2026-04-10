import { makeStyles } from '@material-ui/core';
 const cssClasses = makeStyles({
  tableStriped: {
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '20px',
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
        '& .tdNameStyleLeft': {
          textAlign: 'left',
        },
      },
      '& tr:nth-child(even)': {
        '& th': {
          backgroundColor: '#E5F7FF',
        },
      },
    },
  },
  trStyle: {
    fontSize: 'small',
  },
  thStyle: {
    backgroundColor: '#2e308e !important;',
    color: 'white !important;',   
  },
  thStyles: {
    backgroundColor: '#2e308e !important;',
    color: 'white !important;', 
    textAlign: 'left',  
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.5rem'
  },
  tableStyle: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    overflowX: 'auto',
    textAlign: 'center',
  },
  legend:{
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '1px',
  },
  legendSpan:{
    display: 'inline-block',
    width: '12px',
    height: '12px',
    marginRight: '8px',
  },
  });

export default cssClasses;
