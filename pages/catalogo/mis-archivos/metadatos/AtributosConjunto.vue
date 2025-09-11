<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const storeFetched = useFetchedResources2Store();
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
const typeDict = {
  Documentos: 'document',
  'Capa geográfica': 'dataLayer',
  'Datos tabulados': 'dataTable',
};
storeFetched.checkFilling(typeDict[type]);
const resources = computed(() => storeFetched.byResourceType(typeDict[type]));
const editedResource = computed(() => resources.value.find(({ pk }) => pk === selectedPk));
const variables = [
  'Atributo',
  'Etiqueta',
  'Descripción',
  'Mostrar Orden',
  'Display type',
  'Visible',
];

const datos = [
  {
    Atributo: 'fid',
    Etiqueta: '',
    Descripción: '',
    'Mostrar Orden': '',
    'Display type': '',
    Visible: '',
  },
  {
    Atributo: 'g_id',
    Etiqueta: '',
    Descripción: '',
    'Mostrar Orden': '',
    'Display type': '',
    Visible: '',
  },
];
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
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
        <p class="h1 m-t-3">{{ editedResource.title }}</p>
        <p class="h2 m-0">Metadatos</p>
        <div class="contenedor-tabla p-2">
          <table>
            <caption>
              4. Atributos del conjunto de datos
            </caption>
            <thead>
              <tr>
                <th
                  v-for="(variable, v) in variables"
                  :id="`${idAleatorio}-col-${v}`"
                  :key="v"
                  scope="col"
                >
                  {{ variable }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(datum, d) in datos" :id="`${idAleatorio}-ren-${d}`" :key="d">
                <td>{{ datum['Atributo'] }}</td>
                <td>
                  <ClientOnly>
                    <SisdaiCampoBase
                      :id="datum['Etiqueta']"
                      v-model="datum['Etiqueta']"
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
                      tipo='"text"'
                      class="m-y-1"
                      :ejemplo="datum['Mostrar Orden']"
                    />
                  </ClientOnly>
                </td>
                <td>
                  <ClientOnly>
                    <SisdaiSelector v-model="datum['Display type']">
                      <option value="todos">Opcion 1</option>
                      <option value="catalogo">Opcion 2</option>
                    </SisdaiSelector>
                  </ClientOnly>
                </td>
                <td>
                  <input
                    id="cbox2"
                    v-model="datum['Visible']"
                    type="checkbox"
                    value="second_checkbox"
                  />
                  <label for="cbox2">Visible</label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style></style>
