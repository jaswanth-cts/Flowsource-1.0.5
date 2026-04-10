import { CatalogClient } from '@backstage/catalog-client';

// Method to fetch the catalog items
export async function getEntities(catalogClient: CatalogClient, token: string){
  const { items } = await catalogClient.getEntities(
    {
      fields: ['metadata.appid', 'metadata.name', 'metadata.annotations'],
      filter: {
        'kind': 'component',
        'spec.type': ['service', 'website'],
      },
    },
    { token }
  );

  const dataItems = items.map((item) => {
    const dataAppid = item.metadata?.appid;
    const dataName = item.metadata?.name;
    const dataAnnotations = item.metadata?.annotations;
    const dataLob = dataAnnotations ? dataAnnotations['flowsource/lob'] : undefined;
    const dataCritical = dataAnnotations ? dataAnnotations['flowsource/is-critical'] : undefined;
   
    return {
      appid:dataAppid,
      app_name:dataName,
      annotations: dataAnnotations,
      lob: dataLob,               // Adding lob key
      is_critical:dataCritical,      // Adding is_critical key
      }

   
  });
  return dataItems;
}
