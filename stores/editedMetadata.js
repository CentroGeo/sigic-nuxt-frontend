import { defineStore } from 'pinia';

export const useEditedMetadataStore = defineStore('editedMetadata', () => {
  const config = useRuntimeConfig();
  /**
   * Almacenamiento reactivo de la información del recurso seleccionado
   */
  const metadata = reactive({
    pk: undefined,
    uuid: undefined,
    resource_type: undefined,
    owner: undefined,
    metadata_author: undefined,
    keywords: undefined,
    regions: undefined,
    category: undefined,
    title: undefined,
    abstract: undefined,
    attribution: undefined,
    alternate: undefined,
    date: undefined,
    date_type: undefined,
    constraints_other: undefined,
    license: undefined,
    language: undefined,
    data_quality_statement: undefined,
    group: undefined,
    thumbnail_url: undefined,
    attribute_set: [],
  });

  return {
    isLoading: ref(false),
    metadata,

    async fill(pk, resource_type) {
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
        } else if (key in metadataResponse) {
          metadata[key] = metadataResponse[key];
        } else {
          metadata[key] = undefined;
        }
      });
    },
    async checkFilling(pk, resource_type) {
      if (!metadata.pk || metadata.pk !== pk) {
        await this.fill(pk, resource_type);
      }
    },
    updateAttr(attr, value) {
      metadata[attr] = value;
    },
  };
});
