export async function fetchGeometryType(resource, api) {
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
  const data = await res.json();
  const geomType = data.features[0]["geometry"]["type"];
  return geomType;
}

export function tooltipContent(resource) {
  const content =
    `<p style="max-width:250px">${
      resource.abstract ? resource.abstract : "Sin descripción"
    }</p>` +
    `<p>${resource.attribution ? resource.attribution : "Sin fuente"}</p>`;
  return content;
}

export function downloadDataTable(resource) {
  console.log("se descargará: ", resource.title);
  return "https://geonode.dev.geoint.mx/#/";
}

export async function downloadVectorData(resource, format) {
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
    `https://geonode.dev.geoint.mx/geoserver/ows?service=WPS&version=1.0.0&REQUEST=Execute`,
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
  //console.log("La primer respuesta: ", permissionRestult);

  // Hacemos la segunda peticion, que también regresará un xml del que nos interesa el status location
  const statusRequest = await fetch(
    `https://geonode.dev.geoint.mx/geoserver/ows?service=WPS&version=1.0.0&REQUEST=Execute`,
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
  //console.log("segunda respuesta: ", statusResult);
  // Como nos regresa un xml, hay que parsearlo
  const parser = new DOMParser();
  const parsedStatusResult = parser.parseFromString(statusResult, "text/xml");
  //console.log(parsedStatusResult);
  const executeResponseHTML = parsedStatusResult.getElementsByTagName(
    "wps:ExecuteResponse"
  )[0];
  //.log("seccion del html de nuestro interes", executeResponseHTML);
  const linkStatusLocation =
    executeResponseHTML?.getAttribute("statusLocation");
  //console.log("statuts response link: ", linkStatusLocation);

  // Ahora hacemos una petición get al vínculo statusLocation.
  // Como a veces hace timeout, lo intentamos tres veces
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    //console.log(attempt);
    const downloadRequest = await fetch(linkStatusLocation);
    const downloadResult = await downloadRequest.text();
    if (downloadResult.includes("Process succeeded")) {
      console.log("se logró en el intento numero ", attempt);
      //console.log("tercer respuesta: ", downloadResult);
      const parser2 = new DOMParser();
      const parsedDownloadResult = parser2.parseFromString(
        downloadResult,
        "text/xml"
      );
      //console.log("get request parsed xml: ", parsedDownloadResult);
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
  //console.log("downloadLink", downloadLink);

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
    //console.log(blob);
    const blobLink = URL.createObjectURL(blob);
    downloadLink = blobLink;
  }
  let anchor = document.createElement("a");
  anchor.href = downloadLink;
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
