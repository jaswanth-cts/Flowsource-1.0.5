import React from 'react';

import SnProvisionOrderPage from './ServiceNowRequestComponents/SnProvisionOrderPage';
import SnOrdersPage from './ServiceNowRequestComponents/SnOrdersPage';

import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';


const EnvironmentServiceNowPage = () => {

    const entity = useEntity();
    const configurationItem = entity.entity.metadata.annotations?.['flowsource/servicenow-environment-configuration-item'];

    const isAnnotationValid = (() => {
      return configurationItem !== undefined && configurationItem !== null && configurationItem !== '';
    })();
    
    return (
      <>
      {isAnnotationValid ? (
        <>
          <SnOrdersPage configurationItem={configurationItem} />
          <SnProvisionOrderPage configurationItem={configurationItem} />
        </>
        ) 
        : ( <ServiceNowAnnotationsMissingPage /> )
      }
      </>
    );
};

export default EnvironmentServiceNowPage;

function ServiceNowAnnotationsMissingPage() {

  return (
    <div className="mt-3 ms-2 me-2 mb-3">
      <EntitySwitch>
        <EntitySwitch.Case>
          <EmptyState
            title={"Tasks page is not available for this entity."}
            missing="info"
            description={"Required annotations have to be added to the component if you want to see the Task Tab's Environment page."}
          />
        </EntitySwitch.Case>
      </EntitySwitch>
    </div>
  );

};