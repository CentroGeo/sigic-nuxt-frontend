export function useResourcesSupplements() {
  const config = useRuntimeConfig();
  const { gnoxyFetch } = useGnoxyUrl();

  /**
   * Regresa el servidor en el que esta alojado un recurso
   * @param {Object} resource
   * @returns {String}
   */
  function getWMSserver(resource) {
    const wmsObject = resource.links.find((link) => link.link_type === 'OGC:WMS');
    const restObject = resource.links.find((link) => link.url.toLowerCase().includes('arcgis'));
    const link = wmsObject ? wmsObject['url'] : restObject['url'];
    return `${link.split('?')[0]}?`;
  }

  /**
   * Obtiene el servidor que aloja al recurso
   * @param {Object} resource
   * @returns {String}
   */
  function findServer(resource) {
    if (resource.sourcetype === 'REMOTE') {
      return getWMSserver(resource);
    } else {
      return `${config.public.geonodeUrl}/gs/ows`;
    }
  }

  /**
   * Construye la url para solicitar info de un recurso
   * @param {Object} resource
   * @returns {String}
   */
  function buildArcgisLayerRequest(resource) {
    const restObject = resource.links.find((link) => link.url.toLowerCase().includes('arcgis'));
    const link = restObject['url'].split('?')[0];
    const params = restObject['url'].split('?')[1].split('&');
    const layers = params.filter((d) => d.includes('layers'))[0].split('=')[1];
    const decoded = decodeURIComponent(layers);
    const id = decoded.split(':')[1];
    const newUrl = `${link}/${id}/`;
    return newUrl;
  }

  /**
   * Esta funcion revisa si el servidor que aloja un servicio remoto WFS
   * tiene servicios especificos
   * @param {Object} resource Es el recurso del que se desea obtener más informacion
   * @param {String} service Se relaciona con el uso que se le dará a la informacion.
   * Puede ser map, table o geometry
   * @returns {Promise<Boolean>}
   */
  async function hasWFS(resource, service) {
    const maxAttempts = 3;
    const url = new URL(findServer(resource));
    url.search = new URLSearchParams({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetCapabilities',
    });
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(url.toString());
        // Si la petición fracasa
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return false;
          } else {
            continue;
          }
        }
        // Si la petición es exitosa
        const data = await res.text();
        if (data.includes('ExceptionReport')) {
          console.error('No se puede usar el WMS', url, resource.alternate, resource.title);
          return false;
        }
        if (service === 'map') {
          return true;
        } else if (service === 'table' || service === 'geometry') {
          if (data.includes('GetFeature')) {
            return true;
          } else return false;
        } else {
          //console.error('No se reconoce el tipo de petición que se necesita', url);
          return false;
        }
      } catch {
        if (attempt === maxAttempts - 1) {
          return false;
        } else {
          console.error(`fracaso la peticion para ${resource.alternate}`);
        }
      }
    }
  }

  /**
   * Esta funcion revisa si el servidor de arcgis que aloja un servicio remoto
   * permite consultar la tabla de atributos
   * @param {Object} resource
   * @returns {Promise<Boolean>}
   */

  async function hasFeatureServer(resource) {
    let hasFeatureService;
    const url = buildArcgisLayerRequest(resource);
    if (url.includes('ImageServer')) {
      hasFeatureService = false;
    } else {
      const base = url.split('/services/')[0];
      const nameSpace = url.split('/services/')[1].split('/')[0];
      const serviceUrl = `${base}/services/?f=pjson`;
      try {
        const res = await gnoxyFetch(serviceUrl);
        const data = await res.json();
        const linkedServices = data.services.filter((d) => d.name === nameSpace);
        if (linkedServices.map((d) => d.type).includes('FeatureServer')) {
          hasFeatureService = true;
        } else {
          hasFeatureService = false;
        }
      } catch {
        hasFeatureService = false;
      }
    }
    return hasFeatureService;
  }
  /**
   * Consulta al servidor WMS que aloja un recurso remoto o de tipo vectorail para
   * obtener el tipo de geometria del mismo
   * @param {Object} resource
   * @returns {Promise<string>}
   */
  async function fetchGeometryWMS(resource) {
    const maxAttempts = 3;
    const url = new URL(findServer(resource));

    url.search = new URLSearchParams({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: resource.alternate,
      maxFeatures: 1,
      outputFormat: 'application/json',
    });

    // Ahora hacemos una petición get al vínculo statusLocation.
    // Como a veces hace timeout, lo intentamos tres veces
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await gnoxyFetch(url.toString());
        if (!res.ok) {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            continue;
          }
        }
        const data = await res.json();
        if (
          Array.isArray(data.features) &&
          data.features.length > 0 &&
          data.features[0]?.geometry?.type
        ) {
          return data.features[0].geometry.type;
        } else {
          return 'Error';
        }
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
   * Consulta al servidor ArcGis que aloja un recurso remoto o de tipo vectorial para
   * obtener el tipo de geometria del mismo
   * @param {Object} resource
   * @returns {String}
   * @param {*} resource
   * @returns {Promise<String>}
   */
  async function fetchGeometryArcgis(resource) {
    const maxAttempts = 5;
    const url = buildArcgisLayerRequest(resource);

    if (url.includes('ImageServer')) {
      return 'Raster';
    } else {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await gnoxyFetch(`${url}?f=pjson`);
          if (!res.ok) {
            if (attempt === maxAttempts - 1) {
              return 'Error';
            } else {
              continue;
            }
          }
          const json = await res.json();
          const geometry = json.geometryType || 'Error';
          return geometry;
        } catch {
          if (attempt === maxAttempts - 1) {
            return 'Error';
          } else {
            console.warn('Se está intentando una vez más');
          }
        }
      }
    }
  }

  /**
   * Define el tipo de geometría de un archivo de tipo dataset
   * sin importar si es remoto o local, raster o vectoria
   * @param {Object} resource
   * @returns {Promise<string>}
   */
  async function defineGeomType(resource) {
    let geomType;
    if (resource.sourcetype === 'REMOTE') {
      const server = findServer(resource);
      if (!server.toLowerCase().includes('arcgis')) {
        const resourcehasWFS = await hasWFS(resource, 'geometry');
        if (resourcehasWFS) {
          geomType = await fetchGeometryWMS(resource);
        } else {
          geomType = 'Remoto';
        }
      } else {
        geomType = await fetchGeometryArcgis(resource);
      }
    } else if (resource.subtype === 'raster') {
      geomType = 'Raster';
    } else if (resource.subtype === 'vector') {
      geomType = await fetchGeometryWMS(resource);
    } else {
      geomType = 'Otro';
    }
    return geomType;
  }

  /**
   * Hace una petición GetCapabilities y busca en el xml de respuesta
   * para obtener una lista de estilos y un estilo por default
   * para capas que viven en servidores externos
   * @param {Object} resource
   * @returns {Promise<String, Array>}
   */
  async function fetchRemoteStyles(resource) {
    const targetLayerName = resource.alternate;
    const targetLayerStyles = [];
    let targetLayerDefaultStyle = null;
    const server = getWMSserver(resource);

    // Los servicios arcgis no permiten multiples estilos
    if (server.toLowerCase().includes('arcgis')) {
      return { targetLayerDefaultStyle, targetLayerStyles };
    }

    // Los servicios ogc sí lo permiten
    const url = `${server}service=wms&request=getCapabilities`;
    try {
      const request = await gnoxyFetch(url);
      if (!request.ok) {
        return { targetLayerDefaultStyle, targetLayerStyles };
      } else {
        const res = await request.text();
        const parser = new DOMParser();
        const parsedRes = parser.parseFromString(res, 'application/xml');
        const capabilitiesTags = parsedRes.getElementsByTagName('Capability');
        const rootLayers = Array.from(capabilitiesTags[0].children).filter(
          (d) => d.tagName === 'Layer'
        );

        let layers = [];
        for (const layer of rootLayers) {
          const subLayers = Array.from(layer.children).filter((d) => d.tagName === 'Layer');
          layers = [...layers, ...subLayers];
        }
        for (const layer of layers) {
          const nameEl = layer.getElementsByTagName('Name')[0];
          if (nameEl.textContent === targetLayerName) {
            const styleTags = layer.getElementsByTagName('Style');
            for (const style of Array.from(styleTags)) {
              const nameTag = style.getElementsByTagName('Name')[0];
              const name = nameTag.textContent;
              if (!targetLayerStyles.includes(name)) {
                targetLayerStyles.push(name);
              }
            }
            break;
          }
        }

        if (targetLayerStyles.length > 0) {
          targetLayerDefaultStyle = targetLayerStyles[0];
        }
        return { targetLayerDefaultStyle, targetLayerStyles };
      }
    } catch {
      return { targetLayerDefaultStyle, targetLayerStyles };
    }
  }
  /**
   * Obtiene la lista de estilos asociados a un recurso y el estilo por default
   * @param {Object} resource
   * @returns {Promise<String, Array>}
   */
  async function getSLDs(resource) {
    let styleList = [];
    let defaultStyle = null;

    try {
      if (resource.sourcetype !== 'REMOTE') {
        const stylesURL = `${config.public.geonodeApi}/datasets/${resource.pk}/sldstyles/`;
        const stylesRes = await gnoxyFetch(stylesURL);

        if (!stylesRes.ok) {
          //console.error('Falló la petición de estilos de:', resource.title);
          return { defaultStyle, styleList };
        }

        const stylesData = await stylesRes.json();
        defaultStyle = stylesData.default_style;
        stylesData.styles.forEach((d) => {
          const optionList = d.split(':');
          if (optionList.length > 1 && !styleList.includes(optionList[1])) {
            styleList.push(optionList[1]);
          } else if (optionList.length === 1 && !styleList.includes(optionList[0])) {
            styleList.push(optionList[0]);
          }
        });

        if (!styleList.includes(defaultStyle)) {
          styleList.push(defaultStyle);
        }
        return { defaultStyle, styleList };
      } else {
        const { targetLayerDefaultStyle, targetLayerStyles } = await fetchRemoteStyles(resource);
        defaultStyle = targetLayerDefaultStyle;
        styleList = targetLayerStyles;
        return { defaultStyle, styleList };
      }
    } catch {
      //console.error('Falló la petición general de estilos de:', resource.title);
      return { defaultStyle, styleList };
    }
  }

  /**
   * Obtiene un recurso usando su pk
   * @param {*} pk
   * @returns
   */
  async function fetchByPk(pk) {
    const api = `${config.public.geonodeApi}/resources/${pk}`;
    const res = await gnoxyFetch(api);
    const response = await res.json();
    return response.resource;
  }

  /**
   * Esta función recupera información de los harvesters registrados en el sigic
   * @param {Boolean} limited
   * @param {Object} params
   * @returns {Promise<Object>} Objeto que permite construit las tarjetas y tablas de servicios remotos
   */
  async function fetchRemoteServices(params) {
    if (!params.title || params.title.trim().length === 0) {
      delete params.title;
    }

    const dataParams = new URLSearchParams(params);
    const url = `${config.public.geonodeApi}/services/?${dataParams.toString()}`;
    const data = [];
    let status = 'ok';

    try {
      // Obtenemos la información de todos los harvesters
      const requestServices = await gnoxyFetch(url);
      if (!requestServices.ok) {
        const error = await requestServices.json();
        console.error('Falló petición de harvesters:', error);
      }
      const resServices = await requestServices.json();
      const services = [...resServices.results];

      // Creamos el objeto con la información que nos interesa
      await Promise.all(
        services.map(async (h, index) => {
          const harvesterUrl = `${config.public.geonodeApi}/harvesters/${h.harvester_id}`;
          const fetchRemoteServicestatus = await gnoxyFetch(harvesterUrl);
          const resHarvesterStatus = await fetchRemoteServicestatus.json();
          const harvesterStatus = resHarvesterStatus.harvester.status;

          const fetchHarvestableResources = await gnoxyFetch(
            `${harvesterUrl}/harvestable-resources/?page_size=1`
          );
          const resHarvestableResources = await fetchHarvestableResources.json();
          const totalResources = resHarvestableResources.total;

          const harvesterDatasets = `${config.public.geonodeApi}/sigic-remote-datasets/?harvester_id=${h.harvester_id}`;
          const fetchHarvesterDatasets = await gnoxyFetch(harvesterDatasets);
          const dataB = await fetchHarvesterDatasets.json();
          const importedResources = dataB.total;

          data[index] = {
            id: h.harvester_id,
            title: h.title,
            status: harvesterStatus,
            total_resources: totalResources,
            imported_resources: importedResources,
            to_attend_resources: totalResources - importedResources,
            remote_url: h.url,
          };
        })
      );
      status = 'ok';
    } catch (err) {
      console.warn('Error en el streaming: ' + err);
      status = 'error';
    }
    return { status, data };
  }

  /**Esta función regresa una lista con las capas dependiendo de
   * si vienen de un servidor tipo arcgis o ows
   */
  function filteredByServerType(resourcesList, serverType) {
    const serverTypeCollection = [];
    resourcesList.forEach((d) => {
      const server = findServer(d);
      if (serverType === 'arcgis') {
        if (server.includes(serverType)) {
          serverTypeCollection.push(d);
        }
      } else {
        if (!server.toLowerCase().includes('arcgis')) {
          serverTypeCollection.push(d);
        }
      }
    });
    return serverTypeCollection;
  }

  return {
    getWMSserver,
    findServer,
    buildArcgisLayerRequest,
    hasWFS,
    hasFeatureServer,
    fetchGeometryWMS,
    fetchGeometryArcgis,
    defineGeomType,
    fetchRemoteStyles,
    getSLDs,
    fetchByPk,
    fetchRemoteServices,
    filteredByServerType,
  };
}
