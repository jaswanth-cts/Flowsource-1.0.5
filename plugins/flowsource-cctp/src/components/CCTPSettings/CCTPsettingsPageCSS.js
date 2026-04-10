import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  verticalLine: {
    borderRight: '2px solid #13215E',
    height: '19px',
    margin: '2px 0',
  },
  mainPageTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0rem 0rem 1rem',
  },
  tab: {
    cursor: 'pointer'
  },
  activeTab: {
    color: '#13215E',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'max-content',
  },
  activeTabUnderline: {
    borderBottom: '2px solid #13215E',
    paddingBottom: '4px',
  },
  disableTab: {
    color: '#9fbfd4 !important',
    fontWeight: 'bold !important',
    width: 'max-content !important',
  },
  active: {
    color: '#13215E',
    fontWeight: 'bold',
    width: 'fit-content',
  }
}));

export default cssClasses;