<script setup>
/**TODO: agregar método para traer la info del usuario al store */
import { buildUrl } from '~/utils/consulta';
/**
 * @typedef {Object} Props
 * @property {Object} [recurso={}] - Indica el recurso que utiliza para comunicar a las rutas.
 * @property {Array} [opciones=[]] - Indica la o las opciones de navegación del menú.
 * @property {Boolean} [notificacion=false] - Indica si la notificación está activa o no.
 */
/** @type {Props} */
const props = defineProps({
  recurso: {
    type: Object,
    default: () => ({}),
  },
  opciones: { type: Array, default: Array },
  notificacion: { type: Boolean, default: false },
});

const { data } = useAuth();
const route = useRoute();

/**
 * Método para comparar si el recurso es documento, capa o tabla sin geometría
 * @param value del objeto opciones que tiene el texto
 * @returns verdadero o falso según cumpla las condiciones
 */
const conEstiloOSinGeometria = (value) => {
  // valida si hay algo en el recurso o está vacío
  if (Object.keys(props.recurso).length > 0) {
    if (props.recurso.resource_type === 'document') {
      // si es documento solo se puede editar los metadatos
      return value.texto === 'Metadatos';
    } else {
      // es dataset
      if (isGeometricExtension(props.recurso.extent)) {
        // si tiene geometría se puede editar el estilo y los metadatos de la capa
        return value.texto === 'Metadatos' || value.texto === 'Estilo';
      } else {
        // si no se puede unir mediante su clave geoestadística y editar metadatos de la tabla
        return value.texto === 'Metadatos' || value.texto === 'Clave Geoestadística';
      }
    }
  } else {
    return true;
  }
};
function irARutaConQuery(value) {
  if (
    value.texto === 'Metadatos' ||
    value.texto === 'Estilo' ||
    value.texto === 'Clave Geoestadística'
  ) {
    const tipoRecurso =
      props.recurso.resource_type === 'document'
        ? 'document'
        : isGeometricExtension(props.recurso.extent)
          ? 'dataLayer'
          : 'dataTable';

    navigateTo({
      path: value.ruta,
      query: { data: props.recurso.pk, type: tipoRecurso },
    });
  } else {
    navigateTo({
      path: value.ruta,
    });
  }
}
const esSuperusuario = ref(false);
async function verificarSiEsSuperusuario() {
  try {
    const configEnv = useRuntimeConfig();
    const { gnoxyFetch } = useGnoxyUrl();
    const userEmail = data.value?.user.email;
    const baseUrl = configEnv.public.geonodeApi;
    const queryParams = {
      page_size: 1,
      'filter{email}': userEmail,
    };

    // petición para traer solo el usuario que coincida con el parámetro email
    const url = buildUrl(`${baseUrl}/users`, queryParams);
    const request = await gnoxyFetch(url.toString());
    const res = await request.json();
    const userInfo = res.users;

    esSuperusuario.value = userInfo[0].is_superuser;
  } catch (error) {
    console.error(error);
  }
}
onMounted(async () => {
  await verificarSiEsSuperusuario();
});
</script>
<template>
  <div class="menu-mis-archivos p-t-5 p-b-3">
    <div class="flex">
      <template v-for="value in props.opciones">
        <div v-if="conEstiloOSinGeometria(value)" :key="value.texto">
          <div v-if="value.notificacion" class="notificacion">
            <div class="circulo"></div>
          </div>
          <button
            v-if="value.texto === 'Gestión de solicitudes' && esSuperusuario"
            :aria-label="`Ir a ${value.texto}`"
            class="boton-secundario header-link"
            type="button"
            @click="irARutaConQuery(value)"
          >
            {{ value.texto }}
            <div class="borde-enlace-hover"></div>
          </button>
          <button
            v-else
            :aria-label="`Ir a ${value.texto}`"
            class="boton-secundario header-link"
            type="button"
            @click="irARutaConQuery(value)"
          >
            {{ value.texto }}
            <div class="borde-enlace-hover"></div>
          </button>

          <div :class="route.path === value.ruta ? 'borde-enlace-activo' : ''"></div>
        </div>
      </template>
    </div>
    <div class="borde-b borde-color-secundario"></div>
  </div>
</template>

<style lang="scss" scoped>
.menu-mis-archivos {
  .flex {
    gap: 0px;
    .notificacion {
      position: relative;
      .circulo {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: var(--color-informativo-2);
        border-radius: 50%;
        right: 8px;
        top: 8px;
        z-index: 1;
      }
    }
    .borde-enlace-activo {
      position: relative;
      width: 32px;
      height: 4px;
      padding-bottom: 4px;
      border-radius: 2px 2px 0px 0px;
      background-color: var(--boton-primario-borde);
      text-align: center;
      margin: -4px auto 0;
    }
  }
}
.header-link {
  box-shadow: inherit;
  padding: inherit;
  padding: 16px 24px 16px 16px;
  position: relative;
  color: var(--texto-secundario);
  font-weight: 600;
  &:hover,
  &:focus {
    background-color: var(--boton-secundario-cursor-fondo);
    // background-color: transparent;
    .borde-enlace-hover {
      position: absolute;
      bottom: 0px;
      right: 0;
      left: 0;
      width: 32px;
      height: 4px;
      padding-bottom: 4px;
      margin: -4px auto 0;
      border-radius: 2px 2px 0px 0px;
      background-color: var(--boton-primario-borde);
    }
  }
}
</style>
