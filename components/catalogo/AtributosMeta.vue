<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const props = defineProps({
  resource: {
    type: Object,
    default: () => ({}),
  },
  resourcePk: {
    type: String,
    default: '',
  },
  resourceType: {
    type: String,
    default: '',
  },
  isModal: {
    type: Boolean,
    default: false,
  },
});
const storeMetadatos = useEditedMetadataStore();
await storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
const attrSet = computed(() => storeMetadatos.metadata.attribute_set);
const sortedAttrs = ref(attrSet.value.sort((a, b) => a.display_order - b.display_order));

const variables = {
  attribute: 'Atributo',
  attribute_label: 'Etiqueta',
  description: 'Descripción',
  display_order: 'Mostrar Orden',
  featureinfo_type: 'Display type',
  visible: 'Visible',
};
const typeOptions = {
  Label: 'type_property',
  URL: 'type_href',
  Image: 'type_image',
  'Video (mp4)': 'type_video_mp4',
  'Video (ogg)': 'type_video_ogg',
  'Video (webm)': 'type_video_webm',
  'Video (3gp)': 'type_video_3gp',
  'Video (flv)': 'type_video_flv',
  'Video (YouTube/VIMEO)': 'type_video_youtube',
  Audio: 'type_audio',
  IFRAME: 'type_iframe',
};

/*watch(
  attrSet,
  (newVal) => {
    console.log(attrSet.value);
    sortedAttrs.value = newVal.sort((a, b) => a.display_order - b.display_order);
  },
  { deep: true }
); */
</script>
<template>
  <div>
    <div class="alineacion-izquierda ancho-lectura">
      <CatalogoHeaderMetadatos
        :resource="props.resource"
        :title="'Atributos del Conjunto de Datos'"
        :exclude-links="props.isModal"
      ></CatalogoHeaderMetadatos>
    </div>

    <div class="contenedor-tabla p-2">
      <table v-if="sortedAttrs.length > 0">
        <thead>
          <tr>
            <th
              v-for="(variable, v) in Object.keys(variables)"
              :id="`${variable}-col-${v}`"
              :key="v"
              scope="col"
            >
              {{ variables[variable] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(datum, d) in sortedAttrs" :id="`${datum}-ren-${d}`" :key="d">
            <td>{{ datum['attribute'] }}</td>
            <td>
              <ClientOnly>
                <SisdaiCampoBase
                  :id="`attribute-label-${datum['pk']}`"
                  v-model="datum['attribute_label']"
                  etiqueta=""
                  tipo="text"
                  class="m-y-1"
                  :ejemplo="datum['attribute_label']"
                />
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                <SisdaiCampoBase
                  :id="`description-${datum['pk']}`"
                  v-model="datum['description']"
                  etiqueta=""
                  tipo="text"
                  class="m-y-1"
                  :ejemplo="datum['description']"
                />
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                <!-- <SisdaiCampoBase
                  :id="`display-order-${datum['pk']}`"
                  v-model="datum['display_order']"
                  :es_etiqueta_visible="false"
                  :etiqueta="`display-order-${datum['pk']}`"
                  tipo="number"
                  class="m-y-1"
                /> -->
                <input
                  :id="`display-order-${datum['pk']}`"
                  v-model="datum['display_order']"
                  type="number"
                  class="m-y-1"
                />
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                <SisdaiSelector v-model="datum['featureinfo_type']" etiqueta="">
                  <option
                    v-for="type in Object.keys(typeOptions)"
                    :key="`${type}-tipo-opcion`"
                    :value="typeOptions[type]"
                  >
                    {{ type }}
                  </option>
                </SisdaiSelector>
              </ClientOnly>
            </td>
            <td>
              <input
                :id="`visible-checkbox-${datum['pk']}`"
                v-model="datum['visible']"
                type="checkbox"
              />
              <label :for="`visible-checkbox-${datum['pk']}`">Visible</label>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-else-if="sortedAttrs.length === 0"
        class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
      >
        <span class="pictograma-alerta" />
        <b> Este recurso no permite la edición de su tabla de atributos.</b>
      </div>

      <p v-else>...Cargando</p>
      <CatalogoBotonesMetadatos
        v-if="!props.isModal"
        :key="`4-${props.resourcePk}-buttons`"
        :title="'AtributosConjunto'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
        :resource="props.resource"
      ></CatalogoBotonesMetadatos>
    </div>
  </div>
</template>
