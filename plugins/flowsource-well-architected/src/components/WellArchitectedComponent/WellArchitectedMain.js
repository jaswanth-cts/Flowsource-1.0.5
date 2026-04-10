import { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import cssClasses from './WellArchitectedMainCss.js';
import ResilienceComponentMain from './ResilienceComponentMain.js';
import ReliabilityComponentMain from './ReliabilityComponentMain.js';
import SecurityComponentMain from './SecurityComponentMain.js';
import OpsinsightsComponentMain from './OpsinsightsComponentMain.js';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
const WellArchitectedMain = () => {
  const classes = cssClasses();
  //const [activeTab, setActiveTab] = useState('');
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl');
  const entity = useEntity();
  const annotations = entity.entity.metadata.annotations;
  const pluginNames = config.getString('wellArchitectedPlugins.plugins')
  .split(',')
  .map(name => name.trim()) || [];
  const tabs = [
    { name: 'resilience', label: 'Resilience', component: <ResilienceComponentMain /> },
    { name: 'reliability', label: 'Reliability', component: <ReliabilityComponentMain /> },
    { name: 'security', label: 'Security', component: <SecurityComponentMain /> },
    { name: 'opsinsights', label: 'Ops Insights', component: <OpsinsightsComponentMain /> },
  ];

  const filteredTabs = tabs.filter(tab => {
    if (tab.name === 'resilience') {
      return pluginNames.some(plugin => ['AWS Resilience Hub', 'AWS Fault Injection', 'Resilience4j'].includes(plugin));
    } else if (tab.name === 'reliability') {
      return pluginNames.some(plugin => ['Datadog', 'Dynatrace', 'AppDynamics'].includes(plugin));
    } else if (tab.name === 'security') {
      return pluginNames.some(plugin => ['SAST', 'Veracode Scan', 'SCA', 'Infra Code Scan', 'Prisma Image Scan', 'Prisma Defender Host Scan', 'Prisma Defender Container Scan'].includes(plugin));
    } else if (tab.name === 'opsinsights') {
      return pluginNames.some(plugin => ['DevopsGuru'].includes(plugin));
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState(filteredTabs.length > 0 ? filteredTabs[0].name : '');

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };
  return (
    <div className={`w-100 card ms-2 mt-2`}>
      <div className={`d-flex justify-content-start ms-3 mt-4 ms-1 pb-2`}>
        {filteredTabs.map((tab, index) => (
          <div key={tab.name} className={`d-flex align-items-center`}>
            <div
              className={`${classes.tab} ${activeTab === tab.name ? `${classes.activeTab}` : `${classes.disableTab}`}`}
              onClick={() => handleTabClick(tab.name)}
            >
              {tab.label}
            </div>
            {index < filteredTabs.length - 1 && (
              <div className={`mx-2`}>
                <div className={`${classes.verticalLine}`}></div>
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredTabs.map(tab => activeTab === tab.name && (
        <div key={tab.name}>
          {tab.component}
        </div>
      ))}
    </div>
  );
};

export default WellArchitectedMain;