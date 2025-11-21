import { defineStore } from 'pinia';
import { categoriesNames } from '~/utils/consulta';

export const useEditedMetadataStore = defineStore('editedMetadata', () => {
  const config = useRuntimeConfig();
  /**
   * Almacenamiento reactivo de la información del recurso seleccionado
   */
  const metadata = reactive({
    uuid: undefined,
    pk: undefined,
    resource_type: undefined,
    title: undefined,
    abstract: undefined,
    date_type: undefined,
    date: undefined,
    category: undefined,
    keywords: undefined,
    metadata_author_pk: undefined,
    metadata_author: undefined,
    //group: undefined,
    //regions: undefined,
    license: undefined,
    language: undefined,
    attribution: undefined,
    data_quality_statement: undefined,
    restriction_code_type: undefined,
    constraints_other: undefined,
    edition: undefined,
    doi: undefined,
    purpose: undefined,
    supplemental_information: undefined,
    maintenance_frequency: undefined,
    //publisher: undefined,
    //owner: undefined,
    //thumbnail_url: undefined,
    attribute_set: [],
  });

  return {
    isLoading: ref(false),
    metadata,

    async fill(pk, resource_type) {
      this.isLoading = true;
      const { gnoxyUrl } = useGnoxyUrl();
      const resourceTypeDict = {
        dataLayer: 'datasets',
        dataTable: 'datasets',
        document: 'documents',
      };
      const url = gnoxyUrl(`${config.public.geonodeApi}/${resourceTypeDict[resource_type]}/${pk}`);
      const request = await fetch(url);
      if (!request.ok) {
        console.warn('Algo falló en la petición para metadatos:', request);
      }
      const res = await request.json();
      //Obtenemos los metadatos del recurso
      let metadataResponse;
      if (resource_type === 'document') {
        metadataResponse = res.document;
      } else {
        metadataResponse = res.dataset;
      }
      const attrs = Object.keys(metadata);
      attrs.forEach((key) => {
        if (key === 'attribute_set' && resource_type === 'document') {
          metadata.attribute_set = [];
        } else if (key === 'abstract') {
          metadata.abstract = metadataResponse['raw_abstract'];
        } else if (key === 'date_type') {
          metadata[key] = 'creation';
        } else if (key === 'date') {
          const formatedDate = new Date(metadataResponse[key]).toISOString();
          metadata[key] = formatedDate.slice(0, 10);
        } else if (key === 'category') {
          metadata[key] = metadataResponse.category?.identifier;
        } else if (key === 'metadata_author') {
          metadata[key] = metadataResponse.metadata_author[0]['username'];
        } else if (key === 'metadata_author_pk') {
          metadata[key] = metadataResponse.metadata_author[0]['pk'];
        } else if (key === 'license') {
          metadata[key] = metadataResponse.license.identifier;
        } else if (key === 'restriction_code_type') {
          metadata[key] = metadataResponse.restriction_code_type?.identifier;
        } else if (key in metadataResponse) {
          metadata[key] = metadataResponse[key];
        } else {
          metadata[key] = undefined;
        }
      });
      this.isLoading = false;
    },
    /**
     * Esta función revisa si ya hay algo en la store. Si no, solicita la información del recurso
     * @param {*} pk
     * @param {String} resource_type
     */
    async checkFilling(pk, resource_type) {
      if (!metadata.pk || metadata.pk !== pk) {
        await this.fill(pk, resource_type);
      }
    },
    /**
     * Actualiza el valor de el metadato indicado
     * @param {String} attr El metadato a editar
     * @param {String} value El nuevo valor
     */
    updateAttr(attr, value) {
      metadata[attr] = value;
    },
    /**
     * Regresa el valor del metadato especificado
     * @param {String} field
     * @returns El valor del metadato
     */
    getMetaField(field) {
      return metadata[field];
    },
    /**
     * Genera el cuerpo de la petición de edición de metadatosy, ecluyendo campos
     * si el metadato está vacío
     * @returns Objeto de metadatos
     */
    buildRequestBody() {
      const exclude = ['uuid', 'pk', 'resource_type', 'metadata_author_pk'];
      const dictKeys = Object.keys(metadata).filter((key) => !exclude.includes(key));
      const metaDict = {};

      //TODO: incorporar keywords, publisher y arreglar metadata_author
      dictKeys.forEach((key) => {
        if (metadata[key] === null || metadata[key] === undefined) {
          return;
        } else if (typeof metadata[key] === 'string' && metadata[key].length === 0) {
          return;
        } else if (typeof metadata[key] === 'string' && metadata[key].length > 0) {
          // Si no está vacío pero necesita una estructura particular
          if (key === 'date') {
            metaDict['date'] = new Date(metadata.date).toISOString(); //
          } else if (key === 'category') {
            metaDict['category'] = {
              identifier: metadata.category,
              gn_description: categoriesNames[metadata.category],
            };
          } else if (key === 'license' || key === 'restriction_code_type') {
            metaDict[key] = { key: metadata[key] }; //
          } else if (key === 'metadata_author') {
            /* metaDict['metadata_author'] = [
              {
                pk: metadata.metadata_author_pk,
                username: metadata.metadata_author,
              },
            ]; */
            return;
          } else {
            // Si no necesita una estructura particular
            metaDict[key] = metadata[key];
          }
        } else {
          // Si el valor del metadato no es una cadena
          if (key === 'attribute_set') {
            const attrs = {};
            metadata.attribute_set.forEach((attribute) => {
              const object = {
                visible: attribute.visible,
                display_order: attribute.display_order,
              };
              if (attribute.description) {
                object['description'] = attribute.description;
              }
              if (attribute.attribute_label) {
                object['attribute_label'] = attribute.attribute_label;
              }
              attrs[`${attribute.pk}`] = object;
            });
            metaDict['attribute_set'] = attrs;
          } else {
            console.warn(typeof metadata[key], key);
          }
        }
      });
      console.warn(metaDict);
      return metaDict;
    },
  };
});
