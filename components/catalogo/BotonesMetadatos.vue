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
const isLoading = ref(false);
const wasUpdateSuccesful = ref(false);
const didUpdateFail = ref(false);
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
  const attributeList = Object.keys(body.attribute_set);
  const displayOrderList = attributeList.map((d) => Number(body.attribute_set[d]['display_order']));
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
}  */

function validateMeta(requestBody) {
  let status = false;
  const editedAbstract = requestBody.abstract?.replace(/\s/g, '') || '';
  if (!requestBody.title || requestBody.title.length === 0) {
    status = false;
    //console.log('titulo');
  } else if (editedAbstract.length < 30) {
    //console.log('abstract');
    status = false;
  } else if (!requestBody.date || requestBody.date.length === 0) {
    status = false;
    //console.log('date');
  } else if (requestBody.attribute_set) {
    const attributeList = Object.keys(requestBody.attribute_set);
    const displayOrderList = attributeList.map((d) =>
      Number(requestBody.attribute_set[d]['display_order'])
    );
    const setList = Array.from(new Set(displayOrderList));
    if (displayOrderList.length !== setList.length) {
      status = false;
    } else {
      status = true;
    }
  } else {
    status = true;
  }
  return status;
}

async function updateMetadata() {
  wasUpdateSuccesful.value = false;
  didUpdateFail.value = false;
  isLoading.value = true;
  const requestBody = storeMetadatos.buildRequestBody();
  const isMetaValid = validateMeta(requestBody);

  if (isMetaValid) {
    modalActualizar.value?.abrirModal();
    const token = data.value?.accessToken;
    const response = await $fetch('/api/metadatos', {
      method: 'POST',
      headers: { token: token, resourceType: resourceTypeGeonode[props.tipo], pk: props.pk },
      body: requestBody,
    });
    console.warn('La respuesta de la petición:', response);
    isLoading.value = false;
    if (response === 3) {
      wasUpdateSuccesful.value = true;
    } else {
      didUpdateFail.value = true;
    }
    //modalActualizar.value?.cerrarModal();
    //const router = useRouter();
    //router.go(0);
  } else {
    isLoading.value = false;
    alert('Revisa la validez de los datos introducidos.');
  }
}

function irAmisArchivos() {
  navigateTo({
    path: `/catalogo/mis-archivos/`,
  });
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
        aria-label="Ir a mis archivos"
        :disabled="props.title === firstButton ? true : false"
        @click="irARutaConQuery('anterior')"
      >
        Regresar
      </button>
      <!--<button class="boton-primario boton-chico" :disabled="false" @click="actualizaMetadatos()"> -->
      <button
        aria-label="Actualizar Metadatos"
        class="boton-primario boton-chico"
        :disabled="false"
        @click="updateMetadata"
      >
        Actualizar
      </button>
      <button
        v-if="props.title !== lastButton"
        aria-label="Siguiente"
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
          <div v-if="isLoading" class="flex m-y-2">
            <div class="columna-4 flex-vertical-centrado">
              <img src="/img/loader.gif" alt="...Cargando" />
            </div>
            <p class="columna-12">Actualizando información</p>
          </div>
          <div v-if="wasUpdateSuccesful" class="flex" style="gap: 0px">
            <p
              class="columna-14 texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion p-2 borde-redondeado-8"
            >
              <span class="pictograma-aprobado" /> Actualización exitosa.
            </p>
            <div class="columna-14 flex flex-contenido-final">
              <button class="boton-primario boton-chico" @click="irAmisArchivos">
                Ir a mis archivos
              </button>
            </div>
          </div>

          <div v-if="didUpdateFail" class="flex" style="gap: 0px">
            <p
              class="columna-14 texto-color-error fondo-color-error borde borde-color-error p-2 borde-redondeado-8"
            >
              <span class="pictograma-alerta" /> No pudimos actualizar toda la información. Revisa
              tu conexión e intentalo de nuevo más tarde.
            </p>
            <div class="columna-14 flex flex-contenido-final">
              <button class="boton-primario boton-chico" @click="irAmisArchivos">
                Ir a mis archivos
              </button>
            </div>
          </div>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>
<style lang="scss" scoped>
.align-rigth {
  margin-left: auto;
}
</style>
