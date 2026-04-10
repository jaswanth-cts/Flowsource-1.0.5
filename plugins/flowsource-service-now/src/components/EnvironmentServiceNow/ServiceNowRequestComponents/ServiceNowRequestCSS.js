import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles({
  tableStriped1: {
    '& tbody': {
      '& tr': {
        '& td': {
          fontSize: '0.80rem',
        },
        '& th': {
          fontSize: '0.9rem',
        },
      },
      '& tr:nth-child(2n+1)': {
        '& td': {
          backgroundColor: '#E5F7FF',
        },
        '& th': {
          backgroundColor: '#E5F7FF',
        },
      },
    },
  },
  linkStyle: {
    textDecoration: 'none',
    color: '#3694ff',
  },
  header: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  ulCss: {
    lineHeight: '0.8rem',
    margin: '0rem',
  },
  customPagination: {
    '& .Mui-selected': {
      // border: '1px solid #000',
      backgroundColor: '#3373b2 !important',
      color: 'white',
    },
  },
  numCss: {
    color: 'white',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  pOrderheader: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  pOrdHeadingIcons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1rem',
  },
  isLoadingEnvStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '30vh',
    paddingTop: '5rem !important',
  },
  noDataFound: {
    textAlign: 'center',
    paddingTop: '1rem !important',
  },
});

export default cssClasses;
