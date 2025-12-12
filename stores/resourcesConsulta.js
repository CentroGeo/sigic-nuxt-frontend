import { defineStore } from 'pinia';
import { buildUrl, defineGeomType, resourceTypeDic } from '~/utils/consulta';

export const useResourcesConsultaStore = defineStore('resourcesConsulta', () => {
  const config = useRuntimeConfig();
  const storeConsulta = useConsultaStore();
  const storeSelected = useSelectedResources2Store();
  /**
   * Almacenamiento reactivo de los recursos seleccionados.
   */
  const resources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });
  const selectedResources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  const nthElementsPks = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  return {
    isLoading: ref(false),
    resources,
    selectedResources,
    /**
     * Función que regresa los recursos según el tipo de recurso con el que se está trabajando
     * @param {String} resourceType
     * @returns {Array}
     */
    resourcesByType(resourceType = storeConsulta.resourceType) {
      return resources[resourceType];
    },
    /**
     * Función que regresa un array de pks correspondientes a los enésimos elementos de cada categoría
     * @param {String} resourceType
     * @returns {Array}
     */
    nthElementsByType(resourceType = storeConsulta.resourceType) {
      return nthElementsPks[resourceType];
    },
    /**
     * Elimina todos los elementos de un tipo
     * @param {String} resourceType
     */
    resetByType(resourceType = storeConsulta.resourceType) {
      resources[resourceType] = [];
    },
    /**
     * Hace una petición por recursos especificando el número de página, el número de recursos y los query params que debe llevar
     * @param {String} resourceType
     * @param {Number} pageNum
     * @param {Array} params
     */
    async fillByCategory(resourceType = storeConsulta.resourceType, pageNum, params) {
      const { gnoxyFetch } = useGnoxyUrl();
      const queryParams = {
        'filter{complete_metadata}': 'true',
        page: pageNum,
        page_size: 2,
        ...params,
      };
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);

      try {
        const resourcesRequest = await gnoxyFetch(url);
        if (!resourcesRequest.ok) {
          console.error('Falló la petición inicial por recursos con categoría');
          return;
        }

        const resourcesRes = await resourcesRequest.json();
        // Agregamos el tipo de geometría y los estilos disponibles
        if (resourceType === 'dataLayer') {
          await Promise.all(
            resourcesRes.resources.map(async (d) => {
              d.geomType = await defineGeomType(d);

              if (d.sourcetype !== 'REMOTE') {
                const stylesURL = `${config.public.geonodeApi}/datasets/${d.pk}/sldstyles/`;
                const stylesRes = await gnoxyFetch(stylesURL);

                if (!stylesRes.ok) {
                  d.default_style = null;
                  d.styles = [];
                  console.error('Falló la petición de estilos');
                  return;
                }

                const stylesData = await stylesRes.json();
                d.default_style = stylesData.default_style;
                d.styles = stylesData.styles;
                if (!d.styles.includes(d.default_style)) {
                  d.styles.push(d.default_style);
                }
              } else {
                d.default_style = null;
                d.styles = [];
              }
            })
          );
        } else if (resourceType === 'dataTable') {
          await Promise.all(
            resourcesRes.resources.map(async (d) => {
              if (d.sourcetype !== 'REMOTE') {
                const stylesURL = `${config.public.geonodeApi}/datasets/${d.pk}/sldstyles/`;
                const stylesRes = await gnoxyFetch(stylesURL);

                if (!stylesRes.ok) {
                  d.default_style = null;
                  d.styles = [];
                  console.error('Falló la petición de estilos');
                  return;
                }

                const stylesData = await stylesRes.json();
                d.default_style = stylesData.default_style;
                d.styles = stylesData.styles;
                if (!d.styles.includes(d.default_style)) {
                  d.styles.push(d.default_style);
                }
              } else {
                d.default_style = null;
                d.styles = [];
              }
            })
          );
        }
        const data = resourcesRes.resources;
        resources[resourceType] = [...resources[resourceType], ...data];
        return;
      } catch {
        console.error('Fracasó la petición de recursos por categoría');
        return;
      }
    },
    /**
     * Reescribe la lista de pks correspondientes a los enésimos elementos
     * @param {String} resourceType
     * @param {Array} pksList
     */
    setNthElements(resourceType = storeConsulta.resourceType, pksList) {
      nthElementsPks[resourceType] = pksList;
    },
    /**
     * Solicita el recurso identificado por el pk
     * @param {String} pkToFind
     * @param {String} resourceType
     */
    async fetchResourceByPk(pkToFind) {
      const { gnoxyFetch } = useGnoxyUrl();
      const maxAttempts = 3;
      const url = `${config.public.geonodeApi}/sigic-resources/${pkToFind}`;
      // TODO: Si la petición falla porque el recurso es privado, eliminarlo de la store de seleccion
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const resourceRes = await gnoxyFetch(url);
          if (!resourceRes.ok) {
            console.error(`Resource fetch failed: ${resourceRes.status}`);
            return 'Error';
          }
          const resource = await resourceRes.json();
          const resourceData = resource.resource;

          // Agregamos los estilos
          if (resourceData.resource_type === 'dataset') {
            if (resourceData.sourcetype !== 'REMOTE') {
              const stylesURL = `${config.public.geonodeApi}/datasets/${resourceData.pk}/sldstyles/`;
              const stylesRes = await gnoxyFetch(stylesURL);

              if (!stylesRes.ok) {
                resourceData.default_style = null;
                resourceData.styles = [];
                console.error('Falló la petición de estilos');
                return;
              }

              const stylesData = await stylesRes.json();
              resourceData.default_style = stylesData.default_style;
              resourceData.styles = stylesData.styles;
              if (!resourceData.styles.includes(resourceData.default_style)) {
                resourceData.styles.push(resourceData.default_style);
              }
            } else {
              resourceData.default_style = null;
              resourceData.styles = [];
            }
          }
          return resourceData;
        } catch {
          console.warn(`Falló el intento ${attempt + 1}.`);
        }
      }
      return;
    },

    /**
     * Solicita todos los recursos de una lista a partir de su pk
     * @param {Array} pkToFind
     * @param {String} resourceType
     */
    async fetchResourcesByPk(resourceType = storeConsulta.resourceType, pkListToFind) {
      const lista = [];
      const resourcesPks = resources[resourceType].map((resource) => resource.pk);
      for (const pk of pkListToFind) {
        if (resourcesPks.includes(pk)) {
          const resource = resources[resourceType].find((resource) => resource.pk === pk);
          lista.push(resource);
        } else {
          const resource = await this.fetchResourceByPk(pk);
          if (resource !== 'Error') {
            lista.push(resource);
          } else {
            storeSelected.removeByPk(pk);
          }
        }
      }
      selectedResources[resourceType] = lista;
    },

    /**
     * Devuelve un recursos que coincida con un pk.
     * @param {String} pk del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Object} ojeto de recursos de geonode.
     */
    findResource(pkToFind, resourceType = storeConsulta.resourceType) {
      return selectedResources[resourceType].find(({ pk }) => pk === pkToFind);
    },
    /**
     * Devuelve una lista de recursos que coincidan con una lista de pks.
     * @param {Array<String>} pks del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<Object>} lista de ojetos de recursos de geonode.
     */
    findResources(pksToFind, resourceType = storeConsulta.resourceType) {
      return selectedResources[resourceType].filter(({ pk }) => pksToFind.includes(pk));
    },
  };
});
