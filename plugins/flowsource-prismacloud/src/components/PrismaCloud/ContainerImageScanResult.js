import React, { useEffect, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import ImageScanDetail from './ImageScanDetail';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

const ContainerImageScanResult = () => {

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const [noConfig , setNoConfig] = useState(true);

  const entity = useEntity();
 
let containerImages = entity.entity.metadata.annotations?.["flowsource/prismacloud-container-images"];

let imgsrcs = [];
if(containerImages != null && containerImages != undefined)
  containerImages.split(',').forEach( item => {
  imgsrcs.push(item)
});

useEffect(async () => {
    if( imgsrcs != null && imgsrcs.length > 0){
      setNoConfig(false);
    }
},[]);

return(
  <>
    { !noConfig && imgsrcs.map(item => (
      <ImageScanDetail key={item} imgSource={item} baseUrl={backendUrl} />
    ))}

  { noConfig && <div>No configuraiton found</div>}
  </>
)}




export default ContainerImageScanResult;
