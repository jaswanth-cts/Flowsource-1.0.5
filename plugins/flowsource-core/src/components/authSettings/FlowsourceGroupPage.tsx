import React, { useState } from 'react';
import { TextField, Box, Button, Typography } from '@mui/material';
import { createTheme,ThemeProvider } from '@mui/material/styles';
import { useApi, configApiRef ,fetchApiRef } from '@backstage/core-plugin-api';
import { 
  FLOWSOURCE_GROUP_REQ
  ,CREATE_NEW_FLOWSOURCE_GROUP
} from './GroupMappingConst';

import log from 'loglevel';

import useStyles from '../../styles.js';
// Create a custom theme 
const themeGroupMapping = createTheme({ 
    components: { 
      MuiTypography:{
        styleOverrides:{
          root:{
            textAlign: 'left',
             minWidth:'20%',
            textTransform:'uppercase',
            fontWeight:'fontWeightBold',
            fontSize:'10px',
            whiteSpace: 'nowrap',
            
          }
        }
      },
        MuiTextField: { 
          defaultProps: { 
            variant: 'outlined', // Default variant 
            fullWidth: true, // Default fullWidth behavior 
            }, 
        }, 

        MuiOutlinedInput:{
          styleOverrides:{
            root:{
              padding:0,
              height:'36px',
              borderRadius:0
            }
          }
        },
       
    }, 
});

//const backendBaseApiUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/roleMapping`

const FlowsourceGroupPage = ({setShowList}:any) => {
  const classes = useStyles();
  const config = useApi(configApiRef);
  const { fetch } = useApi(fetchApiRef);
  const masterDataUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/add-flowsource-group`
  useApi(configApiRef);


  const [formData, setFormData] = useState({
    flowsourceMaster: '',
  });

  const [errors, setErrors] = useState({
    flowsourceMaster: false,
 
  });

  const validateField = (name:any, value:any) => {
    if (name === 'flowsourceMaster') {
      return value.trim().length > 0; // Ensure username is not empty
    }
    
    return true;
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim().length > 0) &&
      Object.values(errors).every((error) => !error);
  };

  const handleChange = (event:any) => {
    const { name, value } = event.target;
    // Validate the input field
    const isValid = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: !isValid,
    }));



    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event:any) => {
    event.preventDefault();
    try {
      const response = await fetch(masterDataUrl, {
        method: 'PUT',
        body: JSON.stringify({ flowsourcemaster: formData.flowsourceMaster }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setShowList(true);
      if (response.ok) {
        alert('Flowsource Group created successfully!');
        setShowList(true);
      } else {
        log.error('Error Group failed to create:', response.statusText);
        alert('Flowsource Group failed to create. Please try again.');
      }
    } catch (error) {
      log.error('Network error:', error);
      alert('Network error. Please check your connection.');
    }
  };


  const handleCancel = () => {
    setErrors({ flowsourceMaster: false })
    setFormData({ flowsourceMaster: ''}); // Reset the form
    setShowList(true);
  };

 

  return (
    <ThemeProvider theme={themeGroupMapping}>
    <Box className={`${classes.tabContentEditPage}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 2,
        height: '100vh',
        width: '100%',
        boxSizing: 'border-box',
       
      }}
    >
      <Typography sx={{
         textTransform:'none',
         fontSize:'0.9rem', 
         marginBottom:'0.95em',
         fontWeight:'bold'
      }}>
        {CREATE_NEW_FLOWSOURCE_GROUP}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 2,
          width: '100%',
          maxWidth: '90%',
        }}
      >
        <Typography sx={{fontSize:'0.8rem' ,textTransform:'none',}}>
          Group Name
        </Typography>
        <TextField
          name="flowsourceMaster"
          value={formData.flowsourceMaster}
          onChange={handleChange}
          error={errors.flowsourceMaster}
          helperText={errors.flowsourceMaster && FLOWSOURCE_GROUP_REQ}

        />
      </Box>

       
 
      <Box gap={2}
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '90%',
          mt: 3,
        }}
      >
        <Button className={`${classes.createButton}`}
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          disabled={!isFormValid()}
        >
          Create
        </Button>
        
        <Button className={`${classes.cancelButton}`}
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
          >
          Cancel
        </Button>
        
      </Box>
    </Box>
    </ThemeProvider>
);
};

export default FlowsourceGroupPage;
