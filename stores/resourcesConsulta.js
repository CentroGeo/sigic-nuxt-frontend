import { defineStore } from 'pinia';
import { buildUrl, defineGeomType, hasWMS, resourceTypeDic } from '~/utils/consulta';

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
        page: pageNum,
        page_size: 2,
        ...params,
      };
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url);
      const res = await request.json();

      // Agregamos el tipo de geometría cuando sea necesario
      if (resourceType === 'dataLayer') {
        await Promise.all(
          res.resources.map(async (d) => {
            d.geomType = await defineGeomType(d);
          })
        );
      }

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

      // TODO: Agregar en los query params el filtrado para indicar que recursos con metadatos
      // completos. Borrar la siguiente linea y cambiar data por datum
      const data = datum.filter((d) => d.category);
      resources[resourceType] = [...resources[resourceType], ...data];
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

    async fetchAttrs(pk) {
      const config = useRuntimeConfig();
      const { gnoxyFetch } = useGnoxyUrl();
      const maxAttrs = 5;
      const etiquetas = {};
      let columnas = [];
      try {
        const res = await gnoxyFetch(`${config.public.geonodeApi}/datasets/${pk}/attribute_set`);
        if (!res.ok) {
          console.error(res.status);
          return;
        }
        const { attributes } = await res.json();
        columnas = attributes
          .filter((a) => a.visible)
          .sort((a, b) => a.display_order - b.display_order)
          .map(({ attribute, attribute_label }) => {
            etiquetas[attribute] = attribute_label || attribute;
            return attribute;
          });

        // Limitamos el máximo de atributos visibles
        if (columnas.length > maxAttrs) {
          columnas = columnas.slice(0, maxAttrs);
        }
        return { columnas, etiquetas };
      } catch {
        console.error('Error');
      }
      return;
    },
  };
});
