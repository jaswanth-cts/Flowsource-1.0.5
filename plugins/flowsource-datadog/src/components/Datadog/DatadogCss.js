import { makeStyles } from '@material-ui/core';
const cssClasses = makeStyles({

  title: {
    fontsize: '1rem',
  },
  modalBody: {
    maxheight: '150px' /* Adjust this value as needed */,
    overflowy: 'auto',
  },
  customText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
    width: '50ch',
    transition: 'width 0.3s ease',
  },
  customText1: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
    width: '28ch',
    transition: 'width 0.3s ease',
  },
  cardCss: {
    height: '100% ! important',
    width: '50% ! important',
  },
  cardCss1: {
    height: '9rem ! important',
    width: '90% ! important',
    marginLeft: '1.5rem',
    marginBottom: '2%,',
    backgroundColor: '#EAFFE8',
    color: '#278E03',
  },
  cardCss2: {
    height: '9rem ! important',
    width: '90% ! important',
    marginLeft: '1.5rem',
    marginTop: '3.1%',
    backgroundColor: '#FFF4D9',
    color: '#A0770C',
  },
  cards: {
    height: '15rem',
  },
  tab: {
    cursor: 'pointer',
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
    margin: '2px 0',
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

  table: {
    border: '1px solid #A3CDF8',
  },
  Amber: {
    backgroundColor: '#FFAC31',
  },
  Green: {
    backgroundColor: '#6ED265',
  },
  Red: {
    backgroundColor: '#FB6868',
  },
  defaultClass: {
    backgroundColor: 'gray',
  },
  Blue: {
    backgroundColor: '#4CB4FF',
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
  datadogLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#3f51b5',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  headingDiv1: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headingDiv2: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  monitorDetailItemSubtitle: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  monitorDetailItemBody: {
    marginBottom: "10px",
  },
  modalButton: {
    backgroundColor: "#323281",
    color: "white",
    margin: "10px 181px",
    height: "31px",
    width: "80px"
  },
  modalBody: {
    margin: "10px 59px",
  },
  headingStyle: {
    color: '#323281',

  },
  cardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  createIcon: {
    width: '14px', height: '14px', marginRight: "4px", backgroundColor: "#16386a"
  },
  previousnextbutton: {
    backgroundColor: '#16386a',
    borderRadius: '0px',
    padding: '4px',
    width: '20px',
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: '#16386a',
    },
    '&:disabled': {
      backgroundColor: '#16386a',
      color: 'white',
      cursor: 'default',
      opacity: 1,
      pointerEvents: 'none',
    },
  },
});
export default cssClasses;
