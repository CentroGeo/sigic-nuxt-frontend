<script setup>
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
if (props.resource.subtype === 'vector' && props.resource.resource_type === 'dataset') {
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

function validateAttributes(attribute_set) {
  const attributeList = Object.keys(attribute_set);
  const displayOrderList = attributeList.map((d) => attribute_set[d]['display_order']);
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
}

async function updateMetadata() {
  const requestBody = storeMetadatos.buildRequestBody();
  const isMetaValid = validateAttributes(requestBody.attribute_set);
  if (isMetaValid) {
    const token = data.value?.accessToken;
    const response = await $fetch('/api/metadatos', {
      method: 'POST',
      headers: { token: token, resourceType: resourceTypeGeonode[props.tipo], pk: props.pk },
      body: requestBody,
    });
    console.warn('La res:', response);
    const router = useRouter();
    router.go(0);
  } else {
    alert('Revisa la validez de los datos introducidos.');
  }
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
  </div>
</template>
