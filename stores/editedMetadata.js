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
    date_type: 'creation',
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
    //alternate: undefined,
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
    thumbnail_url: undefined,
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
      //console.log(metadataResponse);
      const attrs = Object.keys(metadata);
      attrs.forEach((key) => {
        if (key === 'attribute_set' && resource_type === 'document') {
          metadata.attribute_set = [];
        } else if (key === 'abstract') {
          metadata.abstract = metadataResponse['raw_abstract'];
        } else if (key === 'date') {
          const formatedDate = new Date(metadataResponse[key]).toISOString();
          metadata[key] = formatedDate.slice(0, 10);
        } else if (key === 'category') {
          metadata[key] = metadataResponse.category.identifier;
        } else if (key === 'metadata_author') {
          metadata[key] = metadataResponse.metadata_author[0]['username'];
        } else if (key === 'metadata_author_pk') {
          metadata[key] = metadataResponse.metadata_author[0]['pk'];
        } else if (key === 'license') {
          metadata[key] = metadataResponse.license.identifier;
        } else if (key === 'restriction_code_type') {
          metadata[key] = metadataResponse.restriction_code_type?.identifier;
        } else if (key in metadataResponse) {
          //console.log(key, metadataResponse[key]);
          metadata[key] = metadataResponse[key];
        } else {
          metadata[key] = undefined;
        }
      });
      //console.log('store', metadata);
      this.isLoading = false;
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
      //const metaDict = { title: 'Centros de Investigacion', abstract: 'El abstract' };
      const metaDict = {};
      const metaKeys = Object.keys(metadata);
      metaKeys.forEach((key) => {
        console.log(key);
      });
      metaDict['title'] = metadata.title;
      metaDict['abstract'] = metadata.abstract;
      metaDict['date_type'] = metadata.date_type;
      metaDict['date'] = new Date(metadata.date).toISOString(); //
      metaDict['category'] = {
        identifier: metadata.category,
        gn_description: categoriesNames[metadata.category],
      }; //
      //metaDict['keywords']
      metaDict['metadata_author'] = [
        {
          pk: metadata.metadata_author_pk,
          username: metadata.metadata_author,
        },
      ]; //
      metaDict['language'] = metadata.language;
      metaDict['license'] = { identifier: metadata.license }; //
      metaDict['attribution'] = metadata.attribution;
      metaDict['data_quality_statement'] = metadata.data_quality_statement;
      metaDict['restriction_code_type'] = { identifier: metadata.restriction_code_type }; //
      metaDict['constraints_other'] = metadata.constraints_other;
      metaDict[' edition'] = metadata.edition;
      metaDict['doi'] = metadata.doi;
      metaDict['purpose'] = metadata.purpose;
      metaDict['supplemental_information'] = metadata.supplemental_information;
      metaDict['maintenance_frequency'] = metadata.maintenance_frequency;

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
      return metaDict;
    },
  };
});
