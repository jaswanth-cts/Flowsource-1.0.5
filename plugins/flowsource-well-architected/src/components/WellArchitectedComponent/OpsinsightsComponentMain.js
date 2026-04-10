import { useState } from 'react';
import cssClasses from '../WellArchitectedComponent/WellArchitectedMainCss.js';
import PluginLoaderFactory from './PluginLoaderFactory';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import 'bootstrap/dist/css/bootstrap.min.css';

const OpsinsightsComponentMain = () => {
  const classes = cssClasses();
  const [expanded, setExpanded] = useState(false);
  const config = useApi(configApiRef); const pluginNames = config.getString('wellArchitectedPlugins.plugins')
    .split(',')
    .map(name => name.trim()) || [];
  const plugins = [
    'DevopsGuru'
  ];

  const handleExpand = (plugin) => (_e, isExpanded) => {
    setExpanded(isExpanded ? plugin : false);
  };

  const availablePlugins = plugins.filter(plugin => pluginNames.includes(plugin));

  return (
    <div>
      {availablePlugins.map(plugin => (
        <PluginLoaderFactory pluginName={plugin} />
      ))}
    </div>
  );
};

export default OpsinsightsComponentMain;