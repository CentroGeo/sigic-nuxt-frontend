import { defineStore } from 'pinia';

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
    //group: undefined,
    owner: undefined,
    metadata_author: undefined,
    keywords: undefined,
    regions: undefined,
    attribution: undefined,
    alternate: undefined,
    constraints_other: undefined,
    license: undefined,
    language: undefined,
    data_quality_statement: undefined,
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
        } else if (key === 'abstract') {
          metadata.abstract = metadataResponse[key]
            .replace(/^<p>/, '')
            .replace(/<\/p>$/, '')
            .replace(/^<pre>/, '')
            .replace(/<\/pre>$/, '');
        } else if (key === 'date') {
          const formatedDate = new Date(metadataResponse[key]).toISOString();
          metadata[key] = formatedDate.slice(0, 10);
        } else if (key === 'keywords') {
          const keywords = metadataResponse[key].map((d) => d.name);
          metadata[key] = keywords.join(', ');
        } else if (key in metadataResponse) {
          //console.log(key, metadataResponse[key]);
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

    getMetaField(field) {
      return metadata[field];
    },

    buildRequestBody() {
      // TODO: Generar todas las entradas para cada uno de los metadatos
      const metaDict = { title: 'Centros de Investigacion', abstract: 'El abstract' };
      const attrs = {};
      metadata.attribute_set.forEach((attribute) => {
        const object = {
          visible: attribute.visible ? 'True' : 'False',
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
      return metaDict;
    },
  };
});
