export const resourceTypeDic = {
  dataLayer: 'dataLayer',
  dataTable: 'dataTable',
  document: 'document',
};

export const resourceTypeGeonode = {
  [resourceTypeDic.dataLayer]: 'dataset',
  [resourceTypeDic.dataTable]: 'dataset',
  [resourceTypeDic.document]: 'document',
};

export function cleanInput(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function tooltipContent(resource) {
  let formatedAbstract = 'Sin descripción';
  if (resource.abstract) {
    formatedAbstract = resource.abstract
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
      .replace(/^<pre>/, '')
      .replace(/<\/pre>$/, '');
  }
  const content =
    `<p style="max-width:250px">${formatedAbstract}</p>` +
    `<p style="max-width:250px">${resource.attribution || 'Sin fuente'}</p>`;
  return content;
}

export async function fetchGeometryType(resource) {
  const config = useRuntimeConfig();
  const api = config.public.geoserverUrl;
  const url = new URL(`${api}/ows`);
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    //typeName: 'sob_alim:glifo_sup_sembrada_herbicida_07_mun_a',
    typeName: resource.alternate,
    maxFeatures: 1,
    outputFormat: 'application/json',
  }).toString();

  const res = await fetch(url);
  if (!res.ok) {
    return 'Error';
  }
  try {
    const data = await res.json();
    if (
      Array.isArray(data.features) &&
      data.features.length > 0 &&
      data.features[0]?.geometry?.type
    ) {
      return data.features[0].geometry.type;
    }

    return 'Error';
  } catch {
    return 'Remoto';
  }
}

