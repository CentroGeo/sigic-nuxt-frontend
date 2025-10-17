import { defineStore } from 'pinia';
import { buildUrl, hasWMS, resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

export const useResourcesCatalogoStore = defineStore('resourcesCatalogo', () => {
  const config = useRuntimeConfig();
  const storeConsulta = useConsultaStore();
  const { data } = useAuth();
  const userEmail = data.value?.user.email;
  //const userName = userEmail?.split('@')[0];
  /**
   * Almacenamiento reactivo de los recursos seleccionados.
   */
  const totals = reactive({
    [resourceTypeDic.dataLayer]: 0,
    [resourceTypeDic.dataTable]: 0,
    [resourceTypeDic.document]: 0,
  });
  const myTotalsByType = reactive({
    [resourceTypeDic.dataLayer]: 0,
    [resourceTypeDic.dataTable]: 0,
    [resourceTypeDic.document]: 0,
  });
  const totalMisArchivos = reactive({
    disponibles: 0,
    pendientes: 0,
    publicacion: 0,
  });

  const resourcesByType2 = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });
  const resources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });
  const myResourcesByType = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });
  const latestResources = reactive({
    [resourceTypeDic.dataLayer]: undefined,
    [resourceTypeDic.dataTable]: undefined,
    [resourceTypeDic.document]: undefined,
  });
  const misArchivos = reactive({
    disponibles: [],
    pendientes: [],
    publicacion: [],
  });
  return {
    isLoading: ref(false),
    totals,
    myTotalsByType,
    resources,
    resourcesByType2,
    myResourcesByType,
    latestResources,
    misArchivos,
    totalMisArchivos,

    mineBySection(section) {
      return misArchivos[section];
    },
    totalByType(resourceType = storeConsulta.resourceType) {
      return totals[resourceType];
    },

    myTotalBySection(section) {
      return totalMisArchivos[section];
    },

    latestByType(resourceType = storeConsulta.resourceType) {
      return latestResources[resourceType];
    },

    resetByType(resourceType = storeConsulta.resourceType) {
      resources[resourceType] = [];
    },
    resetBySection(section) {
      misArchivos[section] = [];
    },
    resourcesByType(resourceType = storeConsulta.resourceType) {
      return resources[resourceType];
    },
    /**
     * Trae el total los recursos vinculados a un usuario (yo), por tipo de recurso
     * Esto se usa para georreferenciación
     * @param {String} resourceType
     */
    async getMyTotalResources(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page_size: 1,
        'filter{owner.username}': userEmail,
      };
      if (resourceType === 'dataLayer') {
        queryParams['filter{has_geometry}'] = 'true';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector', 'remote'];
      }
      if (resourceType === 'document') {
        queryParams['filter{extension}'] = ['pdf', 'txt'];
      }
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      myTotalsByType[resourceType] = res.total;
      this.isLoading = false;
    },

    /**
     * Obtiene el total de los recursos asociados a un usuario (yo), según si tienen metadatos o no
     * Esto se usa en catalogo/misRecursos
     * @param {String} section
     * @param {Array} query
     */
    async getMyTotal(section, query) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        ...query,
        page_size: 1,
        'filter{owner.username}': userEmail,
      };
      // Agregar toda la lógica de queryparams correspondientes por sección
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      totalMisArchivos[section] = res.total;
      this.isLoading = false;
    },

    /**Hace una petición de solo 1 recurso para obtener el total de recursos y el último recurso */
    async getTotalResources(resourceType = storeConsulta.resourceType, query) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        'sort[]': '-last_updated',
        page_size: 1,
        ...query,
      };
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      totals[resourceType] = res.total;
      latestResources[resourceType] = res.resources[0];
      this.isLoading = false;
    },
    /**
     * Esta función trae el los recursos vinculados a un usuario (yo), por tipo de recurso.
     * Esto se usa para georreferenciación
     * @param {String} resourceType
     */
    async getMyResourcesByType(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page_size: myTotalsByType[resourceType],
        'filter{owner.username}': userEmail,
      };
      if (resourceType === 'dataLayer') {
        queryParams['filter{has_geometry}'] = 'true';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector', 'remote'];
      }
      if (resourceType === 'document') {
        queryParams['filter{extension}'] = ['pdf', 'txt'];
      }

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      //En caso de que los recursos incluyan servicios remotos, revisamos su getCapabilities
      let datum;
      if (resourceType !== resourceTypeDic.document) {
        const service = resourceType === resourceTypeDic.dataLayer ? 'map' : 'table';
        const sourceTypes = res.resources.map((d) => d.sourcetype);
        if (sourceTypes.includes('REMOTE')) {
          // Revisamos si los servicios remotos permiten ver la capa y/o la tabla
          const locals = res.resources.filter((resource) => resource.sourcetype === 'LOCAL');
          let remotes = res.resources.filter((resource) => resource.sourcetype === 'REMOTE');
          const filterRemotes = await Promise.all(
            remotes.map(async (resource) => {
              return {
                resourceValue: resource,
                resourceHasWms: await hasWMS(resource, service),
              };
            })
          );
          remotes = filterRemotes.filter((d) => d.resourceHasWms).map((d) => d.resourceValue);
          datum = locals.concat(remotes);
        } else {
          datum = res.resources;
        }
      } else {
        datum = res.resources;
      }

      myResourcesByType[resourceType] = datum;
      this.isLoading = false;
      //return resources[resourceType];
    },
    /**
     *
     * @param {Object} resourceType
     */
    async getResourcesByType(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page_size: myTotalsByType[resourceType],
      };
      if (resourceType === 'dataLayer') {
        queryParams['filter{has_geometry}'] = 'true';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector', 'remote'];
      }
      if (resourceType === 'document') {
        queryParams['filter{extension}'] = ['pdf', 'txt'];
      }

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      //En caso de que los recursos incluyan servicios remotos, revisamos su getCapabilities
      let datum;
      if (resourceType !== resourceTypeDic.document) {
        const service = resourceType === resourceTypeDic.dataLayer ? 'map' : 'table';
        const sourceTypes = res.resources.map((d) => d.sourcetype);
        if (sourceTypes.includes('REMOTE')) {
          // Revisamos si los servicios remotos permiten ver la capa y/o la tabla
          const locals = res.resources.filter((resource) => resource.sourcetype === 'LOCAL');
          let remotes = res.resources.filter((resource) => resource.sourcetype === 'REMOTE');
          const filterRemotes = await Promise.all(
            remotes.map(async (resource) => {
              return {
                resourceValue: resource,
                resourceHasWms: await hasWMS(resource, service),
              };
            })
          );
          remotes = filterRemotes.filter((d) => d.resourceHasWms).map((d) => d.resourceValue);
          datum = locals.concat(remotes);
        } else {
          datum = res.resources;
        }
      } else {
        datum = res.resources;
      }

      resourcesByType2[resourceType] = datum;
      this.isLoading = false;
    },

    /**
     * Obtiene los recursos asociados a un usuario (yo), según si tienen metadatos o no
     * Esto se usa en catalogo/misRecursos
     * @param {String} section
     * @param {Array} query
     */
    async getMyResourcesByPage(section, pageNum, pageSize, query) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        ...query,
        page: pageNum,
        page_size: pageSize,
        'filter{owner.username}': userEmail,
      };
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      // TODO: Implementar en los queryparams si tiene metadatos pendientes o no
      let data;
      if (section === 'disponibles') {
        data = res.resources.filter((d) => d.category !== null);
      } else if (section === 'pendientes') {
        data = res.resources.filter((d) => d.category === null);
      } else {
        data = [];
      }
      misArchivos[section] = data;
      this.isLoading = false;
    },

    /**
     *Hace una petición de recursos especificando la página y el número de recursos que se desea traer
     * @param {Object} resourceType
     * @param {Number} pageNum
     * @param {Number} pageSize
     */
    async getResourcesByPage(resourceType = storeConsulta.resourceType, pageNum, pageSize, params) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        page: pageNum,
        page_size: pageSize,
        ...params,
      };

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      resources[resourceType] = res.resources;
      this.isLoading = false;
    },
    /**
     * Traer la información de un solo recurso
     * @param {*} pkToFind
     * @returns
     */
    async fetchResourceByPk(pkToFind) {
      const { gnoxyFetch } = useGnoxyUrl();
      const maxAttempts = 3;
      const url = `${config.public.geonodeApi}/sigic-resources/${pkToFind}`;
      // TODO: Si la petición falla porque el recurso es privado, eliminarlo de la store de seleccion
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await gnoxyFetch(url);
          if (!res.ok) {
            console.error(`Download failed: ${res.status}`);
            return 'Error';
          }
          const resource = await res.json();
          return resource.resource;
        } catch {
          console.warn(`Falló el intento ${attempt + 1}.`);
        }
      }
      return 'Error';
    },
    /**
     * Devuelve un recursos que coincida con un uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Object} ojeto de recursos de geonode.
     */
    findResource(pkToFind, resourceType = storeConsulta.resourceType) {
      return resources[resourceType].find(({ pk }) => pk === pkToFind);
    },

    /**
     * Devuelve una lista de recursos que coincidan con una lista de pks.
     * @param {Array<String>} pks del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<Object>} lista de ojetos de recursos de geonode.
     */
    findResources(pksToFind, resourceType = storeConsulta.resourceType) {
      return resources[resourceType].filter(({ pk }) => pksToFind.includes(pk));
    },
  };
});
