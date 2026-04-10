import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardRow: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
  },
  card1: {
    padding: theme.spacing(2),
    fontSize: '0.95rem',
  },
  cardHeading: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  customList: {
    paddingLeft: theme.spacing(2),
  },
  customListItem: {
    fontSize: '0.95rem',
  },
  boldDots: {
    fontWeight: 'bold',
    fontSize: '1.6em',
    color: 'white',
  },
  fStyle: {
    fontSize: '0.85rem',
    color: '#555',
  },
  cardStyle: {
    padding: theme.spacing(1),
  },
  pStyle: {
    fontSize: '0.9rem',
  },
  imageStyle: {
    width: '80%',       
    height: '80%',
    objectFit: 'contain',
  },
  
  bStyle: {
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },  
  superBold: {
    fontWeight: 900,
  },
  downloadTooltip: {
    position: 'absolute',
    top: '-35px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    zIndex: 10,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
  },
  alertMessageContainer: {
    position: 'fixed',
    top: '50%', 
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 9999,

    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },  
  alertText: {
    flexGrow: 1,
  },
  alertCloseButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },  
  tooltipArrow: {
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid #333',
  },
  tableBorders:{
    borderCollapse:'collapse',
    verticalAlign:'middle',
  },
  tableHead:{
    fontSize:'0.90rem',
    backgroundColor:'#000048',
    color:'white',
  },
}));

export default useStyles;
