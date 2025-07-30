import { useSelectedResourcesStore } from "@/stores/selectedResources.js";
export function tooltipContent(resource) {
  const content =
    `<p style="max-width:200px">${
      resource.abstract ? resource.abstract : "Sin descripción"
    }</p>` +
    `<p style="max-width:200px">${
      resource.attribution ? resource.attribution : "Sin fuente"
    }</p>`;
  return content;
}

export async function fetchGeometryType(resource) {
  const config = useRuntimeConfig();
  const api = config.public.geoserverUrl;
  const url = new URL(`${api}/ows`);
  url.search = new URLSearchParams({
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: resource.alternate,
    maxFeatures: 1,
    outputFormat: "application/json",
  }).toString();

  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    const geomType = data.features[0]["geometry"]["type"];
    return geomType;
  } else {
    return "Error";
  }
}

export async function wait(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

export function downloadPDF(resource) {
  let anchor = document.createElement("a");
  anchor.href = resource.download_url;
  anchor.download = `${resource.title}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadMetadata(resource) {
  const config = useRuntimeConfig();
  const api = new URL(`${config.public.geonodeUrl}/catalogue/csw`);
  api.search = new URLSearchParams({
    request: "GetRecordById",
    service: "CSW",
    version: "2.0.2",
    id: resource.uuid,
    outputschema: "http://www.isotc211.org/2005/gmd",
    elementsetname: "full",
  }).toString();

  const res = await fetch(api);
  const dataBlob = await res.blob();
  const blobLink = URL.createObjectURL(dataBlob);
  let anchor = document.createElement("a");
  anchor.href = blobLink;
  anchor.download = `${resource.title}_metadata.xml`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobLink);
}

export async function downloadExcel(resource, format) {
  const config = useRuntimeConfig();
  const formatDict = {
    xls: "excel",
    xlsx: "excel2007",
  };
  const url = new URL(`${config.public.geoserverUrl}/ows`);
  url.search = new URLSearchParams({
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: resource.alternate,
    outputFormat: formatDict[format],
  }).toString();

  console.log(url);
  let anchor = document.createElement("a");
  anchor.href = url;
  anchor.taget = "_blank";
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadVectorData(resource, format) {
  const config = useRuntimeConfig();
  let downloadLink = null;
  const maxRetries = 3;
  const delay = 1000;
  const formatDict = {
    gpkg: "application/geopackage+sqlite3",
    geojson: "application/json",
    csv: "text/csv",
    kml: "application/vnd.google-earth.kml+xml",
  };
  let permissionRequest = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" 
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

  let request2 = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" 
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
      method: "POST",
      body: permissionRequest,
    }
  );

  // Revisamos el status de la primera peticion
  if (!fetchpermissionRequest.ok) {
    console.error("No se concedieron permisos");
    return;
  }
  const permissionRestult = await fetchpermissionRequest.text();
  //console.log("La primer respuesta, el permiso: ", permissionRestult);

  // Hacemos la segunda peticion, que también regresará un xml del que nos interesa el status location
  const statusRequest = await fetch(
    `${config.public.geoserverUrl}/ows?service=WPS&version=1.0.0&REQUEST=Execute`,
    {
      method: "POST",
      body: request2,
    }
  );
  // Revisamos el status de la segunda peticion
  if (!statusRequest.ok) {
    console.error("Falló la petición del link para la descarga");
    return;
  }
  const statusResult = await statusRequest.text();
  //console.log("La segunda petición, la del status: ", statusResult);
  // Como nos regresa un xml, hay que parsearlo
  const parser = new DOMParser();
  const parsedStatusResult = parser.parseFromString(statusResult, "text/xml");
  const executeResponseHTML = parsedStatusResult.getElementsByTagName(
    "wps:ExecuteResponse"
  )[0];
  const linkStatusLocation =
    executeResponseHTML?.getAttribute("statusLocation");

  // Ahora hacemos una petición get al vínculo statusLocation.
  // Como a veces hace timeout, lo intentamos tres veces
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const downloadRequest = await fetch(linkStatusLocation);
    const downloadResult = await downloadRequest.text();
    if (downloadResult.includes("Process succeeded")) {
      console.log("se logró en el intento numero ", attempt);
      const parser2 = new DOMParser();
      const parsedDownloadResult = parser2.parseFromString(
        downloadResult,
        "text/xml"
      );
      let downloadHTML =
        parsedDownloadResult.getElementsByTagName("wps:Reference")[0];
      downloadLink = downloadHTML?.getAttribute("href");
      attempt = maxRetries;
    } else {
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  if (!downloadLink) {
    console.log("Falló la descarga");
    return;
  }

  // Si es un Json vamos a tener que forzar la descarga
  if (format === "geojson") {
    const jsonRequest = await fetch(downloadLink);
    if (!jsonRequest.ok) {
      console.log("Falló el forzar la descarga del json");
      return;
    }
    const jsonResponse = await jsonRequest.json();
    const blob = new Blob([JSON.stringify(jsonResponse)], {
      type: "application/json",
    });
    const blobLink = URL.createObjectURL(blob);
    downloadLink = blobLink;
  }
  let anchor = document.createElement("a");
  anchor.href = downloadLink;
  anchor.taget = "_blank";
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function setUrlDocs(resources, resourceType) {
  const resourcesStore = useSelectedResourcesStore();
  console.log("Se cambió la url: ", resources);
  const router = useRouter();
  const route = useRoute();
  let params = [];
  let indicator = null;
  if (resourceType === "dataTable") {
    indicator = "alternate";
  } else {
    indicator = "title";
  }
  params = resources.map((resource) => {
    let isSelected = 0;
    if (resource.uuid === resourcesStore.shownFiles[resourceType].uuid) {
      isSelected = 1;
    } else {
      isSelected = 0;
    }
    return `${resource[indicator]},${isSelected}`;
  });

  const paramsString = params.join(";");
  await router.push({
    path: route.path,
    query: {
      recursos: paramsString,
    },
  });
}
export function setDocView(resourceType, resources, paramsArray) {
  const resourcesStore = useSelectedResourcesStore();
  const attrDict = {
    document: "title",
    dataTable: "alternate",
  };

  for (let i = paramsArray.length - 1; i >= 0; i--) {
    let vals = paramsArray[i].split(",");
    resources.forEach((d) => {
      if (d[attrDict[resourceType]] === vals[0]) {
        resourcesStore.addResource(resourceType, d);
        if (vals[1] === "1") {
          resourcesStore.setShownFile(resourceType, d);
        }
      }
    });
  }
}
export async function setUrlLayers(resources) {
  console.log("Se cambió la url: ", resources);
  const router = useRouter();
  const route = useRoute();
  let params = [];
  let indicator = "alternate";
  params = resources.map((resource) => {
    return `${resource[indicator]}`;
  });

  const paramsString = params.join(";");
  await router.push({
    path: route.path,
    query: {
      recursos: paramsString,
    },
  });
}
export function setMapView(resourceType, resources, paramsArray) {
  const resourcesStore = useSelectedResourcesStore();

  for (let i = paramsArray.length - 1; i >= 0; i--) {
    resources.forEach((d) => {
      if (d.alternate === paramsArray[i]) {
        resourcesStore.addResource(resourceType, d);
      }
    });
  }
}
