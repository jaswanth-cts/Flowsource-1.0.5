import { useState, React } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography, Grid } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import cssClasses from '../WellArchitectedComponent/WellArchitectedMainCss.js';
import PluginLoaderFactory from './PluginLoaderFactory';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import 'bootstrap/dist/css/bootstrap.min.css';

const ReliabilityComponentMain = () => {
    const classes = cssClasses();
    const [expanded, setExpanded] = useState(false);
    const config = useApi(configApiRef);
    const pluginNames = config.getString('wellArchitectedPlugins.plugins')
    .split(',')
    .map(name => name.trim()) || [];
    const plugins = [
      'Datadog',
      'Dynatrace',
      // 'AppDynamics'
    ];

    const handleExpand = (plugin) => (_e, isExpanded) => {
      setExpanded(isExpanded ? plugin : false);
    };

    const availablePlugins = plugins.filter(plugin => pluginNames.includes(plugin));
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

  export default ReliabilityComponentMain;