export async function wait(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

export function downloadDocs(resource) {
  const extension = resource.links?.find((link) => link.link_type === 'uploaded').extension;
  const anchor = document.createElement('a');
  anchor.href = resource.download_url;
  anchor.download = `${resource.title}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadMetadata(resource) {
  const config = useRuntimeConfig();
  const api = new URL(`${config.public.geonodeUrl}/catalogue/csw`);
  api.search = new URLSearchParams({
    request: 'GetRecordById',
    service: 'CSW',
    version: '2.0.2',
    id: resource.uuid,
    outputschema: 'http://www.isotc211.org/2005/gmd',
    elementsetname: 'full',
  }).toString();

  const res = await fetch(api);
  const dataBlob = await res.blob();
  const blobLink = URL.createObjectURL(dataBlob);
  const anchor = document.createElement('a');
  anchor.href = blobLink;
  anchor.download = `${resource.title}_metadata.xml`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobLink);
}

export async function downloadWMS(resource, format, featureTypes) {
  const config = useRuntimeConfig();
  const formatDict = {
    xls: 'excel',
    xlsx: 'excel2007',
    gpkg: 'application/x-gpkg',
    geojson: 'application/json',
    csv: 'csv',
    kml: 'application/vnd.google-earth.kml+xml',
  };
  let params;
  if (featureTypes !== 'all') {
    params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: resource.alternate,
      outputFormat: formatDict[format],
      propertyName: featureTypes,
    };
  } else {
    params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: resource.alternate,
      outputFormat: formatDict[format],
    };
  }

  let url = new URL(`${config.public.geoserverUrl}/ows`);
  url.search = new URLSearchParams(params).toString();
  // Si es un Json vamos a tener que forzar la descarga
  if (format === 'geojson') {
    const jsonRequest = await fetch(url);
    if (!jsonRequest.ok) {
      console.error('Falló el forzar la descarga del json');
      return;
    }
    const jsonResponse = await jsonRequest.json();
    const blob = new Blob([JSON.stringify(jsonResponse)], {
      type: 'application/json',
    });
    const blobLink = URL.createObjectURL(blob);
    url = blobLink;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadNoGeometry(resource, format) {
  const config = useRuntimeConfig();
  // Revisamos si la capa es remota
  if (resource.subtype === 'remote') {
    alert('Esta capa es remota y no se puede descargar');
    return;
  }
  // Si la capa no es remota, revisamos sus columnas para excluir las de geometria
  const describeFeatureUrl = new URL(`${config.public.geoserverUrl}/ows`);
  describeFeatureUrl.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'DescribeFeatureType',
    typeName: resource.alternate,
    outputFormat: 'application/json',
  }).toString();

  const res = await fetch(describeFeatureUrl);
  if (!res.ok) {
    return 'Error';
  }
  const data = await res.json();
  const features = data.featureTypes[0]['properties'];
  const props = features
    .filter((prop) => prop.name.toLowerCase() !== 'geometry')
    .map((prop) => prop.name);
  // Llamamos la función de descarga
  downloadWMS(resource, format, props.join());
}

export async function downloadVectorData(resource, format) {
  const config = useRuntimeConfig();
  let downloadLink = null;
  const maxRetries = 3;
  const delay = 1000;
  const formatDict = {
    gpkg: 'application/geopackage+sqlite3',
    geojson: 'application/json',
    csv: 'text/csv',
    kml: 'application/vnd.google-earth.kml+xml',
  };
  const permissionRequestTemplate = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xmlns="http://www.opengis.net/wps/1.0.0" 
  xmlns:wfs="http://www.opengis.net/wfs" 
  xmlns:wps="http://www.opengis.net/wps/1.0.0" 
  xmlns:ows="http://www.opengis.net/ows/1.1" 
  xmlns:gml="http://www.opengis.net/gml" 
  xmlns:ogc="http://www.opengis.net/ogc" 
  xmlns:wcs="http://www.opengis.net/wcs/1.1.1" 
  xmlns:dwn="http://geoserver.org/wps/download" 
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>gs:DownloadEstimator</ows:Identifier>
  <wps:DataInputs><wps:Input><ows:Identifier>layerName</ows:Identifier><wps:Data>
  <wps:LiteralData>${resource.alternate}</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs></wps:Execute>`;

  const request2 = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xmlns="http://www.opengis.net/wps/1.0.0" 
  xmlns:wfs="http://www.opengis.net/wfs" 
  xmlns:wps="http://www.opengis.net/wps/1.0.0" 
  xmlns:ows="http://www.opengis.net/ows/1.1" 
  xmlns:gml="http://www.opengis.net/gml" 
  xmlns:ogc="http://www.opengis.net/ogc" 
  xmlns:wcs="http://www.opengis.net/wcs/1.1.1" 
  xmlns:dwn="http://geoserver.org/wps/download" 
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>gs:Download</ows:Identifier>
  <wps:DataInputs><wps:Input><ows:Identifier>layerName</ows:Identifier>
  <wps:Data><wps:LiteralData>${resource.alternate}</wps:LiteralData>
  </wps:Data></wps:Input><wps:Input>
  <ows:Identifier>outputFormat</ows:Identifier>
  <wps:Data><wps:LiteralData>${formatDict[format]}</wps:LiteralData></wps:Data></wps:Input>
  <wps:Input><ows:Identifier>cropToROI</ows:Identifier><wps:Data><wps:LiteralData>false</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs>
  <wps:ResponseForm><wps:ResponseDocument storeExecuteResponse="true" status="true">
  <wps:Output mimeType="${formatDict[format]}" asReference="true">
  <ows:Identifier>result</ows:Identifier></wps:Output></wps:ResponseDocument></wps:ResponseForm></wps:Execute>`;

  // Pedimos permiso para hacer la descarga
  const fetchpermissionRequest = await fetch(
    `${config.public.geoserverUrl}/ows?service=WPS&version=1.0.0&REQUEST=Execute`,
    {
      method: 'POST',
      body: permissionRequestTemplate,
    }
  );

  // Revisamos el status de la primera peticion
  if (!fetchpermissionRequest.ok) {
    console.error('No se concedieron permisos');
    return;
  }
  // // const permissionRestult = await fetchpermissionRequest.text();
  //console.log("La primer respuesta, el permiso: ", permissionRestult);

  // Hacemos la segunda peticion, que también regresará un xml del que nos interesa el status location
  const statusRequest = await fetch(
    `${config.public.geoserverUrl}/ows?service=WPS&version=1.0.0&REQUEST=Execute`,
    {
      method: 'POST',
      body: request2,
    }
  );
  // Revisamos el status de la segunda peticion
  if (!statusRequest.ok) {
    console.error('Falló la petición del link para la descarga');
    return;
  }
  const statusResult = await statusRequest.text();
  //console.log("La segunda petición, la del status: ", statusResult);
  // Como nos regresa un xml, hay que parsearlo
  const parser = new DOMParser();
  const parsedStatusResult = parser.parseFromString(statusResult, 'text/xml');
  const executeResponseHTML = parsedStatusResult.getElementsByTagName('wps:ExecuteResponse')[0];
  const linkStatusLocation = executeResponseHTML?.getAttribute('statusLocation');

  // Ahora hacemos una petición get al vínculo statusLocation.
  // Como a veces hace timeout, lo intentamos tres veces
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const downloadRequest = await fetch(linkStatusLocation);
    const downloadResult = await downloadRequest.text();
    if (downloadResult.includes('Process succeeded')) {
      console.warn('succeeded on attempt number ', attempt);
      const parser2 = new DOMParser();
      const parsedDownloadResult = parser2.parseFromString(downloadResult, 'text/xml');
      const downloadHTML = parsedDownloadResult.getElementsByTagName('wps:Reference')[0];
      downloadLink = downloadHTML?.getAttribute('href');
      attempt = maxRetries;
    } else {
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  if (!downloadLink) {
    console.error('Falló la descarga');
    return;
  }

  // Si es un Json vamos a tener que forzar la descarga
  if (format === 'geojson') {
    const jsonRequest = await fetch(downloadLink);
    if (!jsonRequest.ok) {
      console.error('Falló el forzar la descarga del json');
      return;
    }
    const jsonResponse = await jsonRequest.json();
    const blob = new Blob([JSON.stringify(jsonResponse)], {
      type: 'application/json',
    });
    const blobLink = URL.createObjectURL(blob);
    downloadLink = blobLink;
  }
  const anchor = document.createElement('a');
  anchor.href = downloadLink;
  anchor.target = '_blank';
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
