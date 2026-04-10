import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({
  title: {
    fontsize: '1rem',
  },
  cardCss: {
    height: '100% ! important',
    width: '50% ! important',
  },
  cards: {
    height: '15rem',
  },
  Footer: {
    width: '90px',
    height: '2.1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: '#4187CE',
    backgroundColor: '#4187CE',
    borderRadius: '5px',
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
    marginLeft: '5px',
    marginRight: '-2px',
  },
  detailButton: {
    paddingTop: '0rem',
    paddingbottom: '0rem',
  },
  copyButton: {
    marginTop: '-4rem',
  },
  rowButton: {
    marginTop: '2rem',
  },
  colStyle: {
    padding: '0.65rem 0.65rem !important',
  },
  headStyle: {
    fontSize: '1rem',
  },
  tab: {
    cursor: 'pointer',
  },
  
  tableStriped1: {
    width: "95%",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textAlign: "center",
    textOverflow: "ellipsis",

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

  table: {
    border: '1px solid #A3CDF8',
  },
  tableStriped: {
    '& thead': {
      '& th': {
        fontSize: '1rem',
        backgroundColor: '#4187CE',
        textAlign: 'center',
      },
    },
    '& tbody': {
      '& tr': {
        '& td': {
          fontSize: '1rem',
          textAlign: '-webkit-center',
          paddingBottom: '0rem',
        },
        '& th': {
          fontSize: '1rem',
          textAlign: 'center',
        },
      },
      '& tr:nth-child(2n+1)': {
        '& td': {
          backgroundColor: '#E5F7FF',
          textAlign: '-webkit-center',
          paddingTop: '0.5rem',
          paddingBottom: '0rem',
        },
        '& th': {
          backgroundColor: '#E5F7FF',
          textAlign: '-webkit-center',
          paddingTop: '0.5rem',
          paddingBottom: '0rem',
        },
      },
    },
  },
  pluginHeading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  pluginVersion: {
      paddingTop: '1rem',
      paddingRight: '1.5rem'
  }
});
export default cssClasses;