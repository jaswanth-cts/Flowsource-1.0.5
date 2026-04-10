import React from 'react';
import CloudabilityPage from '../CloudabilityCustomPage/CloudabilityPage';
import CloudabilityPageEnv from '../CloudabilityCustomPage/CloudabilityPageEnv';
import { useEntity } from '@backstage/plugin-catalog-react';

export const CloudabilityComponent = () => {
  const entity = useEntity();

  if (entity.entity.kind === 'Component') {
    return <CloudabilityPage />;
  }
  if (entity.entity.kind === 'Environment') {
    return <CloudabilityPageEnv />;
  }
  return null;
};