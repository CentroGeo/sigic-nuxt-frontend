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
