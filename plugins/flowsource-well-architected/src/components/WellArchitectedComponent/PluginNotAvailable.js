import React from 'react';

const PluginNotAvailable = ({ pluginName }) => {
  console.log('PluginNotAvailable', pluginName);
  return (
    <div className="mt-3">
     <div className="alert alert-danger">{pluginName} plugin not available. Please add the plugin.</div>
    </div>
  );
};

export default PluginNotAvailable;