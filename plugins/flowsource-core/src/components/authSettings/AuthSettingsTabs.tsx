
import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";


function TabPanel(props:any) {

  const { children, value, index, ...other } = props;


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


export default function AuthSettingsTabs({ tabs }:any) {
  const [value, setValue] = React.useState(0);
 

  const handleChange = (_:any, newValue:any) => {
    setValue(newValue);
  };


  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}>
          {tabs.map(({ label }:any, i:any) => (
            <Tab sx={{textTransform:"none"}} label={label} key={i} />
          ))}
        </Tabs>
      </Box>
      {tabs.map(({ Component }:any, i:any) => (
        <TabPanel value={value} index={i} key={i}>
          {Component}
        </TabPanel>
      ))}
    </Box>
  );
}

 


