import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles({

  mainBackground: {
    backgroundColor: '#F8F8F8',
  },
  pnTitle: {
    color: '#0E679B',
  },
  pnTarget: {
    color: '#1782FF',
    fontSize: '1.25rem',
  },
  rsTitle: {
    color: '#0E679B',
  },
  rsTopText: {
    color: '#F1BC01',
  },
  pnSubText: {
    fontSize: '1.25rem',
  },
  rTitle: {
    fontSize: '1rem',
  },
  orTitle: {
    color: '#0052B3',
  },
  rrTitle: {
    color: '#0D669B',
  },
  nameTitle: {
      color: '#1782FF',
  },
  linkStyle: {
    textDecoration: 'none',
    color: 'blue',
  },
  tableStriped1: {
    "& tbody": {
      "& tr": {
        "& td": {
          fontSize: "0.65rem"
        },
        "& th": {
          fontSize: "0.8rem"
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
  },

});

export default cssClasses;
