import React, { useState,useEffect } from 'react';
import { TextField, Box, 
  Button, 
  Typography,
  MenuItem, 
  Select,
  FormControl
} from '@mui/material';
import { createTheme,ThemeProvider } from '@mui/material/styles';
import { useApi, configApiRef ,fetchApiRef } from '@backstage/core-plugin-api';
import { AUTH_PROVIDER_GROUP_LBL, 
  AUTH_PROVIDER_LBL, 
  CREATE_NEWGROUP_MAPPINGS, 
  FLOWSOURCE_GROUP_LBL, 
} from './GroupMappingConst';
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

const GroupMappingPage = ({setShowList}:any) => {
  const classes = useStyles();
  const config = useApi(configApiRef);
  const { fetch } = useApi(fetchApiRef);
  const roleMappingUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/roleMapping`
  const flowsourceGroupUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/get-flowsource-groups`
  const authProviderUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/get-auth-providers`
  
  const [flowsourceGroups, setFlowsourceGroups] = useState<any[]>([]);
  const [authProviders, setAuthProviders] = useState<any[]>([]);

  useApi(configApiRef);


  const [formData, setFormData] = useState({
    flowSourceGroup: '',
    authProvider: '',
    authProviderGroup: '',
  });

  const [errors, setErrors] = useState({
    flowSourceGroup: false,
    authProvider: false,
    authProviderGroup: false,
  });

  const validateField = (name:any, value:any) => {
    if (name === 'flowSourceGroup') {
      return value.trim().length > 0; // Ensure username is not empty
    }
    if (name === 'authProvider') {
      return value.trim().length > 0; // Ensure user group is not empty
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
        body: JSON.stringify({ flowsourceRole: formData.flowSourceGroup , authProvider: formData.authProvider, authProviderRole: formData.authProviderGroup }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Flowsource Group Mapping created successfully!');
        setShowList(true);
      } else {
        log.error('Error submitting form:', response.statusText);
        alert('Flowsource Group Mapping failed to create. Please try again.');
      }
    } catch (error) {
      log.error('Network error:', error);
      alert('Network error. Please check your connection.');
    }
  };


  const handleCancel = () => {
    setErrors({ flowSourceGroup: false, authProvider: false,authProviderGroup:false })
    setFormData({ flowSourceGroup: '', authProvider: '', authProviderGroup: ''}); // Reset the form
    setShowList(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const flowsourceGroupsRes = await fetch(flowsourceGroupUrl); // Replace with your API endpoint
        if (!flowsourceGroupsRes.ok){ 
          throw new Error('Failed to fetch data');
        }
        const grpResult = await flowsourceGroupsRes.json();

        setFlowsourceGroups(grpResult.data)
        const authProvidersRes = await fetch(authProviderUrl); // Replace with your API endpoint
        if (!authProvidersRes.ok){ 
          throw new Error('Failed to fetch data');
        }
        const result = await authProvidersRes.json();
        setAuthProviders(result.data)

      } catch (err) {
        
      } finally {
        
      }
    };
    fetchData();
  }, []);
  return (
    <ThemeProvider theme={themeGroupMapping}>
    <Box className={`${classes.tabContentEditPage}`}
      sx={{
      }}
    >
      <Typography sx={{
         textTransform:'none',
         fontSize:'0.9rem', 
         marginBottom:'0.95em',
         fontWeight:'bold'
      }}>
        {CREATE_NEWGROUP_MAPPINGS}
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
        <Typography sx={{fontSize:'0.8rem',textTransform:'none',}}>
          {AUTH_PROVIDER_GROUP_LBL}
        </Typography>
        <TextField
          name="authProviderGroup"
          value={formData.authProviderGroup}
          onChange={handleChange}
          error={errors.authProviderGroup}
          helperText={errors.authProviderGroup && 'Auth Provider Group is required'}
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
        <Typography sx={{fontSize:'0.8rem',textTransform:'none'}}>
          {FLOWSOURCE_GROUP_LBL}
        </Typography>
        <FormControl sx={{ width: "90%" }}>
            <Select
              name="flowSourceGroup"
              value={formData.flowSourceGroup}
              onChange={handleChange}>
              {
                flowsourceGroups.map((flowsourceGroup) => (
                <MenuItem key={flowsourceGroup.ID} value={flowsourceGroup.flowsource_master}>
                  {flowsourceGroup.flowsource_master}
                </MenuItem>))
              }
            </Select>
        </FormControl>
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
          {AUTH_PROVIDER_LBL}
        </Typography>
        <FormControl sx={{ width: "90%" }}>
            <Select
              name="authProvider"
              value={formData.authProvider}
              onChange={handleChange}>
              {
                authProviders.map((provider) => (
                <MenuItem key={provider.ID} value={provider.flowsource_master}>
                  {provider.flowsource_master}
                </MenuItem>))
              }

            </Select>
        </FormControl>

      </Box>

      <Box  gap={2}
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

export default GroupMappingPage;
