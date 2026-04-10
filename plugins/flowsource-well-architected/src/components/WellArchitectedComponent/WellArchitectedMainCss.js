import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles((theme) => ({

  tab: {
    cursor: 'pointer'
  },
  active: {
    color: '#397ca7',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  activeTab: {
    color: '#397ca7',
    backgroundColor: 'none',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  disableTab: {
    color: '#9fbfd4',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  verticalLine: {
    borderRight: '1px solid blue',
    height: '19px',
    margin: '2px 0',
  },
  accordianDisplay: {
    display: ['block', "!important"]
  }
}));

export default cssClasses;