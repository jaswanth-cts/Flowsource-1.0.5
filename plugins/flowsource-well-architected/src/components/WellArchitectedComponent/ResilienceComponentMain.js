import { useState, React } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {  Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import cssClasses from '../WellArchitectedComponent/WellArchitectedMainCss.js';
import PluginLoaderFactory from './PluginLoaderFactory';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEntity } from '@backstage/plugin-catalog-react';
const ResilienceComponentMain = () => {
    const entity = useEntity();
    const classes = cssClasses();
    const [expanded, setExpanded] = useState(false);
    const config = useApi(configApiRef);
    const pluginNames = config.getString('wellArchitectedPlugins.plugins')
    .split(',')
    .map(name => name.trim()) || [];
    const plugins = [
        'AWS Resilience Hub',
        'AWS Fault Injection',
        'Resilience4j',
      ];
    // Filter plugins based on entity.spec.type === 'infrastructure'
    const filteredPlugins = entity.entity.spec.type === 'infrastructure'
    ? plugins.filter(plugin => plugin === 'AWS Resilience Hub') // Only include AWS Resilience Hub for infrastructure
    : plugins;

    
    const handleExpand = (plugin) => (_e, isExpanded) => {
      setExpanded(isExpanded ? plugin : false);
    };
    const availablePlugins = filteredPlugins.filter(plugin => pluginNames.includes(plugin));
      
    return (

        <div>
        {availablePlugins.map(plugin => (
          <Accordion key={plugin} expanded={expanded === plugin} onChange={handleExpand(plugin)}>
            <AccordionSummary className={`bg-info`} expandIcon={<ExpandMoreIcon />} aria-controls={`${plugin}-content`} id={`${plugin}-header`}>
              <Typography>{plugin}</Typography>
            </AccordionSummary>
            <AccordionDetails className={`${classes.accordianDisplay}`}>
              <Typography>
                <Grid container>
                  <Grid item sm={12}>
                    {expanded === plugin && <PluginLoaderFactory pluginName={plugin} />}
                  </Grid>
                </Grid>
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );
};

export default ResilienceComponentMain;