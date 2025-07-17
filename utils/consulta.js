export async function fetchGeometryType(resource, api) {
  console.log(resource);
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
    `<p style="max-width:250px">${resource.abstract ? resource.abstract : "Sin descripción"}</p>` +
    `<p>${resource.attribution ? resource.attribution : "Sin fuente"}</p>`;
  return content;
}

export async function downloadDataLayer(selectedElement) {
  console.log("entramos a la funcion");
  let url = undefined;
  selectedElement.links.map((d) => {
    if (d.extension === "json") {
      url = d.url;
    }
  });
  const response = await fetch(url);
  const blob = await response.blob();
  console.log(blob);

  let downloadLink = document.createElement("a");
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = `${selectedElement.title}.geojson`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(downloadLink.href);
}

export function downloadFile(selectedElement) {
  let downloadLink = document.createElement("a");
  downloadLink.href = selectedElement.download_url;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
