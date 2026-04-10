import {
  PageWithHeader,
  Content,
  ContentHeader,
  SupportButton,
 CreateButton} from '@backstage/core-components';
import { CatalogTable } from '@backstage/plugin-catalog';
import {
  EntityListProvider,
  CatalogFilterLayout,
  EntityKindPicker,
  EntityLifecyclePicker,
  EntityNamespacePicker,
  EntityOwnerPicker,
  EntityProcessingStatusPicker,
  EntityTagPicker,
  EntityTypePicker,
  UserListPicker,
} from '@backstage/plugin-catalog-react';
import { UnifiedThemeProvider } from '@backstage/theme';
import React from 'react';

import { FlowsourceHomeTheme } from './FlowsourceHomeThemeCss';

import { usePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import awsLogo from './icons/awsLogo.png';
import gcpLogo from './icons/gcpLogo.png';
import azureLogo from './icons/azureLogo.png';

const getCloudProviderIcon = (provider: any) => {
  const normalizedProvider = provider.toLowerCase();
  switch (normalizedProvider) {
    case 'aws':
      return awsLogo;
    case 'gcp':
      return gcpLogo;
    case 'azure':
      return azureLogo;
    default:
      return null;
  }
};

export const FlowsourceHome = () => {

  const customTablePagination = {
    paging: true,
    emptyRowsWhenPaging: false,
    pageSize: 15,
    pageSizeOptions: [15, 30, 60]
  };

  // const orgName = useApi(configApiRef).getOptionalString('organization.name') ?? 'Backstage';

  const { allowed } = usePermission({
    permission: catalogEntityCreatePermission,
  });

  const myColumnsFunc = (entityListContext: any) => {
    return [
      ...CatalogTable.defaultColumnsFunc(entityListContext), // Default columns
      {
        title: '', // Empty title for the icon column
        field: 'icon',
        sorting: false,
        filtering: false,
        width: '1%',
        render: (rowData: { entity: { metadata: { annotations?: Record<string, string> } } }) => {
            const cloudProvider = rowData.entity.metadata?.annotations?.['flowsource/cloud-provider'] || '';
          const icon = getCloudProviderIcon(cloudProvider);
          return (
            <div 
            style={{ position: 'relative', height: '100%' }}
            >
              {icon !== null ? (
                <img
                  src={icon}
                  alt={`cloud-provider-${cloudProvider}`}
                  style={{
                    position: 'absolute',
                    bottom: '11.3rem',  // Adjust position as needed
                    right: '0px',
                    width: '25px',  // You can change this to fit your design
                    height: '21px', // Adjust icon size
                  }}
                />
              ) : (
                ""
              )}
            </div>
          );
        },
      },
    ];
  };

  

  return (
    <UnifiedThemeProvider theme={FlowsourceHomeTheme}>
      <PageWithHeader title={"Catalog"} themeId="home">
        <Content>
          <ContentHeader title="">
            {allowed && (
              <CreateButton
                title={"Create"}
                to={"/create"}
              />
            )}
            <SupportButton>All your software catalog entities</SupportButton>
          </ContentHeader>
          <EntityListProvider>
            <CatalogFilterLayout>
              <CatalogFilterLayout.Filters>
                <EntityKindPicker />
                <EntityTypePicker />
                <UserListPicker />
                <EntityOwnerPicker />
                <EntityLifecyclePicker />
                <EntityTagPicker />
                <EntityProcessingStatusPicker />
                <EntityNamespacePicker />
              </CatalogFilterLayout.Filters>
              <CatalogFilterLayout.Content>
                <CatalogTable 
                 columns={myColumnsFunc} // Custom columns function
                tableOptions = { customTablePagination }/>
              </CatalogFilterLayout.Content>
            </CatalogFilterLayout>
          </EntityListProvider>
        </Content>
      </PageWithHeader>
    </UnifiedThemeProvider>
  );
};