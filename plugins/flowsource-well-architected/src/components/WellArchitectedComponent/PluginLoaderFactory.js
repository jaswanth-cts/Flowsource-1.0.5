import React, { lazy, Suspense } from 'react';
import PluginNotAvailable from './PluginNotAvailable';
import log from 'loglevel';

// Function to load components dynamically with error handling
const loadComponent = (pluginName, fileName, componentName) => {
  return lazy(() =>
    import(`@flowsource/plugin-flowsource-${pluginName}/src/components/${fileName}/${componentName}.js`).then(
      module => {
        return { default: module.default };
      },
      error => {
        log.error(`Error loading ${componentName}:`, error);
        return { default: () => <PluginNotAvailable pluginName={fileName} /> };
      }
    )
  );
};

// Factory function to return the appropriate component based on the plugin name
const PluginFactory = (pluginName) => {
  switch (pluginName) {
    case 'AWS Resilience Hub':
      return loadComponent('resilience-hub', 'ResilienceHub', 'ResilienceHub');
    case 'AWS Fault Injection':
      return loadComponent('aws-fault-injection', 'AwsFaultInjection', 'AwsFaultInjectionMain');
    case 'Resilience4j':
      return loadComponent('resilience4j', 'Resilience4jPage', 'Resilience4j');
    case 'Datadog':
      return loadComponent('datadog', 'Datadog', 'DatadogComponentsMain');
    case 'Dynatrace':
      return loadComponent('dynatrace', 'Dynatrace', 'DynatraceComponentsMain');
    case 'AppDynamics':
      return loadComponent('appdynamics', 'AppDynamics', 'AppDynamicsMain');
    case 'SAST':
      return loadComponent('checkmarx', 'Checkmarx', 'CheckmarxMain');
    case 'Veracode Scan':
      return loadComponent('veracode', 'Veracode', 'VeracodeMain');
    case 'Blackduck Scan':
      return loadComponent('blackduck', 'Blackduck', 'BlackduckMain');
    case 'SCA':
      return loadComponent('prismacloud', 'PrismaCloud', 'PrismaCloudMain');
    case 'Infra Code Scan':
      return loadComponent('prismacloud', 'PrismaCloud', 'PrismaCloudMain');
    case 'Prisma Image Scan':
      return loadComponent('prismacloud', 'PrismaCloud', 'ContainerImageScanResult');
    case 'Prisma Defender Host Scan':
      return loadComponent('prismacloud', 'PrismaCloud', 'HostScanResult');
    case 'Prisma Defender Container Scan':
      return loadComponent('prismacloud', 'PrismaCloud', 'ContainerScanResult');
    case 'DevopsGuru':
      return loadComponent('devops-guru', 'DevOpsGuru', 'DevopsGuru');
    default:
      return null;
  }
};

// PluginLoaderFactory component to dynamically load plugins with a fallback UI
const PluginLoaderFactory = ({ pluginName }) => {
  const Component = PluginFactory(pluginName);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {Component ? <Component /> : <PluginNotAvailable pluginName={pluginName} />}
    </Suspense>
  );
};

export default PluginLoaderFactory;