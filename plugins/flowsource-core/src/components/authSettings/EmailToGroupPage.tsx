import React, { useState ,useEffect} from 'react';
import { TextField, Box, Button, Typography, MenuItem, Select ,FormControl } from '@mui/material';
import { createTheme,ThemeProvider } from '@mui/material/styles';
import { useApi, configApiRef ,fetchApiRef } from '@backstage/core-plugin-api';
import { EMAIL_REQ,CREATE_NEW_EMAIL_TO_GROUP_MAPPING } from './GroupMappingConst';

import useStyles from '../../styles.js';

import log from 'loglevel';

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

const EmailToGroupPage = ({setShowList}:any) => {
  const classes = useStyles();
const config = useApi(configApiRef);
const { fetch } = useApi(fetchApiRef);
const groupProviderUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/groups`
const roleMappingUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/emailtoRoleMapping`
useApi(configApiRef);
const [providerData, setProviderData] = useState<any[]>([]);
// Fetch data from API
useEffect(() => {

  
  const fetchData = async () => {
    try {
      const response = await fetch(groupProviderUrl); // Replace with your API endpoint
      if (!response.ok){ 
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setProviderData(result.data)
    } catch (err) {
      
    } finally {
      
    }
  };
  fetchData();
}, []);

  const [formData, setFormData] = useState({
    email: '',
    authProviderGroup: '',
  });
  
  const [errors, setErrors] = useState({
    email: false,
    authProviderGroup: false,
  });
  const validateEmail = (emailId:any) => {

    if (!emailId) {
      errors.email = false
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailId)) {
      errors.email = false
    }

    if((!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailId))){
      return false;
    } 
    return true;
  }
  const validateField = (name:any, value:any) => {
    if (name === 'email') {
      return value.trim().length > 0 && validateEmail(value); // Ensure username is not empty
    }
    if (name === 'authProviderGroup') {
      return value.trim().length > 0; // Ensure user group is not empty
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
      const response = await fetch(roleMappingUrl, {
        method: 'PUT',
        body: JSON.stringify({ email: formData.email , authProviderRole: formData.authProviderGroup }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Email To Glowsource Group Mapping created successfully!');
        setShowList(true);
      } else {
        log.error('Error submitting form:', response.statusText);
        alert('Email to flowsource group mapping failed to create. Please try again.');
      }
    } catch (error) {
      log.error('Network error:', error);
      alert('Network error. Please check your connection.');
    }
  };


  const handleCancel = () => {
    setErrors({ email: false,authProviderGroup:false })
    setFormData({ email: '', authProviderGroup: ''}); // Reset the form
    setShowList(true);
  };

 

  return (
    <ThemeProvider theme={themeGroupMapping}>
    <Box
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
        {CREATE_NEW_EMAIL_TO_GROUP_MAPPING}
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
          {"Email"}
        </Typography>
        <TextField
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          helperText={errors.email && EMAIL_REQ}

        />
      </Box>
    
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
          {"Auth Provider Group"}
        </Typography>
        <FormControl sx={{ width: "90%" }}>
            <Select
              name="authProviderGroup"
              value={formData.authProviderGroup}
              onChange={handleChange}>
              {
                providerData.map((provider) => (
                <MenuItem key={provider.ID} value={provider.auth_provider_role}>
                  {provider.auth_provider_role}
                </MenuItem>))
              }
            </Select>
        </FormControl>
      
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

export default EmailToGroupPage;
