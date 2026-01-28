<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

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
  visible: 'Visible',
};
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
                <input
                  :id="`display-order-${datum['pk']}`"
                  v-model="datum['display_order']"
                  type="number"
                  class="m-y-1"
                />
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
        class="tarjeta contenedor ancho-lectura borde-redondeado-16 fondo-color-error"
      >
        <div class="tarjeta-cuerpo">
          <p class="texto-color-error">
            <span class="pictograma-alerta" /> Este recurso no permite la edición de su tabla de
            atributos.
          </p>
        </div>
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
