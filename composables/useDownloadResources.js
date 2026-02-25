import { useResourcesSupplements } from '~/composables/useResourcesSupplements';

export function useDownloadResources() {
  const config = useRuntimeConfig();
  const { gnoxyFetch } = useGnoxyUrl();
  const { findServer } = useResourcesSupplements();

  /**
   * Crea una url autenticada que permite visualizar documentos
   * @param {String} url
   * @returns {Promise<string>}
   */
  async function fetchDoc(url) {
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(url);
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            continue;
          }
        }
        const blob = await res.blob();
        const newUrl = URL.createObjectURL(blob);
        return newUrl;
      } catch {
        if (attempt === maxAttempts - 1) {
          return 'Error';
        } else {
          console.warn('Se está intentando una vez más');
        }
      }
    }
  }

  /**
   * Identifica el link indicado, hace una petición autenticada y genera un nuevo link
   * para descargar un archivo pdf o txt
   * @param {Object} resource
   */
  async function downloadDocs(resource) {
    const maxAttempts = 5;
    const extension = resource.links?.find((link) => link.link_type === 'uploaded').extension;
    const url = resource.download_url.replace('/download', '/link');
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(url);
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            continue;
          }
        }
        const blob = await res.blob();
        const newUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = newUrl;
        anchor.download = `${resource.title.replace('.pdf', '').replace('.txt', '')}.${extension}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(newUrl);
        return 'Ok';
      } catch {
        if (attempt === maxAttempts - 1) {
          return 'Error';
        } else {
          console.warn(`Falló el intento ${attempt + 1}.`);
        }
      }
    }
  }

  /**
   * Crea un link de para descargar los metadatos de un recurso
   * @param {Object} resource
   * @returns {Promise<string>}
   */
  async function downloadMetadata(resource) {
    const maxAttempts = 5;
    const api = new URL(`${config.public.geonodeUrl}/catalogue/csw`);
    api.search = new URLSearchParams({
      request: 'GetRecordById',
      service: 'CSW',
      version: '2.0.2',
      id: resource.uuid,
      outputschema: 'http://www.isotc211.org/2005/gmd',
      elementsetname: 'full',
    }).toString();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(api.toString());
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            console.warn(`Falló el intento ${attempt + 1}.`);
          }
        }
        const dataBlob = await res.blob();
        const blobLink = URL.createObjectURL(dataBlob);
        const anchor = document.createElement('a');
        anchor.href = blobLink;
        anchor.style.display = 'none';
        anchor.download = `${resource.title}_metadata.xml`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(blobLink);
        return 'Ok';
      } catch {
        if (attempt === maxAttempts - 1) {
          return 'Error';
        } else {
          console.warn(`Falló el intento ${attempt + 1}.`);
        }
      }
    }
  }

  /**
   * Descarga archivos por medio de peticiones (autenticadas o no) de servicios WMS.
   * La descarga puede ser en los formatos: xls, xlsx, gpkg, geojson, csv y kml).
   * Tambien permite especificar si se quiere que el archivo descargado incluya o no
   * la geometria
   * @param {Object} resource
   * @param {String} format
   * @param {Stringy} featureTypes
   */
  async function downloadWMS(resource, format, featureTypes) {
    const maxAttempts = 3;
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
    const url = new URL(`${config.public.geonodeUrl}/gs/ows`);
    url.search = new URLSearchParams(params).toString();
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(`${url}`);
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            console.warn(`Falló el intento ${attempt + 1}.`);
          }
        }
        const blob = await res.blob();
        const anchor = document.createElement('a');
        const downloadUrl = URL.createObjectURL(blob);
        anchor.href = downloadUrl;
        anchor.style.display = 'none';
        anchor.download = `${resource.title}.${format}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(downloadUrl);
        return 'Ok';
      } catch {
        if (attempt === maxAttempts - 1) {
          return 'Error';
        } else {
          console.warn(`Falló el intento ${attempt + 1}.`);
        }
      }
    }
  }

  /**
   * Hace una petición WFS para obtener la lista de Features y excluir la geometría.
   * Las peticiones pueden ser autenticadas o no.
   * @param {Object} resource
   * @param {String} format
   * @returns {Promise<Array>}
   */
  async function getFeatures(resource) {
    const maxAttempts = 3;
    const describeFeatureUrl = new URL(findServer(resource));
    // Revisamos sus columnas para excluir las de geometria
    describeFeatureUrl.search = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'DescribeFeatureType',
      typeName: resource.alternate,
      outputFormat: 'application/json',
    }).toString();
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(describeFeatureUrl.toString());
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            console.error(`getFeatures falló: ${res.status}`);
          }
        }
        const fileData = await res.json();
        const features = fileData.featureTypes[0]['properties'];
        const props = features
          .filter(
            (prop) => prop.name.toLowerCase() !== 'geometry' && prop.name.toLowerCase() !== 'geom'
          )
          .map((prop) => prop.name);
        return props;
      } catch {
        if (attempt === maxAttempts - 1) {
          return 'Error';
        } else {
          console.warn(`Falló el intento ${attempt + 1}.`);
        }
      }
    }
  }

  /**
   * Hace la descarga de los archivos sin geometría.
   * Las peticiones pueden ser autenticadas o no.
   * @param {Object} resource
   * @param {String} format
   * @returns {Promise<string>}
   */

  async function downloadNoGeometry(resource, format) {
    const props = await getFeatures(resource);
    const downloadStatus = downloadWMS(resource, format, props.join());
    return downloadStatus;
  }

  /**
   * Hace una petición para descargar una capa tipo raster en formato geotiff
   * @param {Object} resource
   */
  async function downloadRaster(resource) {
    const maxAttempts = 3;
    let error = 'Error';
    const url = `${config.public.geonodeUrl}/datasets/${resource.alternate}/dataset_download`;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(url.toString());
        if (!res.ok) {
          const errorData = await res.text();
          if (errorData.includes('Download Limits Exceeded')) {
            error = 'DownloadLimitsExceeded';
          } else {
            error = 'Error';
          }
          return error;
        }
        const blob = await res.blob();
        const anchor = document.createElement('a');
        const downloadUrl = URL.createObjectURL(blob);
        anchor.href = downloadUrl;
        anchor.download = `${resource.title}.tiff`;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(downloadUrl);
        return 'Ok';
      } catch {
        console.warn(`Falló el intento ${attempt + 1}.`);
      }
    }
    console.error(`La descarga fracasó después de ${maxAttempts} intentos`);
    return error;
  }

  return {
    fetchDoc,
    downloadDocs,
    downloadMetadata,
    downloadWMS,
    getFeatures,
    downloadNoGeometry,
    downloadRaster,
  };
}
