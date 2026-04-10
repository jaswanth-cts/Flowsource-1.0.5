import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

const DashboardPage = () => {
  const config = useApi(configApiRef);

  const dashboardUrl = config.getOptionalString('dashboard.baseUrl');

  return (
    <Card>
      <CardContent>
        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
          }}
        >
          {dashboardUrl ? (
            <iframe
              src={dashboardUrl}
              title="Dashboard"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            ></iframe>
          ) : (
            <div>This plugin has not been configured with the required values. Please ask your administrator to configure it</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
