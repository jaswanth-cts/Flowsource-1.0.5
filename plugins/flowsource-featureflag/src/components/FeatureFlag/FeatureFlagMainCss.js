import { makeStyles } from '@material-ui/core';

const cssClasses = makeStyles(theme => ({
    
header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
},
leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    width: 'calc(100% - 150px)', // Adjust width to leave space for the button
},    
searchContainer: {
 display: 'flex',
 alignItems: 'center',
 border: '1px solid #ccc',
 borderRadius: '6px',
 marginBottom: '5px',
 height: '35px',
 marginLeft: '450px',
 marginBottom: '5px',
 backgroundColor: 'white'
 },
    
searchInput: {
  width: '100%',
  margin: '3px',
  border: 'none',
  fontSize: '16px',
  height: '30px'
 },
    
searchIcon: {
     fontSize: '18px',
     color: '#888',
     height: '30px',
     },

thStyle: {
    backgroundColor: '#2e308e !important;',
    color: 'white !important;',
},
trStyle: {
    fontSize: '10px',
},     
p: {
        fontSize: '20px',
      },

button: {
    backgroundColor: '#2e308e',
    color: '#fff',
    padding: '10px',
    fontSize: '12px',
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
          fontSize: '0.7rem',
        },
        '& .tdNameStyle': {
          whiteSpace: 'break-spaces',
          textAlign: 'left',
        },
        '& .tdNameStyleCenter': {
          // whiteSpace: 'break-spaces',
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

  tooltip: {
    position: 'relative', // Ensures the tooltip text is positioned relative to this element
    display: 'inline-block', // Makes the tooltip inline for easy placement
    cursor: 'pointer', // Changes the cursor to indicate interactivity
  },
  tooltiptext: {
    position: 'absolute', // Positions the tooltip text relative to the parent
    bottom: '100%', // Places the tooltip above the parent element
    left: '50%', // Centers the tooltip horizontally
    transform: 'translateX(-50%)', // Adjusts for the tooltip's width
    backgroundColor: '#333', // Dark background for the tooltip
    color: '#fff', // White text for contrast
    padding: '8px', // Adds space inside the tooltip
    borderRadius: '4px', // Rounds the corners
    fontSize: '12px', // Sets a smaller font size
    whiteSpace: 'nowrap', // Prevents text wrapping
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Adds a shadow for depth
    opacity: '0', // Initially hides the tooltip
    visibility: 'hidden', // Prevents interaction when hidden
    transition: 'opacity 0.3s ease, visibility 0.3s ease', // Smooth transition for visibility
    zIndex: '1000', // Ensures it appears above other elements
  },
  tooltipHover: {
    '&:hover tooltiptext': {
      opacity: '1', // Makes the tooltip visible
      visibility: 'visible', // Enables interaction
    },
  },

  
popup: {
  position: 'fixed', // Keeps the popup in a fixed position
  paddingTop: '22px', // Adds space around the content
  width: '400px', // Width of the popup
  height: '250px', // Height of the popup
  top: '40%', // Centers vertically
  left: '50%', // Centers horizontally
  transform: 'translate(-50%, -50%)', // Adjusts for the element's size
  backgroundColor: 'white', // Popup background
  padding: '10px', // Adds space inside the popup
  border: '1px solid #ccc', // Adds a border
  borderRadius: '8px', // Rounds the corners
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Adds a shadow for depth
  zIndex: '999', // Ensures it appears above other elements
},
overlay: {
  position: 'fixed', // Covers the entire screen
  top: 0,
  left: 0,
  width: '100%', // Full width
  height: '100%', // Full height
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent grey background
  zIndex: '998', // Ensures it appears below the popup but above other content
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
cardSection: {
    flexWrap: 'wrap',
    gap: '20px',
    paddingTop: '10px',
    width: '250px',
    height: '125px',
    paddingLeft: '20px',
    paddingRight: '20px',
},
infoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
},
infoHeading: {
  paddingBottom: '10px',
},
unleashLink: {
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: '#3f51b5',
  '&:hover': {
      textDecoration: 'underline',
  },
},

  
}));

export default cssClasses;