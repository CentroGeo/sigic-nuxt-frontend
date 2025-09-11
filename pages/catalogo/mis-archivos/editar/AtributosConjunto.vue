<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { getFeatures } from '~/utils/consulta';

// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
const typeDict = {
  Documentos: 'document',
  'Capa geográfica': 'dataLayer',
  'Datos tabulados': 'dataTable',
};
// Recuperamos la información completa del recurso
const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(typeDict[type]);
const resources = computed(() => storeFetched.byResourceType(typeDict[type]));
const editedResource = computed(() => resources.value.find(({ pk }) => pk === selectedPk));

// A partir del recurso, hacemos una petición para traer sus features
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

watch(editedResource, async () => {
  features.value = await getFeatures(editedResource.value);
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
});
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="editedResource" id="principal" class="contenedor m-b-10">
        <div class="flex m-0 contenedor-botones">
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Acción a realizar"
            type="button"
          >
            <span class="pictograma-flecha-izquierda" aria-hidden="true" />
          </button>
          <p>Editar</p>
        </div>
        <CatalogoHeaderMetadatos
          :resource="editedResource"
          :title="'Atributos del Conjunto de Datos'"
        ></CatalogoHeaderMetadatos>

        <div class="contenedor-tabla p-2">
          <table v-if="datos.length > 0">
            >
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
            :key="`4-${selectedPk}-buttons`"
            :title="'UbicacionLicencias'"
            :pk="selectedPk"
            :tipo="type"
            :resource="editedResource"
          ></CatalogoBotonesMetadatos>
        </div>
      </main>
      <main v-else>
        <p>...cargando</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style></style>
