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

    async fill(pk) {
      const { gnoxyUrl } = useGnoxyUrl();
      const url = gnoxyUrl(`${config.public.geonodeApi}/datasets/${pk}`);
      const request = await fetch(url);
      const { dataset: metadataResponse } = await request.json();

      const attrs = Object.keys(metadata);
      attrs.forEach((key) => {
        if (key in metadataResponse) {
          metadata[key] = metadataResponse[key];
        } else {
          metadata[key] = undefined;
        }
      });
      console.log(metadata);
    },
  };
});
