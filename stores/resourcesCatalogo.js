import { defineStore } from 'pinia';
import { buildUrl, getSLDs, resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

export const useResourcesCatalogoStore = defineStore('resourcesCatalogo', () => {
  const config = useRuntimeConfig();
  const storeConsulta = useConsultaStore();
  const { data } = useAuth();
  const userEmail = data.value?.user.email;

  // El recurso de cada tipo con actualización más reciente. Se muestran en catalogo/explorar
  const latestResources = reactive({
    [resourceTypeDic.dataLayer]: undefined,
    [resourceTypeDic.dataTable]: undefined,
    [resourceTypeDic.document]: undefined,
  });
  // El número total de los recursos que se muestran en catalogo/explorar/resourceType
  const totals = reactive({
    [resourceTypeDic.dataLayer]: 0,
    [resourceTypeDic.dataTable]: 0,
    [resourceTypeDic.document]: 0,
  });
  // Los recursos que se muestran en catalogo/explorar/resourceType
  const resources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });
  // El número total de los recursos que se muestran en catalogo/mi-archivos
  const totalMisArchivos = reactive({
    disponibles: 0,
    pendientes: 0,
    publicacion: 0,
  });
  // Los recursos que se muestran en catalogo/mi-archivos
  const misArchivos = reactive({
    disponibles: [],
    pendientes: [],
    publicacion: [],
  });
  // Esto se usa en la sección de unir-vectores
  const myTotalsByType = reactive({
    [resourceTypeDic.dataLayer]: 0,
    [resourceTypeDic.dataTable]: 0,
    [resourceTypeDic.document]: 0,
  });
  // Esto se usa en la sección de unir-vectores
  const myResourcesByType = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  /*   const resourcesByType2 = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  }); */

  return {
    isLoading: ref(false),
    totals,
    myTotalsByType,
    resources,
    myResourcesByType,
    latestResources,
    misArchivos,
    totalMisArchivos,

    // Regresa el total de los recursos mostrados en catalogo/explorar ycatalogo/explorar/resourceType
    totalByType(resourceType = storeConsulta.resourceType) {
      return totals[resourceType];
    },
    // Regresa el recurso más reciente. Se usa en catalogo/explorar
    latestByType(resourceType = storeConsulta.resourceType) {
      return latestResources[resourceType];
    },
    //Regresa los recursos mostrados por página en catalogo/explorar/resourceType
    resourcesByType(resourceType = storeConsulta.resourceType) {
      return resources[resourceType];
    },
    // Limpia los recursos que se muestran en catalogo/explorar/resourceType
    resetByType(resourceType = storeConsulta.resourceType) {
      resources[resourceType] = [];
    },
    /**Hace una petición de solo 1 recurso para obtener el total de recursos y el último recurso
     * Se usa en catalogo/explorar y catalogo/explorar/resourceType
     */
    async getTotalResources(resourceType = storeConsulta.resourceType, query) {
      const { gnoxyFetch } = useGnoxyUrl();
      //TODO: agregar filtro para traer solo recursos con metadatos
      const queryParams = {
        'sort[]': '-last_updated',
        page_size: 1,
        ...query,
        'filter{complete_metadata}': 'true',
      };
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      // Agregamos los estilos
      if (res.resources[0].resource_type === 'dataset') {
        const { defaultStyle, styleList } = await getSLDs(res.resources[0]);
        res.resources[0].default_style = defaultStyle;
        res.resources[0].styles = styleList;
      }
      totals[resourceType] = res.total;
      latestResources[resourceType] = res.resources[0];
    },
    /**
     * Hace una petición de recursos especificando la página y el número de recursos que se desea traer.
     * Estos recursos muestran en catalogo/explorar/resourceType
     * @param {Object} resourceType
     * @param {Number} pageNum
     * @param {Number} pageSize
     */
    async getResourcesByPage(resourceType = storeConsulta.resourceType, pageNum, pageSize, params) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      //TODO: Agregar el parámetro para que solo traiga los recursos con metadata completa
      const queryParams = {
        page: pageNum,
        page_size: pageSize,
        'filter{complete_metadata}': 'true',
        ...params,
      };

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      // Agregamos el tipo de geometría y los estilos disponibles
      if (resourceType === 'dataLayer' || resourceType === 'dataTable') {
        await Promise.all(
          res.resources.map(async (d) => {
            const { defaultStyle, styleList } = await getSLDs(d);
            d.default_style = defaultStyle;
            d.styles = styleList;
          })
        );
      }
      resources[resourceType] = res.resources;
      this.isLoading = false;
    },

    // Regresa el total de los recursos que son míos. Puede estar disponibles, tener metadatos pendientes o estar en proceso de publicación.
    // Esto se usa en catalogo/mis-archivos
    myTotalBySection(section) {
      return totalMisArchivos[section];
    },
    // Regresa el total de los recursos que son míos. Puede estar disponibles, tener metadatos pendientes o estar en proceso de publicación.
    // Esto se usa en catalogo/mis-archivos
    mineBySection(section) {
      return misArchivos[section];
    },
    // Limpia los recursos que se muestran en catalogo/mis-archivos. Puede estar disponibles, tener metadatos pendientes o estar en proceso de publicación.
    // Esto se usa en catalogo/mis-archivos
    resetBySection(section) {
      misArchivos[section] = [];
    },
    /**
     * Obtiene el total de los recursos asociados a un usuario (yo), según si tienen metadatos o no
     * Esto se usa en catalogo/mis-archivos
     * @param {String} section
     * @param {Array} query
     */
    async getMyTotal(section, query) {
      const { gnoxyFetch } = useGnoxyUrl();
      const queryParams = {
        ...query,
        page_size: 1,
        'filter{owner.username}': userEmail,
      };
      // Agregar toda la lógica de queryparams correspondientes por sección
      if (section === 'disponibles') {
        queryParams['filter{complete_metadata}'] = 'true';
      } else if (section === 'pendientes') {
        queryParams['filter{complete_metadata}'] = 'false';
      }

      // Excluimos los servicios usando queryparams
      if (
        !Object.keys(queryParams).includes('filter{subtype.in}') &&
        !queryParams['filter{resource_type}']
      ) {
        queryParams['filter{resource_type}'] = ['dataset', 'document'];
      }

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      totalMisArchivos[section] = res.total;
    },
    /**
     * Obtiene los recursos asociados a un usuario (yo), según si tienen metadatos o no
     * Esto se usa en catalogo/mis-archivos
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
      // Agregar toda la lógica de queryparams correspondientes por sección
      if (section === 'disponibles') {
        queryParams['filter{complete_metadata}'] = 'true';
      } else if (section === 'pendientes') {
        queryParams['filter{complete_metadata}'] = 'false';
      }

      // Excluimos los servicios usando queryparams
      if (
        !Object.keys(queryParams).includes('filter{subtype.in}') &&
        !queryParams['filter{resource_type}']
      ) {
        queryParams['filter{resource_type}'] = ['dataset', 'document'];
      }

      //Pedimos los recursos
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      // Agregamos el tipo de geometría y los estilos disponibles
      await Promise.all(
        res.resources.map(async (d) => {
          if (d.resource_type === 'dataset') {
            const { defaultStyle, styleList } = await getSLDs(d);
            d.default_style = defaultStyle;
            d.styles = styleList;
          }
        })
      );

      misArchivos[section] = res.resources;
      this.isLoading = false;
    },

    /**
     * Trae el total los recursos vinculados a un usuario (yo), por tipo de recurso
     * Esto se usa para georreferenciación
     * @param {String} resourceType
     */
    async getMyTotalResources(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      //TODO: agregar filtro para traer solo recursos con metadatos
      const queryParams = {
        'filter{complete_metadata}': 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page_size: 1,
        'filter{owner.username}': userEmail,
      };
      if (resourceType === 'dataLayer') {
        queryParams['filter{has_geometry}'] = 'true';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector'];
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
     * Esta función trae el los recursos vinculados a un usuario (yo), por tipo de recurso.
     * Esto se usa para georreferenciación
     * @param {String} resourceType
     */
    async getMyResourcesByType(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      //TODO: agregar filtro para traer solo recursos con metadatos
      const queryParams = {
        'filter{complete_metadata}': 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page_size: myTotalsByType[resourceType],
        'filter{owner.username}': userEmail,
      };
      if (resourceType === 'dataLayer') {
        queryParams['filter{has_geometry}'] = 'true';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector'];
      }
      if (resourceType === 'document') {
        queryParams['filter{extension}'] = ['pdf', 'txt'];
      }

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      myResourcesByType[resourceType] = res.resources;
      this.isLoading = false;
      //return resources[resourceType];
    },
    /**
     *
     * @param {Object} resourceType
     */
    /*     async getResourcesByType(resourceType = storeConsulta.resourceType) {
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
        queryParams['filter{subtype.in}'] = ['vector'];
      }
      if (resourceType === 'document') {
        queryParams['filter{extension}'] = ['pdf', 'txt'];
      }

      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();

      resourcesByType2[resourceType] = res.resources;
      this.isLoading = false;
    }, */

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
