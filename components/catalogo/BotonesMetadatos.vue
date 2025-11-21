<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { resourceTypeGeonode } from '~/utils/consulta';
const storeMetadatos = useEditedMetadataStore();
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  pk: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: '',
  },
  resource: {
    type: Object,
    default: () => ({}),
  },
});
//const storeCatalogo = useCatalogoStore();
const { data } = useAuth();
const cargaExitosa = ref(false);
const modalActualizar = ref(null);
const rutas = ref({});
const lastButton = ref('');
const firstButton = 'MetadatosBasicos';
const rutasConAtributos = {
  MetadatosBasicos: { siguiente: 'UbicacionLicencias', anterior: undefined },
  UbicacionLicencias: { siguiente: 'MetadatosOpcionales', anterior: 'MetadatosBasicos' },
  MetadatosOpcionales: { siguiente: 'AtributosConjunto', anterior: 'UbicacionLicencias' },
  AtributosConjunto: { siguiente: undefined, anterior: 'MetadatosOpcionales' },
};
const rutasSinAtributos = {
  MetadatosBasicos: { siguiente: 'UbicacionLicencias', anterior: undefined },
  UbicacionLicencias: { siguiente: 'MetadatosOpcionales', anterior: 'MetadatosBasicos' },
  MetadatosOpcionales: { siguiente: undefined, anterior: 'UbicacionLicencias' },
};
if (
  props.resource.resource_type === 'dataset' &&
  props.resource.subtype === 'vector' &&
  props.resource.sourcetype !== 'REMOTE'
) {
  rutas.value = rutasConAtributos;
  lastButton.value = 'AtributosConjunto';
} else {
  rutas.value = rutasSinAtributos;
  lastButton.value = 'MetadatosOpcionales';
}
function irARutaConQuery(direccion) {
  navigateTo({
    path: `/catalogo/mis-archivos/editar/${rutas.value[props.title][direccion]}`,
    query: { data: props.pk, type: props.tipo },
  });
}

/* function validateAttributes(attribute_set) {
  const attributeList = Object.keys(attribute_set);
  const displayOrderList = attributeList.map((d) => Number(attribute_set[d]['display_order']));
  const setList = Array.from(new Set(displayOrderList));
  //console.log(displayOrderList);
  //console.log(setList);
  if (displayOrderList.length !== setList.length) {
    //console.log(false);
    return false;
  } else {
    //console.log(true);
    return true;
  }
} */

async function updateMetadata() {
  modalActualizar.value?.abrirModal();
  const requestBody = storeMetadatos.buildRequestBody();
  const token = data.value?.accessToken;
  //const isMetaValid = validateAttributes(requestBody.attribute_set);
  //console.warn(isMetaValid);
  const response = await $fetch('/api/metadatos', {
    method: 'POST',
    headers: { token: token, resourceType: resourceTypeGeonode[props.tipo], pk: props.pk },
    body: requestBody,
  });
  console.warn('La res:', response);
  modalActualizar.value?.cerrarModal();

  //console.log(requestBody);
  /*   const isMetaValid = validateAttributes(requestBody.attribute_set);
  if (isMetaValid) {
    const token = data.value?.accessToken;
    const response = await $fetch('/api/metadatos', {
      method: 'POST',
      headers: { token: token, resourceType: resourceTypeGeonode[props.tipo], pk: props.pk },
      body: requestBody,
    });
    //TODO: agregar manejo de errores
    console.warn('La res:', response);
    modalActualizar.value?.cerrarModal();
    const router = useRouter();
    router.go(0);
  } else {
    alert('Revisa la validez de los datos introducidos.');
  } */
}
/**
 * Actualiza los metadatos con los valores del store
 */

/*async function actualizaMetadatos() {
  // console.log(data.value?.accessToken);
  const response = await $fetch('/api/metadatos', {
    method: 'POST',
    body: {
      pk: props.resource.pk,
      resource_type: props.resource.resource_type,
      token: data.value?.accessToken,
      // TODO: faltan los demás valores
      abstract: storeCatalogo.metadatos.abstract,
    },
  });
  console.warn('response', response);
  cargaExitosa.value = true;
}*/
</script>
<template>
  <div>
    <div class="flex p-t-3">
      <nuxt-link class="boton-secundario boton-chico" type="button" to="/catalogo/mis-archivos"
        >Ir a mis archivos</nuxt-link
      >
      <button
        class="boton-secundario boton-chico"
        :disabled="props.title === firstButton ? true : false"
        @click="irARutaConQuery('anterior')"
      >
        Regresar
      </button>
      <!--<button class="boton-primario boton-chico" :disabled="false" @click="actualizaMetadatos()"> -->
      <button class="boton-primario boton-chico" :disabled="false" @click="updateMetadata">
        Actualizar
      </button>
      <button
        v-if="props.title !== lastButton"
        class="boton-primario boton-chico"
        :disabled="props.title === lastButton ? true : false"
        @click="irARutaConQuery('siguiente')"
      >
        Siguiente
      </button>
    </div>
    <p
      v-if="cargaExitosa"
      class="texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-4 p-3"
    >
      <span class="pictograma-aprobado" /> cargados con éxito
    </p>

    <ClientOnly>
      <SisdaiModal ref="modalActualizar">
        <template #encabezado>
          <h1></h1>
        </template>
        <template #cuerpo>
          <div class="flex m-y-2">
            <div class="columna-4 flex-vertical-centrado">
              <img src="/img/loader.gif" alt="...Cargando" />
            </div>
            <p class="columna-12">Actualizando información</p>
          </div>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>
