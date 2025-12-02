import { defineStore } from 'pinia';
import { categoriesNames, unaccentUppercase } from '~/utils/consulta';

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
    publisher: '...cargando',
    publisher_pk: undefined,
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
        } else if (key === 'keywords') {
          metadata[key] = metadataResponse.keywords.map((d) => d.name).join(',');
        } else if (key === 'metadata_author') {
          metadata[key] = metadataResponse.metadata_author[0]['username'];
        } else if (key === 'metadata_author_pk') {
          metadata[key] = metadataResponse.metadata_author[0]['pk'];
        } else if (key === 'license') {
          metadata[key] = metadataResponse.license.identifier;
        } else if (key === 'restriction_code_type') {
          metadata[key] = metadataResponse.restriction_code_type?.identifier;
        } else if (key === 'publisher') {
          metadata[key] = metadataResponse.publisher?.[0]?.['username'] || '';
        } else if (key === 'publihser_pk') {
          metadata[key] = metadataResponse.publisher?.[0]?.['pk'] || '';
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
      //TODO: incorporar keywords, publisher y arreglar metadata_author
      const metaDict = {};
      //const exclude = ['uuid', 'pk', 'resource_type', 'metadata_author_pk'];
      //const dictKeys = Object.keys(metadata).filter((key) => !exclude.includes(key));
      /*   dictKeys.forEach((key) => {
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
            //  metaDict['metadata_author'] = [
            //   {
            //     pk: metadata.metadata_author_pk,
            //     username: metadata.metadata_author,
            //   },
            // ]; 
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
            //console.warn(typeof metadata[key], key);
            return;
          }
        }
      }); */

      if (metadata.title && metadata.title.length > 0) {
        metaDict['title'] = metadata.title;
      }
      if (metadata.abstract && metadata.abstract.length > 0) {
        metaDict['abstract'] = metadata.abstract;
      }
      if (metadata.date && metadata.date.length > 0) {
        metaDict['date_type'] = metadata.date_type;
        metaDict['date'] = new Date(metadata.date).toISOString(); //
      }
      if (metadata.category && metadata.category.length > 0) {
        metaDict['category'] = {
          identifier: metadata.category,
          gn_description: categoriesNames[metadata.category],
        };
      }
      if (metadata.keywords && metadata.keywords.length > 0) {
        metaDict['keywords'] = unaccentUppercase(metadata.keywords).split(',');
      }
      if (metadata.metadata_author && metadata.metadata_author_pk) {
        metaDict['metadata_author'] = [
          {
            pk: metadata.metadata_author_pk,
            username: metadata.metadata_author,
          },
        ];
      }
      if (metadata.license && metadata.license.length > 0) {
        metaDict['license'] = { identifier: metadata.license };
      }
      if (metadata.language && metadata.language.length > 0) {
        metaDict['language'] = metadata.language;
      }

      if (metadata.abstract && metadata.abstract.length > 0) {
        metaDict['abstract'] = metadata.abstract;
      }

      if (metadata.attribution && metadata.attribution.length > 0) {
        metaDict['attribution'] = metadata.attribution;
      }
      if (metadata.data_quality_statement && metadata.data_quality_statement.length > 0) {
        metaDict['data_quality_statement'] = metadata.data_quality_statement;
      }
      if (metadata.restriction_code_type && metadata.restriction_code_type.length > 0) {
        metaDict['restriction_code_type'] = { identifier: metadata.restriction_code_type };
      }
      if (metadata.constraints_other && metadata.constraints_other.length > 0) {
        metaDict['constraints_other'] = metadata.constraints_other;
      }
      if (metadata.edition && metadata.edition.length > 0) {
        metaDict['edition'] = metadata.edition;
      }
      if (metadata.doi && metadata.doi.length > 0) {
        metaDict['doi'] = metadata.doi;
      }
      if (metadata.purpose && metadata.purpose.length > 0) {
        metaDict['purpose'] = metadata.purpose;
      }
      if (metadata.supplemental_information && metadata.supplemental_information.length > 0) {
        metaDict['supplemental_information'] = metadata.supplemental_information;
      }
      if (metadata.maintenance_frequency && metadata.maintenance_frequency.length > 0) {
        metaDict['maintenance_frequency'] = metadata.maintenance_frequency;
      }
      if (metadata.publisher && metadata.publisher_pk) {
        metaDict['publisher'] = [
          {
            pk: metadata.publisher_pk,
            username: metadata.publisher,
          },
        ];
      }

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
      //console.warn('El cuerpo de la petición:', metaDict);
      return metaDict;
    },
  };
});
