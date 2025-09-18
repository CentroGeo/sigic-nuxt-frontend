<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { getFeatures } from '~/utils/consulta';

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
const features = ref([]);
const variables = [
  'Atributo',
  'Etiqueta',
  'Descripción',
  'Mostrar Orden',
  'Display type',
  'Visible',
];
const datos = ref([]);
const checkedAttrs = ref([]);
async function updateValues() {
  features.value = await getFeatures(props.resource);
  datos.value = [];
  for (let i = 0; i < features.value.length; i++) {
    datos.value.push({
      Atributo: features.value[i],
      Etiqueta: '',
      Descripción: '',
      'Mostrar Orden': `${i + 1}`,
      'Display type': '',
      Visible: '',
    });
  }
  checkedAttrs.value = features.value;
}
updateValues();
/* watch(
  () => props.resource,
  async () => {
    console.log('se triggereó el watcher');
    updateValues();
  }
); */
</script>
<template>
  <div>
    <div class="alineacion-izquierda ancho-lectura">
      <CatalogoHeaderMetadatos
        :resource="props.resource"
        :title="'Atributos del Conjunto de Datos'"
        :exclude-links="false"
      ></CatalogoHeaderMetadatos>
    </div>

    <div class="contenedor-tabla p-2">
      <table v-if="datos.length > 0">
        <thead>
          <tr>
            <th
              v-for="(variable, v) in variables"
              :id="`${variable}-col-${v}`"
              :key="v"
              scope="col"
            >
              {{ variable }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(datum, d) in datos" :id="`${datum}-ren-${d}`" :key="d">
            <td>{{ datum['Atributo'] }}</td>
            <td>
              <ClientOnly>
                <SisdaiCampoBase
                  :id="datum['Etiqueta']"
                  v-model="datum['Etiqueta']"
                  etiqueta=""
                  tipo='"text"'
                  class="m-y-1"
                  :ejemplo="datum['Etiqueta']"
                />
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                <SisdaiCampoBase
                  :id="datum['Descripción']"
                  v-model="datum['Descripción']"
                  etiqueta=""
                  tipo='"text"'
                  class="m-y-1"
                  :ejemplo="datum['Descripción']"
                />
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                <SisdaiCampoBase
                  :id="datum['Mostrar Orden']"
                  v-model="datum['Mostrar Orden']"
                  etiqueta=""
                  tipo='"text"'
                  class="m-y-1"
                  :ejemplo="datum['Mostrar Orden']"
                />
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                <SisdaiSelector v-model="datum['Display type']" etiqueta="">
                  <option value="todos">Opcion 1</option>
                  <option value="catalogo">Opcion 2</option>
                </SisdaiSelector>
              </ClientOnly>
            </td>
            <td>
              <input
                :id="`${datum['Atributo']}-checkbox`"
                v-model="checkedAttrs"
                type="checkbox"
                :value="datum['Atributo']"
              />
              <label :for="`${datum['Atributo']}-checkbox`">Visible</label>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>...Cargando</p>
      <CatalogoBotonesMetadatos
        :key="`4-${props.resourcePk}-buttons`"
        :title="'AtributosConjunto'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
        :resource="props.resource"
      ></CatalogoBotonesMetadatos>
    </div>
  </div>
</template>
